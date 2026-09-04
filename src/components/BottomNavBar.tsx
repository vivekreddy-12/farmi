import React from 'react';
import { ScreenType, UserProfile } from '../types';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  cartItemsCount: number;
  user?: UserProfile;
  onOpenLogin?: () => void;
  onOpenAccount?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onNavigate,
  user,
  onOpenLogin,
  onOpenAccount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 bg-[#111A13]/95 backdrop-blur-md border-t-2 border-[#1E2E21] pb-safe">
      <div className="flex justify-around items-center h-16 w-full px-2">
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-95 py-1 px-3 rounded-lg ${
            currentScreen === 'home'
              ? 'bg-[#84CC16] text-[#0B110D] font-black'
              : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] mb-0.5 ${
              currentScreen === 'home' ? 'fill-icon' : ''
            }`}
          >
            home
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase font-bold tracking-wider leading-none">
            Home
          </span>
        </button>

        {/* Knowledge */}
        <button
          onClick={() => onNavigate('knowledge')}
          className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-95 py-1 px-3 rounded-lg ${
            currentScreen === 'knowledge'
              ? 'bg-[#84CC16] text-[#0B110D] font-black'
              : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] mb-0.5 ${
              currentScreen === 'knowledge' ? 'fill' : ''
            }`}
          >
            menu_book
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase font-bold tracking-wider leading-none">
            Knowledge
          </span>
        </button>

        {/* Products */}
        <button
          onClick={() => onNavigate('products')}
          className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-95 py-1 px-3 rounded-lg ${
            currentScreen === 'products'
              ? 'bg-[#84CC16] text-[#0B110D] font-black'
              : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] mb-0.5 ${
              currentScreen === 'products' ? 'fill' : ''
            }`}
          >
            shopping_basket
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase font-bold tracking-wider leading-none">
            Products
          </span>
        </button>

        {/* Support */}
        <button
          onClick={() => onNavigate('support')}
          className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-95 py-1 px-3 rounded-lg ${
            currentScreen === 'support'
              ? 'bg-[#84CC16] text-[#0B110D] font-black'
              : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] mb-0.5 ${
              currentScreen === 'support' ? 'fill' : ''
            }`}
          >
            support_agent
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase font-bold tracking-wider leading-none">
            Support
          </span>
        </button>

        {/* Account / Login */}
        <button
          onClick={() => {
            if (user?.isLoggedIn) {
              onOpenAccount?.();
            } else {
              onOpenLogin?.();
            }
          }}
          className="flex flex-col items-center justify-center transition-all duration-150 active:scale-95 py-1 px-3 rounded-lg text-[#9CAFA0] hover:text-[#F1F5F2]"
        >
          <span className="material-symbols-outlined text-[22px] mb-0.5 text-[#84CC16]">
            {user?.isLoggedIn ? 'account_circle' : 'login'}
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase font-bold tracking-wider leading-none">
            {user?.isLoggedIn ? 'Account' : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
};
