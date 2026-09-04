import React from 'react';
import { Product, Order, FarmLocation, UserProfile } from '../types';
import { TiltCard } from './TiltCard';
import { WeatherAtmosphereCanvas } from './WeatherAtmosphereCanvas';
import { sounds } from '../utils/soundEffects';

interface HomeScreenProps {
  currentLocation: FarmLocation;
  onChangeLocation: () => void;
  featuredProducts: Product[];
  recentOrders: Order[];
  onOrderFertilizer: () => void;
  onOpenCropCare: () => void;
  onOpenSoilScan?: () => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewAllProducts: () => void;
  onViewOrder: (order: Order) => void;
  onOpenConsultation: () => void;
  user?: UserProfile;
  onOpenLogin?: () => void;
  onOpenAccount?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentLocation,
  onChangeLocation,
  featuredProducts,
  recentOrders,
  onOrderFertilizer,
  onOpenCropCare,
  onOpenSoilScan,
  onViewProduct,
  onAddToCart,
  onViewAllProducts,
  onViewOrder,
  onOpenConsultation,
  user,
  onOpenLogin,
  onOpenAccount,
}) => {
  const isUserLoggedIn = !!user?.isLoggedIn;
  const greetingName = isUserLoggedIn ? user.name.split(' ')[0] : 'Farmer';

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-5 py-6 space-y-6 pb-24 md:pb-12">
      {/* Location Bar with Change option */}
      <div className="flex items-center justify-between bg-[#111A13]/90 backdrop-blur-sm px-4 py-3 rounded-xl border-2 border-[#1E2E21] shadow-sm">
        <div className="flex items-center gap-2.5 text-[#F1F5F2]">
          <span className="material-symbols-outlined text-[#84CC16] fill-icon text-[20px]">
            location_on
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-sm font-bold tracking-tight text-[#F1F5F2]">
            {currentLocation.name}, {currentLocation.state}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#84CC16] hidden sm:inline">
            • {currentLocation.sprayCondition} Spray Window
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isUserLoggedIn ? (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAccount?.();
              }}
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#84CC16] bg-[#16241A] px-2.5 py-1 rounded-lg border border-[#1E2E21] hover:border-[#84CC16] font-mono"
            >
              <span className="w-2 h-2 rounded-full bg-[#84CC16]" />
              <span>{user?.email || 'njersey382@gmail.com'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenLogin?.();
              }}
              className="text-[#84CC16] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider font-extrabold flex items-center gap-1 bg-[#16241A] px-3 py-1.5 rounded-lg border border-[#84CC16] hover:bg-[#84CC16] hover:text-[#0B110D] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              Sign In
            </button>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              onChangeLocation();
            }}
            className="text-[#F1F5F2] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider font-extrabold flex items-center gap-1 bg-[#16241A] px-3 py-1.5 rounded-lg border border-[#1E2E21] hover:border-[#84CC16] hover:text-[#84CC16] active:scale-95 transition-all"
          >
            Change
            <span className="material-symbols-outlined text-sm font-bold">expand_more</span>
          </button>
        </div>
      </div>

      {/* Guest Mode Banner Prompt */}
      {!isUserLoggedIn && (
        <div className="bg-[#16241A] p-4 rounded-xl border-2 border-[#84CC16]/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B110D] border border-[#84CC16] flex items-center justify-center text-[#84CC16] shrink-0">
              <span className="material-symbols-outlined text-[22px]">account_circle</span>
            </div>
            <div>
              <div className="text-xs font-['Space_Grotesk',sans-serif] font-black uppercase text-[#F1F5F2]">
                Sign in to your farmin Agro Account
              </div>
              <div className="text-[11px] text-[#9CAFA0] mt-0.5">
                Automatically sync order invoices to <strong>njersey382@gmail.com</strong>, save GPS field zones, and claim grower subsidies.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLogin?.();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-sm shrink-0 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Welcome & Weather Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Greeting Card with Tilt and Farm Photo Texture */}
        <TiltCard
          maxTilt={4}
          glareOpacity={0.08}
          className="col-span-1 md:col-span-2 bg-[#111A13]/90 backdrop-blur-sm rounded-xl p-6 sm:p-8 border-2 border-[#1E2E21] shadow-sm flex flex-col justify-between min-h-[240px] relative overflow-hidden"
        >
          {/* Farm Photo Ambient Background Watermark */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-15 bg-cover bg-right-top mix-blend-screen"
            style={{ backgroundImage: `url('/src/assets/images/dark_farm_field_1788272012797.jpg')` }}
          />

          <div className="relative z-10">
            <div className="inline-block bg-[#84CC16] text-[#0B110D] text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-3">
              Daily Farm Advisory
            </div>
            <h1 className="font-['Space_Grotesk',sans-serif] text-3xl sm:text-4xl font-extrabold text-[#F1F5F2] mb-2 tracking-tight">
              Good morning, {greetingName}.
            </h1>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-base text-[#9CAFA0] leading-relaxed max-w-2xl font-medium">
              Soil nutrient levels are optimal across all zones. High photosynthetic activity indicates an ideal window for applying nitrogen to the North Field.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-[#1E2E21] flex-wrap">
            <button
              onClick={() => {
                sounds.playClick();
                onOrderFertilizer();
              }}
              data-cursor-label="ORDER"
              className="bg-[#84CC16] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest font-extrabold px-5 py-3.5 rounded-lg flex items-center justify-center gap-2 min-h-[48px] flex-1 sm:flex-none hover:bg-[#99E321] border-2 border-[#84CC16] transition-colors active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Order Fertilizer
            </button>

            {onOpenSoilScan && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenSoilScan();
                }}
                data-cursor-label="SCAN"
                className="bg-[#16241A] text-[#84CC16] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest font-extrabold px-5 py-3.5 rounded-lg flex items-center justify-center gap-2 min-h-[48px] flex-1 sm:flex-none border-2 border-[#84CC16]/60 hover:bg-[#84CC16] hover:text-[#0B110D] transition-all active:scale-95 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">camera</span>
                Soil Optical Scan
              </button>
            )}

            <button
              onClick={() => {
                sounds.playClick();
                onOpenCropCare();
              }}
              data-cursor-label="DIAGNOSE"
              className="bg-[#16241A] text-[#F1F5F2] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest font-extrabold px-5 py-3.5 rounded-lg flex items-center justify-center gap-2 min-h-[48px] flex-1 sm:flex-none border-2 border-[#1E2E21] hover:border-[#84CC16] hover:text-[#84CC16] transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">agriculture</span>
              Crop Care Assistant
            </button>
          </div>
        </TiltCard>

        {/* Weather Widget with Atmospheric Physics Canvas & 3D Tilt */}
        <TiltCard
          maxTilt={6}
          glareOpacity={0.2}
          className="col-span-1 bg-[#0E1A11] text-[#F1F5F2] rounded-xl p-6 border-2 border-[#1E2E21] shadow-sm flex flex-col justify-between relative overflow-hidden"
        >
          {/* Real-time Atmospheric canvas */}
          <WeatherAtmosphereCanvas condition={currentLocation.condition} />

          <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined fill-icon text-[140px] text-[#84CC16]">
              sunny
            </span>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-widest text-[#84CC16]">
                Farm Weather
              </span>
              <span className="material-symbols-outlined fill-icon text-2xl text-[#84CC16]">
                partly_cloudy_day
              </span>
            </div>

            <div className="font-['Space_Grotesk',sans-serif] text-5xl font-black leading-tight tracking-tighter mb-1 text-[#F1F5F2]">
              {currentLocation.temperatureF}°F
            </div>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm text-[#9CAFA0] mb-5 font-semibold">
              {currentLocation.condition}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="bg-[#16241A]/80 backdrop-blur-xs p-3 rounded-lg border border-[#1E2E21]">
                <span className="block font-['Space_Grotesk',sans-serif] text-[10px] uppercase font-bold tracking-wider text-[#9CAFA0]">
                  Humidity
                </span>
                <span className="font-['Space_Grotesk',sans-serif] text-lg font-black text-[#F1F5F2]">
                  {currentLocation.humidity}
                </span>
              </div>
              <div className="bg-[#16241A]/80 backdrop-blur-xs p-3 rounded-lg border border-[#1E2E21]">
                <span className="block font-['Space_Grotesk',sans-serif] text-[10px] uppercase font-bold tracking-wider text-[#9CAFA0]">
                  Wind
                </span>
                <span className="font-['Space_Grotesk',sans-serif] text-lg font-black text-[#F1F5F2]">
                  {currentLocation.wind}
                </span>
              </div>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* Featured Products Horizontal Scroll */}
      <section className="space-y-3 pt-2">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-['Space_Grotesk',sans-serif] text-2xl font-extrabold text-[#F1F5F2] tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs font-medium text-[#9CAFA0]">High-efficiency commercial fertilizers in stock</p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onViewAllProducts();
            }}
            className="text-[#84CC16] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider font-extrabold flex items-center hover:underline group"
          >
            View Catalog{' '}
            <span className="material-symbols-outlined text-sm ml-1 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
          {featuredProducts.map((product) => (
            <TiltCard
              key={product.id}
              maxTilt={7}
              glareOpacity={0.12}
              onClick={() => {
                sounds.playClick();
                onViewProduct(product);
              }}
              data-cursor-label="VIEW"
              className="min-w-[280px] w-[280px] bg-[#111A13] rounded-xl border-2 border-[#1E2E21] snap-start flex flex-col hover:border-[#84CC16]/60 transition-all duration-200 cursor-pointer group"
            >
              <div className="h-40 bg-[#16241A] rounded-t-lg relative overflow-hidden group">
                <img
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={product.image}
                />
                {product.badge && (
                  <div className="absolute top-2 right-2 bg-[#84CC16] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                    {product.badge}
                  </div>
                )}
                {product.npkRatio && (
                  <div className="absolute bottom-2 left-2 bg-[#0B110D]/90 text-[#84CC16] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#1E2E21]">
                    NPK {product.npkRatio}
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2] mb-1 line-clamp-1 group-hover:text-[#84CC16] transition-colors">
                  {product.name}
                </h3>
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#9CAFA0] mb-4 flex-grow line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex justify-between items-center mt-auto pt-3 border-t border-[#1E2E21]">
                  <div>
                    <span className="font-['Space_Grotesk',sans-serif] text-xl font-black text-[#F1F5F2]">
                      ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[11px] font-bold text-[#84CC16]/80 uppercase">
                      {product.weightOrVolume}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playSuccess();
                      onAddToCart(product);
                    }}
                    data-cursor-label="ADD"
                    aria-label={`Add ${product.name} to cart`}
                    className="bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] p-2.5 rounded-lg transition-all active:scale-90 border-2 border-[#84CC16]"
                    title="Add to cart"
                  >
                    <span className="material-symbols-outlined text-[18px] block font-bold">add</span>
                  </button>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Recent Orders Summary */}
      <section className="space-y-3 pb-6">
        <div className="flex justify-between items-center">
          <h2 className="font-['Space_Grotesk',sans-serif] text-2xl font-extrabold text-[#F1F5F2] tracking-tight">
            Recent Orders
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider text-[#84CC16]">2 Active Shipments</span>
        </div>

        <div className="bg-[#111A13] rounded-xl border-2 border-[#1E2E21] overflow-hidden divide-y-2 divide-[#1E2E21]">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onViewOrder(order)}
              className="p-4 flex justify-between items-center hover:bg-[#16241A] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg border-2 border-[#1E2E21] flex items-center justify-center shrink-0 ${
                    order.status === 'In Transit'
                      ? 'bg-[#84CC16] text-[#0B110D]'
                      : 'bg-[#16241A] text-[#84CC16]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {order.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-['Space_Grotesk',sans-serif] text-sm font-extrabold text-[#F1F5F2]">
                      {order.orderNumber}
                    </h4>
                    {order.paymentDetails && (
                      <span className="text-[9px] font-mono font-bold bg-[#16241A] text-[#84CC16] px-1.5 py-0.5 rounded border border-[#1E2E21]">
                        {order.paymentDetails.method.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#9CAFA0] mt-0.5">
                    {order.status === 'In Transit'
                      ? `Arriving Tomorrow • ${order.itemsCount} items`
                      : `${order.date} • ${order.itemsCount} items`}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="block font-['Space_Grotesk',sans-serif] text-base font-black text-[#F1F5F2]">
                  ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className="inline-block font-['Space_Grotesk',sans-serif] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-[#1E2E21] bg-[#16241A] text-[#84CC16] mt-1"
                >
                  {order.statusBadge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Button (FAB) for Scheduling Consultation */}
      <button
        onClick={onOpenConsultation}
        className="fixed right-5 bottom-20 md:bottom-6 bg-[#84CC16] text-[#0B110D] p-4 rounded-xl hover:bg-[#99E321] transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 z-40 h-[54px] min-w-[54px] md:min-w-auto group border-2 border-[#84CC16] shadow-lg"
        title="Schedule Soil Specialist Session"
      >
        <span className="material-symbols-outlined text-[22px] font-bold">calendar_month</span>
        <span className="font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest font-black pr-2 hidden md:block whitespace-nowrap">
          Book Specialist
        </span>
      </button>
    </div>
  );
};
