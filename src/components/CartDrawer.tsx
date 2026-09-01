import React, { useState } from 'react';
import { OrderItem, Order } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckoutComplete: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutComplete,
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState('Alex Miller - North Field Gate 2, Kansas City MO');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [newOrder, setNewOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 3000 ? 0 : 250.00;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const createdOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `Order #FM-${randomId}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Processing',
      statusBadge: 'In Transit',
      statusColor: 'text-[#795548]',
      statusClass: 'bg-[#fdcdbc] text-[#795548]',
      badgeClass: 'bg-secondary-container text-on-secondary-container',
      itemsCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      total: total,
      icon: 'local_shipping',
      items: [...cartItems],
      destination: deliveryAddress,
      trackingNumber: `FM-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      estimatedDelivery: 'Arriving in 2 Business Days',
    };

    setNewOrder(createdOrder);
    setOrderPlaced(true);
    onCheckoutComplete(createdOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-fade-in-up">
      <div className="bg-[#111A13] w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l-2 border-[#1E2E21] text-[#F1F5F2]">
        {/* Header */}
        <div className="p-5 border-b-2 border-[#1E2E21] flex justify-between items-center bg-[#16241A]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#84CC16] text-[24px]">
              shopping_bag
            </span>
            <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-extrabold text-[#F1F5F2]">
              Farm Cart ({cartItems.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#111A13] text-[#9CAFA0] hover:text-[#F1F5F2] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-grow space-y-4">
          {orderPlaced && newOrder ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-[#84CC16] text-[#0B110D] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-4xl font-bold">check</span>
              </div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-2xl font-extrabold text-[#F1F5F2]">
                Order Confirmed!
              </h3>
              <p className="text-xs text-[#9CAFA0] max-w-xs mx-auto font-medium">
                Thank you, Alex. <strong>{newOrder.orderNumber}</strong> has been scheduled for direct flatbed delivery.
              </p>
              <div className="bg-[#16241A] p-4 rounded-xl text-left text-xs space-y-2 border-2 border-[#1E2E21]">
                <div className="flex justify-between font-bold text-[#F1F5F2]">
                  <span>Tracking:</span>
                  <span className="font-mono text-[#84CC16]">{newOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Est. Delivery:</span>
                  <span className="font-bold text-[#F1F5F2]">{newOrder.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Total Paid:</span>
                  <span className="font-['Space_Grotesk',sans-serif] font-black text-[#84CC16] text-sm">₹{newOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setOrderPlaced(false);
                  onClose();
                }}
                className="w-full py-3 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider font-extrabold rounded-lg hover:bg-[#99E321] border-2 border-[#84CC16]"
              >
                Continue Shopping
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="material-symbols-outlined text-6xl text-[#84CC16]">
                remove_shopping_cart
              </span>
              <h3 className="font-['Space_Grotesk',sans-serif] font-extrabold text-base text-[#F1F5F2]">Your cart is empty</h3>
              <p className="text-xs text-[#9CAFA0] font-medium">
                Explore our catalog for premium nitrogen, NPK blends, and organic soil conditioners.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#1E2E21] space-y-3">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="pt-3 flex gap-3 items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg bg-[#16241A] shrink-0 border-2 border-[#1E2E21]"
                    />
                    <div className="flex-grow">
                      <h4 className="font-['Space_Grotesk',sans-serif] text-xs font-bold text-[#F1F5F2] line-clamp-1">
                        {item.product.name}
                      </h4>
                      <span className="text-[11px] text-[#9CAFA0] block font-medium">
                        ₹{item.product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} • {item.product.weightOrVolume}
                      </span>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border-2 border-[#1E2E21] rounded-md bg-[#16241A]">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="px-2 py-0.5 text-xs font-bold text-[#F1F5F2] hover:bg-[#111A13]"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-['Space_Grotesk',sans-serif] font-extrabold text-[#84CC16]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="px-2 py-0.5 text-xs font-bold text-[#F1F5F2] hover:bg-[#111A13]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-[11px] font-bold text-[#ef4444] hover:underline uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-['Space_Grotesk',sans-serif] font-black text-sm text-[#F1F5F2]">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="bg-[#16241A] p-3.5 rounded-xl border-2 border-[#1E2E21] space-y-1 mt-4">
                <label className="text-[10px] font-['Space_Grotesk',sans-serif] font-black text-[#84CC16] uppercase tracking-wider block">
                  Delivery Destination:
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-xs bg-[#111A13] border-2 border-[#1E2E21] rounded p-2 text-[#F1F5F2] font-bold outline-none focus:border-[#84CC16]"
                />
              </div>

              {/* Summary */}
              <div className="space-y-1.5 pt-3 border-t-2 border-[#1E2E21] text-xs">
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Subtotal:</span>
                  <span className="font-bold text-[#F1F5F2] font-mono">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Freight Delivery:</span>
                  <span>{shipping === 0 ? <strong className="text-[#84CC16] uppercase font-bold">FREE (Over ₹3,000)</strong> : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}</span>
                </div>
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Estimated Tax (GST 5%):</span>
                  <span className="font-mono text-[#F1F5F2]">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#F1F5F2] pt-2 border-t border-[#1E2E21]">
                  <span className="font-['Space_Grotesk',sans-serif] font-extrabold uppercase">Total:</span>
                  <span className="text-[#84CC16] font-['Space_Grotesk',sans-serif] font-black text-lg">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!orderPlaced && cartItems.length > 0 && (
          <div className="p-4 bg-[#16241A] border-t-2 border-[#1E2E21] shrink-0">
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-lg transition-colors active:scale-95 shadow-sm flex items-center justify-center gap-2 border-2 border-[#84CC16]"
            >
              <span className="material-symbols-outlined text-[18px] font-bold">local_shipping</span>
              Schedule Farm Delivery • ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
