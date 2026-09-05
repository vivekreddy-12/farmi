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

  useEffect(() => {
    try {
      localStorage.setItem('farmin_user', JSON.stringify(currentUser));
    } catch {
      // Ignore
    }
  }, [currentUser]);

  // App State
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cropGuides] = useState<CropGuide[]>(CROP_GUIDES);
  const [recentOrders, setRecentOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [currentLocation, setCurrentLocation] = useState<FarmLocation>(FARM_LOCATIONS[0]);
  
  // Cart State
  const [cartItems, setCartItems] = useState<OrderItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 2 }, // 2 bags of Pro-Gro Nitrogen Plus
    { product: INITIAL_PRODUCTS[1], quantity: 1 }, // 1 gal EcoBalance
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
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(`Welcome, ${user.name}! Connected as ${user.email}`);
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    showToast('Grower profile updated');
  };

  const handleLogout = () => {
    setCurrentUser(GUEST_USER_PROFILE);
    setGuestBypass(false);
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

  const handleCheckoutComplete = (newOrder: Order) => {
    setRecentOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    showToast(`Order ${newOrder.orderNumber} placed! Receipt sent to ${currentUser.email || 'njersey382@gmail.com'}`);
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
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial from-transparent via-[#0B110D]/60 to-[#0B110D]/95" />

      {/* Top App Bar */}
      <div className="relative z-20">
        <TopAppBar
          currentScreen={currentScreen}
          onNavigate={(s) => {
            setCurrentScreen(s);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSoilScan={() => setIsSoilScanOpen(true)}
          cartItemsCount={totalCartCount}
          user={currentUser}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onOpenAccount={() => setIsAccountModalOpen(true)}
        />
      </div>

      {/* Screen Views */}
      <main className="relative z-10 flex-grow flex flex-col">
      {currentScreen === 'home' && (
        <HomeScreen
          currentLocation={currentLocation}
          onChangeLocation={() => setIsLocationModalOpen(true)}
          featuredProducts={products.slice(0, 4)}
          recentOrders={recentOrders}
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
        cartItemsCount={totalCartCount}
        user={currentUser}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#16241A] text-[#F1F5F2] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in-up border-2 border-[#84CC16]">
          <span className="material-symbols-outlined text-[#84CC16] text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals & Slide-overs */}
      <CropGuideModal
        guide={selectedCropGuide}
        onClose={() => setSelectedCropGuide(null)}
        onOrderRecommended={handleOrderSpecificProduct}
        products={products}
      />

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
      />

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
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
        onOrderProduct={handleOrderSpecificProduct}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc);
          showToast(`Switched farm site to ${loc.name}, ${loc.state}`);
        }}
      />

      <CropCareModal
        isOpen={isCropCareModalOpen}
        onClose={() => setIsCropCareModalOpen(false)}
        onOrderProduct={handleOrderSpecificProduct}
        onOpenSoilScan={() => setIsSoilScanOpen(true)}
        products={products}
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
