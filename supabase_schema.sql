-- ============================================================
-- farmin Agro - Supabase Database Schema
-- Run this script in your Supabase SQL Editor (supabase.com).
-- Safe to run more than once.
-- ============================================================

-- 1. Farmer profiles (one row per signed-up user, linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text,
  phone text,
  farm_name text default 'My Farmstead',
  location text default 'Select Location',
  kisan_id text,
  avatar_url text,
  role text default 'Verified Grower',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);
alter table public.profiles add column if not exists crop_type text;

-- 2. Farmer orders
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  farmer_id uuid references auth.users(id) on delete set null,
  order_number text unique not null,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric not null default 0,
  delivery_address text,
  payment_status text default 'Pending',
  created_at timestamptz default timezone('utc'::text, now()) not null
);
-- Everything else about the order (tax, shipping, discount, payment method,
-- receipt contacts, tracking...) so a reloaded order looks exactly as placed.
alter table public.orders add column if not exists details jsonb not null default '{}'::jsonb;
alter table public.orders alter column farmer_id set default auth.uid();
alter table public.orders alter column payment_status set default 'Pending';

alter table public.orders drop constraint if exists orders_total_nonnegative;
alter table public.orders add constraint orders_total_nonnegative check (total_amount >= 0);
alter table public.orders drop constraint if exists orders_payload_size;
alter table public.orders add constraint orders_payload_size
  check (pg_column_size(items) < 200000 and pg_column_size(details) < 200000);

-- 3. Row Level Security: a farmer can only ever see and change their own rows
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can insert their own orders" on public.orders;

create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can view their own orders"
  on public.orders for select to authenticated
  using ((select auth.uid()) = farmer_id);

create policy "Users can insert their own orders"
  on public.orders for insert to authenticated
  with check ((select auth.uid()) = farmer_id);

-- 4. Column-level limits. RLS controls which rows; this controls which columns.
-- A farmer cannot rewrite their own role, kisan_id or timestamps, and orders
-- cannot be edited or deleted from the browser once placed.
revoke all on public.profiles from anon, authenticated;
revoke all on public.orders   from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, full_name, email, phone, farm_name, location, avatar_url) on public.profiles to authenticated;
grant update (full_name, phone, farm_name, location, avatar_url) on public.profiles to authenticated;
grant select on public.orders to authenticated;
grant insert (farmer_id, order_number, items, total_amount, delivery_address, payment_status, details)
  on public.orders to authenticated;

-- 5. Keep updated_at honest
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 6. Create the profile automatically when someone signs up (email, phone or Google).
-- Phone sign-ups have no name or email, so the name falls back to 'Farmer'
-- instead of NULL (a NULL would break sign-up on the NOT NULL column).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  crop text := nullif(new.raw_user_meta_data->>'crop_type', '');
begin
  insert into public.profiles (id, full_name, email, phone, farm_name, kisan_id, crop_type, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Farmer'
    ),
    new.email,
    coalesce(nullif(new.phone, ''), nullif(new.raw_user_meta_data->>'phone', '')),
    coalesce(nullif(new.raw_user_meta_data->>'farm_name', ''), 'My Farmstead'),
    'FARMIN-' || floor(100000 + random() * 900000)::text,
    crop,
    case when crop is not null then 'Grower (' || crop || ')' else 'Verified Grower' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Only the database itself should run this, never a browser.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
