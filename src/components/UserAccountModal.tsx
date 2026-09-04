import React, { useState } from 'react';
import { UserProfile, Order } from '../types';
import { sounds } from '../utils/soundEffects';
import { DEFAULT_RECEIPT_EMAIL, FORMATTED_DEFAULT_PHONE } from '../utils/receiptService';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  orders: Order[];
  onOpenOrder: (order: Order) => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  orders,
  onOpenOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'receipts' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || DEFAULT_RECEIPT_EMAIL);
  const [phone, setPhone] = useState(user.phone || FORMATTED_DEFAULT_PHONE);
  const [farmName, setFarmName] = useState(user.farmName || 'Miller Organic Field Station');
  const [location, setLocation] = useState(user.location || 'Kansas City, MO (Zone 6A)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    const updated: UserProfile = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      farmName: farmName.trim(),
      location: location.trim(),
    };
    onUpdateUser(updated);
    setIsEditing(false);
    setToastMessage('Grower profile updated successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-lg shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col max-h-[92vh] text-[#F1F5F2]">
        {/* Header with User Info Banner */}
        <div className="p-5 border-b-2 border-[#1E2E21] bg-[#16241A] flex justify-between items-start">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#84CC16] bg-[#0B110D] shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-black bg-[#84CC16] text-[#0B110D]">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#84CC16] border-2 border-[#111A13] flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-[#0B110D] font-black">check</span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-['Space_Grotesk',sans-serif] font-black uppercase text-[#F1F5F2] tracking-wide">
                  {user.name}
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D] text-[9px] font-black uppercase tracking-wider">
                  Verified Farmer
                </span>
              </div>
              <div className="text-xs text-[#84CC16] font-mono mt-0.5">{user.email}</div>
              <div className="text-[11px] text-[#9CAFA0] flex items-center gap-2 mt-0.5">
                <span>{user.farmName}</span>
                <span>•</span>
                <span className="font-mono text-[10px]">{user.kisanId || 'KISAN-9831'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#0B110D] text-[#9CAFA0] hover:text-[#F1F5F2] hover:bg-[#1E2E21] flex items-center justify-center transition-colors border border-[#1E2E21]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-2 bg-[#0B110D] border-b border-[#1E2E21] flex gap-2 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('profile');
            }}
            className={`py-2 px-3 border-b-2 font-['Space_Grotesk',sans-serif] font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-[#84CC16] text-[#84CC16]'
                : 'border-transparent text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>Grower Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('orders');
            }}
            className={`py-2 px-3 border-b-2 font-['Space_Grotesk',sans-serif] font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#84CC16] text-[#84CC16]'
                : 'border-transparent text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>My Invoices ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('receipts');
            }}
            className={`py-2 px-3 border-b-2 font-['Space_Grotesk',sans-serif] font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'receipts'
                ? 'border-[#84CC16] text-[#84CC16]'
                : 'border-transparent text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mark_email_read</span>
            <span>Auto E-Receipts</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('security');
            }}
            className={`py-2 px-3 border-b-2 font-['Space_Grotesk',sans-serif] font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-[#84CC16] text-[#84CC16]'
                : 'border-transparent text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">security</span>
            <span>Account Security</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {toastMessage && (
            <div className="p-3 bg-[#16241A] border-2 border-[#84CC16] rounded-xl text-[#84CC16] text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {!isEditing ? (
                <div className="space-y-3">
                  <div className="bg-[#16241A] p-4 rounded-xl border border-[#1E2E21] space-y-2.5">
                    <div className="flex justify-between items-center pb-2 border-b border-[#1E2E21]">
                      <span className="text-[11px] font-['Space_Grotesk',sans-serif] font-bold uppercase tracking-wider text-[#84CC16]">
                        Farmstead & Agronomy Details
                      </span>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setIsEditing(true);
                        }}
                        className="text-xs text-[#84CC16] hover:underline font-bold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        Edit Details
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-[#9CAFA0] block">Lead Grower Name</span>
                        <strong className="text-[#F1F5F2]">{user.name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9CAFA0] block">Primary Email</span>
                        <strong className="text-[#84CC16] font-mono">{user.email}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9CAFA0] block">SMS & UPI Phone</span>
                        <strong className="text-[#F1F5F2] font-mono">{user.phone}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9CAFA0] block">Farm Enterprise</span>
                        <strong className="text-[#F1F5F2]">{user.farmName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9CAFA0] block">Primary Field Location</span>
                        <strong className="text-[#F1F5F2]">{user.location}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9CAFA0] block">Kisan Registry ID</span>
                        <strong className="text-[#84CC16] font-mono">{user.kisanId || 'KISAN-9831'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Badges / Certification */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-[#0B110D] border border-[#1E2E21] rounded-xl flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#84CC16] text-[22px]">eco</span>
                      <div>
                        <div className="font-bold text-[#F1F5F2]">Organic Certified</div>
                        <div className="text-[10px] text-[#9CAFA0]">USDA & NPOP Eligible</div>
                      </div>
                    </div>
                    <div className="p-3 bg-[#0B110D] border border-[#1E2E21] rounded-xl flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#84CC16] text-[22px]">price_check</span>
                      <div>
                        <div className="font-bold text-[#F1F5F2]">Freight Subsidy</div>
                        <div className="text-[10px] text-[#9CAFA0]">100% Free Bulk Shipping</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                      Grower Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                        Receipt Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                        SMS & UPI Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                      Farm Enterprise Name
                    </label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                      Primary Delivery Location / Gate
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-1/2 py-2.5 bg-[#0B110D] hover:bg-[#16241A] border border-[#1E2E21] text-[#9CAFA0] font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2.5 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-bold text-xs rounded-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-[#9CAFA0] text-xs">
                  No orders placed yet. Products added to cart will appear here after checkout.
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      sounds.playClick();
                      onOpenOrder(order);
                    }}
                    className="p-3.5 bg-[#16241A] hover:bg-[#1E2E21] border border-[#1E2E21] hover:border-[#84CC16]/60 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0B110D] border border-[#1E2E21] flex items-center justify-center text-[#84CC16]">
                        <span className="material-symbols-outlined text-[20px]">{order.icon || 'inventory_2'}</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#F1F5F2] flex items-center gap-1.5">
                          <span>{order.orderNumber}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${order.badgeClass}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#9CAFA0] mt-0.5">
                          {order.itemsCount} items • {order.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-[#84CC16]">
                        ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-[#9CAFA0] group-hover:text-[#84CC16] flex items-center gap-0.5 justify-end">
                        View Invoice <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: AUTO E-RECEIPTS */}
          {activeTab === 'receipts' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[#16241A] rounded-xl border-2 border-[#84CC16] space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#84CC16] text-[20px]">mark_email_read</span>
                  <span className="font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">
                    Configured Digital Receipt Dispatch
                  </span>
                </div>
                <p className="text-[#9CAFA0] text-[11px] leading-relaxed">
                  Every order placed under your account automatically dispatches a verified tax invoice and itemized specification receipt to your active channels:
                </p>

                <div className="space-y-2 pt-1 font-mono text-[11px]">
                  <div className="p-2.5 bg-[#0B110D] rounded-lg border border-[#1E2E21] flex justify-between items-center">
                    <div>
                      <span className="text-[#9CAFA0] text-[10px] block">Primary Email Receipt</span>
                      <strong className="text-[#F1F5F2]">{user.email || DEFAULT_RECEIPT_EMAIL}</strong>
                    </div>
                    <span className="text-[9px] font-sans font-black uppercase px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D]">
                      Active
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#0B110D] rounded-lg border border-[#1E2E21] flex justify-between items-center">
                    <div>
                      <span className="text-[#9CAFA0] text-[10px] block">SMS & WhatsApp Gateway</span>
                      <strong className="text-[#F1F5F2]">{user.phone || FORMATTED_DEFAULT_PHONE}</strong>
                    </div>
                    <span className="text-[9px] font-sans font-black uppercase px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D]">
                      Active
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#0B110D] rounded-lg border border-[#1E2E21] flex justify-between items-center">
                    <div>
                      <span className="text-[#9CAFA0] text-[10px] block">UPI VPA Mapping</span>
                      <strong className="text-[#84CC16]">9391216686@ybl</strong>
                    </div>
                    <span className="text-[9px] font-sans font-black uppercase px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D]">
                      Linked
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#16241A] rounded-xl border border-[#1E2E21] space-y-2">
                <div className="font-bold text-[#F1F5F2]">Multi-Factor Authentication</div>
                <div className="text-[11px] text-[#9CAFA0]">
                  SMS OTP verification enabled for high-value fertilizer transactions.
                </div>
              </div>

              <div className="p-3.5 bg-[#16241A] rounded-xl border border-[#1E2E21] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#F1F5F2]">Google Account Connection</div>
                  <div className="text-[11px] text-[#84CC16] font-mono">njersey382@gmail.com</div>
                </div>
                <span className="text-[10px] font-black uppercase text-[#84CC16] bg-[#0B110D] px-2 py-1 rounded border border-[#84CC16]/50">
                  Connected
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onLogout();
                  onClose();
                }}
                className="w-full py-3 bg-red-950/60 hover:bg-red-900/80 border border-red-500/60 text-red-300 font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign Out of farmin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
