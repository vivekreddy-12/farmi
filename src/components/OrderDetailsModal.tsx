import React from 'react';
import { Order } from '../types';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-lg shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col max-h-[90vh] text-[#F1F5F2]">
        {/* Header */}
        <div className="p-5 bg-[#16241A] border-b-2 border-[#1E2E21] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#84CC16] text-[#0B110D] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">local_shipping</span>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2]">
                {order.orderNumber}
              </h3>
              <span className="text-xs text-[#9CAFA0] font-medium">Placed on {order.date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#111A13] text-[#9CAFA0] hover:text-[#F1F5F2] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Status Tracker */}
          <div className="bg-[#16241A] p-4 rounded-xl space-y-3 border-2 border-[#1E2E21]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider text-[#84CC16]">Delivery Status:</span>
              <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#84CC16] text-[#0B110D]">
                {order.statusBadge}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#F1F5F2] font-bold font-['Space_Grotesk',sans-serif]">
                <span className="w-3 h-3 rounded-full bg-[#84CC16] ring-2 ring-[#111A13]" />
                <span>{order.estimatedDelivery}</span>
              </div>
              <div className="pl-5 text-[#9CAFA0] font-medium">
                Tracking Number: <strong className="text-[#84CC16] font-mono">{order.trackingNumber}</strong>
              </div>
              <div className="pl-5 text-[#9CAFA0] font-medium">
                Ship to: <span className="text-[#F1F5F2] font-semibold">{order.destination}</span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h4 className="text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-wider text-[#84CC16] mb-2">
              Order Items ({order.itemsCount})
            </h4>
            <div className="divide-y-2 divide-[#1E2E21] border-2 border-[#1E2E21] rounded-xl overflow-hidden">
              {order.items.map((it, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-[#16241A]">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.product.image}
                      alt={it.product.name}
                      className="w-12 h-12 rounded object-cover bg-[#111A13] border-2 border-[#1E2E21]"
                    />
                    <div>
                      <h5 className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2]">{it.product.name}</h5>
                      <span className="text-[11px] text-[#9CAFA0] font-medium">
                        Qty: {it.quantity} • {it.product.weightOrVolume}
                      </span>
                    </div>
                  </div>
                  <div className="font-['Space_Grotesk',sans-serif] font-black text-xs text-[#84CC16]">
                    ₹{(it.product.price * it.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing summary */}
          <div className="bg-[#16241A] p-4 rounded-xl text-xs space-y-1.5 border-2 border-[#1E2E21]">
            <div className="flex justify-between text-[#9CAFA0]">
              <span>Payment Method:</span>
              <span className="font-bold text-[#F1F5F2]">Farm Operating Account (UPI / Bank Transfer)</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#F1F5F2] pt-2 border-t border-[#1E2E21]">
              <span className="font-['Space_Grotesk',sans-serif] font-extrabold uppercase">Total Amount:</span>
              <span className="text-[#84CC16] font-['Space_Grotesk',sans-serif] font-black text-base">₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16241A] border-t-2 border-[#1E2E21] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-wider rounded-lg hover:bg-[#99E321] transition-colors border-2 border-[#84CC16]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
