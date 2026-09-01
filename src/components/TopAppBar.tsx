import React from 'react';
import { ScreenType } from '../types';
import { USER_AVATAR } from '../data/mockData';

interface TopAppBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenSoilScan?: () => void;
  cartItemsCount: number;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentScreen,
  onNavigate,
  onOpenSearch,
  onOpenCart,
  onOpenSoilScan,
  cartItemsCount,
}) => {
  return (
    <>
      {/* Desktop Header */}
      <header className="w-full top-0 sticky bg-[#111A13]/95 backdrop-blur-md z-40 hidden md:flex border-b-2 border-[#1E2E21]">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div 
            className="flex items-center gap-3.5 cursor-pointer select-none group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-[#84CC16]/60 shrink-0">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                alt="farmin - Sustainable Farming & Agronomy"
                src={USER_AVATAR}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk',sans-serif] text-2xl font-extrabold text-[#F1F5F2] tracking-tight flex items-center gap-1.5 lowercase">
                farmin<span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse mb-1"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16]/80 flex items-center gap-1">
                Agronomy & Yield System
              </span>
            </div>
          </div>

          <nav className="hidden md:flex gap-1.5 items-center">
            <button
              onClick={() => onNavigate('home')}
              className={`font-['Plus_Jakarta_Sans',sans-serif] text-xs uppercase tracking-wider font-extrabold px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-2 border-2 ${
                currentScreen === 'home'
                  ? 'text-[#0B110D] bg-[#84CC16] border-[#84CC16] shadow-sm'
                  : 'text-[#9CAFA0] border-transparent hover:border-[#1E2E21] hover:bg-[#16241A] hover:text-[#F1F5F2]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  currentScreen === 'home' ? 'fill-icon' : ''
                }`}
              >
                home
              </span>
              Home
            </button>

            <button
              onClick={() => onNavigate('knowledge')}
              className={`font-['Plus_Jakarta_Sans',sans-serif] text-xs uppercase tracking-wider font-extrabold px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-2 border-2 ${
                currentScreen === 'knowledge'
                  ? 'text-[#0B110D] bg-[#84CC16] border-[#84CC16] shadow-sm'
                  : 'text-[#9CAFA0] border-transparent hover:border-[#1E2E21] hover:bg-[#16241A] hover:text-[#F1F5F2]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  currentScreen === 'knowledge' ? 'fill' : ''
                }`}
              >
                menu_book
              </span>
              Knowledge
            </button>

            <button
              onClick={() => onNavigate('products')}
              className={`font-['Plus_Jakarta_Sans',sans-serif] text-xs uppercase tracking-wider font-extrabold px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-2 border-2 ${
                currentScreen === 'products'
                  ? 'text-[#0B110D] bg-[#84CC16] border-[#84CC16] shadow-sm'
                  : 'text-[#9CAFA0] border-transparent hover:border-[#1E2E21] hover:bg-[#16241A] hover:text-[#F1F5F2]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  currentScreen === 'products' ? 'fill' : ''
                }`}
              >
                shopping_basket
              </span>
              Products
            </button>

            <button
              onClick={() => onNavigate('support')}
              className={`font-['Plus_Jakarta_Sans',sans-serif] text-xs uppercase tracking-wider font-extrabold px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-2 border-2 ${
                currentScreen === 'support'
                  ? 'text-[#0B110D] bg-[#84CC16] border-[#84CC16] shadow-sm'
                  : 'text-[#9CAFA0] border-transparent hover:border-[#1E2E21] hover:bg-[#16241A] hover:text-[#F1F5F2]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  currentScreen === 'support' ? 'fill' : ''
                }`}
              >
                support_agent
              </span>
              Support
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            {onOpenSoilScan && (
              <button
                onClick={onOpenSoilScan}
                className="h-10 px-3.5 flex items-center gap-2 rounded-lg border-2 border-[#84CC16]/60 bg-[#16241A] hover:bg-[#84CC16] hover:text-[#0B110D] text-[#84CC16] transition-all active:scale-95 font-extrabold text-xs uppercase tracking-wider shadow-sm group"
                title="Scan Soil Sample with Camera"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
                  camera
                </span>
                <span>Soil Scan</span>
              </button>
            )}

            <button
              onClick={onOpenSearch}
              aria-label="Search"
              className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-[#1E2E21] bg-[#16241A] hover:border-[#84CC16] hover:text-[#84CC16] text-[#F1F5F2] transition-all active:scale-95 font-bold"
              title="Search crops, fertilizers, guides"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            <button
              onClick={onOpenCart}
              aria-label="Shopping Cart"
              className="h-10 px-4 flex items-center gap-2 rounded-lg bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] border-2 border-[#84CC16] transition-all active:scale-95 relative font-extrabold text-xs uppercase tracking-wider shadow-sm"
              title="View Cart"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              <span>Cart</span>
              {cartItemsCount > 0 && (
                <span className="bg-[#0B110D] text-[#84CC16] text-[11px] font-black w-5 h-5 rounded flex items-center justify-center -mr-1">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile TopAppBar */}
      <header className="w-full top-0 sticky bg-[#111A13]/95 backdrop-blur-md z-40 md:hidden flex justify-between items-center px-4 h-16 border-b-2 border-[#1E2E21]">
        <div 
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-[#84CC16]/60 shrink-0">
            <img
              className="w-full h-full object-cover"
              alt="farmin Brand Icon"
              src={USER_AVATAR}
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-['Space_Grotesk',sans-serif] text-xl font-extrabold text-[#F1F5F2] tracking-tight flex items-center gap-1 lowercase">
            farmin<span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] animate-pulse"></span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSoilScan && (
            <button
              onClick={onOpenSoilScan}
              aria-label="Scan Soil"
              className="h-9 px-2.5 flex items-center gap-1.5 rounded-lg border-2 border-[#84CC16]/60 bg-[#16241A] text-[#84CC16] active:scale-95 transition-transform text-xs font-bold font-['Space_Grotesk',sans-serif]"
              title="Scan Soil Sample"
            >
              <span className="material-symbols-outlined text-[18px]">camera</span>
              <span>Scan</span>
            </button>
          )}

          <button
            onClick={onOpenSearch}
            aria-label="Search"
            className="h-9 w-9 flex items-center justify-center rounded-lg border-2 border-[#1E2E21] bg-[#16241A] text-[#F1F5F2] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          
          <button
            onClick={onOpenCart}
            aria-label="Shopping Cart"
            className="h-9 px-3 flex items-center gap-1.5 rounded-lg bg-[#84CC16] text-[#0B110D] border-2 border-[#84CC16] active:scale-95 transition-transform relative font-bold text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            {cartItemsCount > 0 && (
              <span className="bg-[#0B110D] text-[#84CC16] text-[10px] font-black w-4 h-4 rounded flex items-center justify-center -mr-1">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  );
};

