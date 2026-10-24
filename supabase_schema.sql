-- ============================================================
-- farmin Agro - Supabase Database Schema
-- Run this script in your Supabase SQL Editor (supabase.com)
-- ============================================================

-- 1. Create profiles table (Farmer details linked to Supabase Auth)
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

-- 2. Create orders table (Farmer fertilizer orders)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  farmer_id uuid references auth.users(id) on delete set null,
  order_number text unique not null,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric not null default 0,
  delivery_address text,
  payment_status text default 'Paid',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can insert their own orders" on public.orders;

-- Profile Policies: Farmers can view, insert, and update their own profile
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Order Policies: Farmers can view and create their own orders
create policy "Users can view their own orders" 
  on public.orders for select 
  using (auth.uid() = farmer_id);

create policy "Users can insert their own orders" 
  on public.orders for insert 
  with check (auth.uid() = farmer_id);

-- 4. Automatic profile generation on auth.users registration trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, farm_name, kisan_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'farm_name', 'My Farmstead'),
    'FARMIN-' || floor(1000 + random() * 9000)::text
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
