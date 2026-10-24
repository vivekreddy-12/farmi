import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { ScreenType, CropGuide, Product, Order, OrderItem, FarmLocation, ConsultationBooking, UserProfile } from './types';
import {
  INITIAL_PRODUCTS,
  CROP_GUIDES,
  INITIAL_ORDERS,
  FARM_LOCATIONS,
  FAQS,
  GUEST_USER_PROFILE,
} from './data/mockData';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  fetchFarmerProfile,
  saveFarmerProfile,
  fetchFarmerOrders,
  saveFarmerOrder,
  signOutFarmer,
} from './services/supabaseService';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeScreen } from './components/HomeScreen';
import { KnowledgeScreen } from './components/KnowledgeScreen';
import { ProductsScreen } from './components/ProductsScreen';
import { SupportScreen } from './components/SupportScreen';
import { CropGuideModal } from './components/CropGuideModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { LiveChatModal } from './components/LiveChatModal';
import { LocationModal } from './components/LocationModal';
import { CropCareModal } from './components/CropCareModal';
import { SearchModal } from './components/SearchModal';
import { ApplicationGuidesModal } from './components/ApplicationGuidesModal';
import { VideoTutorialsModal } from './components/VideoTutorialsModal';
import { SoilScanModal } from './components/SoilScanModal';
import { AuthModal } from './components/AuthModal';
import { UserAccountModal } from './components/UserAccountModal';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('farmin_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return GUEST_USER_PROFILE;
  });

  // Whether the guest has chosen to browse without signing in
  const [guestBypass, setGuestBypass] = useState(false);

  // App State
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cropGuides] = useState<CropGuide[]>(CROP_GUIDES);
  const [recentOrders, setRecentOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [currentLocation, setCurrentLocation] = useState<FarmLocation>(FARM_LOCATIONS[0]);
  
  // Cart State
  const [cartItems, setCartItems] = useState<OrderItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 2 },
    { product: INITIAL_PRODUCTS[1], quantity: 1 },
  ]);

  // Modal / Drawer States
  const [selectedCropGuide, setSelectedCropGuide] = useState<CropGuide | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCropCareModalOpen, setIsCropCareModalOpen] = useState(false);
  const [isSoilScanOpen, setIsSoilScanOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAppGuidesOpen, setIsAppGuidesOpen] = useState(false);
  const [isVideoTutorialsOpen, setIsVideoTutorialsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync session and orders with Supabase on mount
  useEffect(() => {
    async function initSupabaseSession() {
      if (!isSupabaseConfigured) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await fetchFarmerProfile(session.user.id);
          if (profile) {
            setCurrentUser(profile);
          } else {
            const meta = session.user.user_metadata || {};
            setCurrentUser({
              id: session.user.id,
              name: meta.full_name || session.user.email?.split('@')[0] || 'Grower',
              email: session.user.email || '',
              phone: meta.phone || '',
              farmName: meta.farm_name || 'My Farmstead',
              location: 'Select Location',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
              isLoggedIn: true,
              memberSince: 'October 2026',
              kisanId: `FARMIN-${session.user.id.slice(0, 4).toUpperCase()}`,
              role: 'Verified Grower',
            });
          }

          // Fetch orders stored in Supabase
          const cloudOrders = await fetchFarmerOrders(session.user.id);
          if (cloudOrders && cloudOrders.length > 0) {
            setRecentOrders(cloudOrders);
          }
        }
      } catch (err) {
        console.error('[farmin] Failed to restore Supabase session:', err);
      }

      // Listen to Supabase Auth State changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await fetchFarmerProfile(session.user.id);
          if (profile) {
            setCurrentUser(profile);
          }
          const cloudOrders = await fetchFarmerOrders(session.user.id);
          if (cloudOrders && cloudOrders.length > 0) {
            setRecentOrders(cloudOrders);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(GUEST_USER_PROFILE);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initSupabaseSession();
  }, []);

  // Persist fallback to local storage
  useEffect(() => {
    try {
      localStorage.setItem('farmin_user', JSON.stringify(currentUser));
    } catch {
      // Ignore
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    if (isSupabaseConfigured && user.id && user.id !== 'guest') {
      const orders = await fetchFarmerOrders(user.id);
      if (orders && orders.length > 0) {
        setRecentOrders(orders);
      }
    }
    showToast(`Welcome, ${user.name}! Connected to farmin Cloud`);
  };

  const handleUpdateUser = async (updated: UserProfile) => {
    setCurrentUser(updated);
    if (isSupabaseConfigured && updated.id && updated.id !== 'guest') {
      await saveFarmerProfile(updated);
      showToast('Grower profile synced to Supabase Cloud');
    } else {
      showToast('Grower profile updated locally');
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await signOutFarmer();
    }
    setCurrentUser(GUEST_USER_PROFILE);
    setGuestBypass(false);
    try {
      localStorage.removeItem('farmin_user');
    } catch {}
    showToast('Signed out. Switched to Guest Farmer mode.');
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${product.name} to cart`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is OrderItem => item !== null)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart');
  };

  const handleCheckoutComplete = async (newOrder: Order) => {
    setRecentOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);

    if (isSupabaseConfigured && currentUser.isLoggedIn && currentUser.id !== 'guest') {
      await saveFarmerOrder(newOrder, currentUser.id);
      showToast(`Order ${newOrder.orderNumber} saved to Supabase! Receipt sent.`);
    } else {
      showToast(`Order ${newOrder.orderNumber} placed! Receipt sent to ${currentUser.email || 'farmer'}`);
    }
  };

  const handleBookConsultation = (booking: Omit<ConsultationBooking, 'id' | 'status'>) => {
    showToast(`Consultation scheduled for ${booking.fullName}!`);
  };

  const handleOrderSpecificProduct = (productName: string) => {
    const found = products.find(
      (p) =>
        p.name.toLowerCase().includes(productName.toLowerCase()) ||
        productName.toLowerCase().includes(p.name.toLowerCase())
    );
    if (found) {
      handleAddToCart(found);
      setIsCartOpen(true);
    } else {
      setCurrentScreen('products');
    }
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Gate: unauthenticated visitors land on the dedicated login page first,
  // unless they explicitly choose to browse as a guest.
  if (!currentUser.isLoggedIn && !guestBypass) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={() => setGuestBypass(true)}
        defaultEmail="njersey382@gmail.com"
      />
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0B110D] text-[#F1F5F2] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-[#84CC16] selection:text-[#0B110D]">
      {/* Background Dark Farm Photography Layers */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: `url('/src/assets/images/dark_farm_field_1788272012797.jpg')`,
        }}
      />
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-10 mix-blend-overlay bg-cover bg-bottom bg-no-repeat"
        style={{
          backgroundImage: `url('/src/assets/images/organic_soil_farm_1788271809867.jpg')`,
        }}
      />

      {/* Global Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-bounce bg-[#16241A] border-2 border-[#84CC16] text-[#F1F5F2] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Bar */}
      <TopAppBar
        currentLocation={currentLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenLiveChat={() => setIsLiveChatOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartItemCount={totalCartCount}
        user={currentUser}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow z-10 pb-28 pt-20 px-3 sm:px-6 max-w-7xl mx-auto w-full">
        {currentScreen === 'home' && (
          <HomeScreen
            cropGuides={cropGuides}
            products={products}
            recentOrders={recentOrders}
            currentLocation={currentLocation}
            onSelectCropGuide={(guide) => setSelectedCropGuide(guide)}
            onOrderCropFertilizer={handleOrderSpecificProduct}
            onOrderFertilizer={() => setCurrentScreen('products')}
            onOpenCropCare={() => setIsCropCareModalOpen(true)}
            onOpenSoilScan={() => setIsSoilScanOpen(true)}
            onViewProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            onViewAllProducts={() => setCurrentScreen('products')}
            onViewOrder={(ord) => setSelectedOrder(ord)}
            onOpenConsultation={() => {
              setCurrentScreen('support');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            user={currentUser}
            onOpenLogin={() => setIsAuthModalOpen(true)}
            onOpenAccount={() => setIsAccountModalOpen(true)}
          />
        )}

        {currentScreen === 'knowledge' && (
          <KnowledgeScreen
            cropGuides={cropGuides}
            onSelectCropGuide={(guide) => setSelectedCropGuide(guide)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentScreen === 'products' && (
          <ProductsScreen
            products={products}
            onAddToCart={handleAddToCart}
            onViewProduct={(p) => setSelectedProduct(p)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentScreen === 'support' && (
          <SupportScreen
            faqs={FAQS}
            onOpenLiveChat={() => setIsLiveChatOpen(true)}
            onBookConsultation={handleBookConsultation}
            onOpenApplicationGuides={() => setIsAppGuidesOpen(true)}
            onOpenVideoTutorials={() => setIsVideoTutorialsOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavBar
        currentScreen={currentScreen}
        onNavigate={(s) => {
          setCurrentScreen(s);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals & Drawers */}
      <CropGuideModal
        cropGuide={selectedCropGuide}
        isOpen={Boolean(selectedCropGuide)}
        onClose={() => setSelectedCropGuide(null)}
        onOrderFertilizer={(cropName) => {
          setSelectedCropGuide(null);
          handleOrderSpecificProduct(cropName);
        }}
      />

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onReorder={(order) => {
          order.items.forEach((item) => handleAddToCart(item.product, item.quantity));
          setSelectedOrder(null);
          setIsCartOpen(true);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutComplete={handleCheckoutComplete}
      />

      <LiveChatModal
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
        onOrderRecommended={(pName) => {
          setIsLiveChatOpen(false);
          handleOrderSpecificProduct(pName);
        }}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        locations={FARM_LOCATIONS}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc);
          showToast(`Location set to ${loc.name}, ${loc.state}`);
        }}
      />

      <CropCareModal
        isOpen={isCropCareModalOpen}
        onClose={() => setIsCropCareModalOpen(false)}
        onOrderProduct={(pName) => {
          setIsCropCareModalOpen(false);
          handleOrderSpecificProduct(pName);
        }}
      />

      <SoilScanModal
        isOpen={isSoilScanOpen}
        onClose={() => setIsSoilScanOpen(false)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onViewProductDetails={(p) => {
          setIsSoilScanOpen(false);
          setSelectedProduct(p);
        }}
        products={products}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        cropGuides={cropGuides}
        products={products}
        faqs={FAQS}
        onSelectCropGuide={(g) => setSelectedCropGuide(g)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <ApplicationGuidesModal
        isOpen={isAppGuidesOpen}
        onClose={() => setIsAppGuidesOpen(false)}
      />

      <VideoTutorialsModal
        isOpen={isVideoTutorialsOpen}
        onClose={() => setIsVideoTutorialsOpen(false)}
      />

      {/* User Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultEmail="njersey382@gmail.com"
        defaultPhone="9391216686"
      />

      {/* User Account / Profile Modal */}
      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        orders={recentOrders}
        onOpenOrder={(ord) => {
          setIsAccountModalOpen(false);
          setSelectedOrder(ord);
        }}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
