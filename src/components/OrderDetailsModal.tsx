import React, { useState } from 'react';
import { Order } from '../types';
import {
  DEFAULT_RECEIPT_PHONE,
  FORMATTED_DEFAULT_PHONE,
  DEFAULT_RECEIPT_EMAIL,
  dispatchOrderReceiptSms,
  dispatchOrderReceiptEmail,
  generateReceiptSmsText,
  generateReceiptEmailText,
  generateReceiptEmailHtml,
  generateWhatsAppUrl,
  generateMailtoUrl,
  downloadReceiptText,
  downloadReceiptHtml,
} from '../utils/receiptService';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [showSmsPreview, setShowSmsPreview] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  if (!order) return null;

  const targetPhone = order.recipientPhone || FORMATTED_DEFAULT_PHONE;
  const targetEmail = order.recipientEmail || DEFAULT_RECEIPT_EMAIL;
  const whatsappUrl = order.smsReceipt?.whatsappUrl || generateWhatsAppUrl(order, order.recipientPhone || DEFAULT_RECEIPT_PHONE);
  const mailtoUrl = order.emailReceipt?.mailtoUrl || generateMailtoUrl(order, targetEmail);

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      const updated = dispatchOrderReceiptSms(order, order.recipientPhone || DEFAULT_RECEIPT_PHONE);
      order.smsReceipt = updated;
      setIsResending(false);
      setResendStatus(`SMS Receipt resent to ${updated.phone} (ID: ${updated.messageId})`);
      setTimeout(() => setResendStatus(null), 4000);
    }, 600);
  };

  const handleResendEmail = () => {
    setIsResendingEmail(true);
    setTimeout(() => {
      const updated = dispatchOrderReceiptEmail(order, targetEmail);
      order.emailReceipt = updated;
      setIsResendingEmail(false);
      setResendStatus(`E-Invoice & Receipt resent to ${updated.email} (ID: ${updated.messageId})`);
      setTimeout(() => setResendStatus(null), 4000);
    }, 600);
  };

  const handleCopy = () => {
    const text = order.smsReceipt?.smsContent || generateReceiptSmsText(order, order.recipientPhone || DEFAULT_RECEIPT_PHONE);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmail = () => {
    const text = order.emailReceipt?.textContent || generateReceiptEmailText(order, targetEmail);
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

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

        {/* Resend status toast */}
        {resendStatus && (
          <div className="mx-4 mt-3 p-2.5 bg-[#16241A] border-2 border-[#84CC16] rounded-xl flex items-center gap-2 text-xs font-bold text-[#84CC16] animate-fade-in-up">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{resendStatus}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Email Receipt Telemetry Card */}
          <div className="bg-[#16241A] p-4 rounded-xl space-y-3 border-2 border-[#84CC16]">
            <div className="flex justify-between items-center pb-2 border-b border-[#1E2E21]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#84CC16] text-[20px]">mark_email_read</span>
                <span className="text-[11px] font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">
                  E-Invoice Dispatched to {targetEmail}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B110D] animate-ping" />
                {order.emailReceipt?.status || 'Delivered'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[#9CAFA0]">
              <div>
                <span className="block text-[10px]">Email Recipient:</span>
                <strong className="text-[#F1F5F2] font-mono">{targetEmail}</strong>
              </div>
              <div>
                <span className="block text-[10px]">Mail Gateway:</span>
                <span className="font-mono text-[#F1F5F2] text-[11px]">{order.emailReceipt?.gateway || 'farmin Cloud Mail Relay (SES)'}</span>
              </div>
              <div>
                <span className="block text-[10px]">Message Ref:</span>
                <span className="font-mono text-[#84CC16] font-bold">{order.emailReceipt?.messageId || 'MAIL-FARMIN-849201'}</span>
              </div>
              <div>
                <span className="block text-[10px]">Sent At:</span>
                <span className="font-mono text-[#F1F5F2]">{order.emailReceipt?.sentAt || 'Delivered'}</span>
              </div>
            </div>

            {/* Instant Actions for njersey382@gmail.com */}
            <div className="pt-2 border-t border-[#1E2E21] grid grid-cols-2 gap-2">
              <a
                href={mailtoUrl}
                className="p-2 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">mail</span>
                <span>Open in Email App</span>
              </a>

              <button
                onClick={handleResendEmail}
                disabled={isResendingEmail}
                className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#84CC16] text-[#84CC16] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isResendingEmail ? 'sync' : 'forward_to_inbox'}
                </span>
                <span>{isResendingEmail ? 'Sending...' : 'Resend Email'}</span>
              </button>

              <button
                onClick={handleCopyEmail}
                className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#1E2E21] text-[#F1F5F2] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#84CC16]">
                  {copiedEmail ? 'done' : 'content_copy'}
                </span>
                <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
              </button>

              <button
                onClick={() => downloadReceiptHtml(order)}
                className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#1E2E21] text-[#F1F5F2] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#84CC16]">receipt_long</span>
                <span>Download HTML</span>
              </button>
            </div>

            {/* Expandable Email Preview */}
            <div className="pt-2 border-t border-[#1E2E21]">
              <button
                onClick={() => setShowEmailPreview(!showEmailPreview)}
                className="w-full text-[11px] font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16] flex items-center justify-between hover:underline"
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  {showEmailPreview ? 'Hide Email Receipt Body' : 'View Full Email Sent to njersey382@gmail.com'}
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  {showEmailPreview ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showEmailPreview && (
                <div className="mt-2 p-3 bg-[#0B110D] border border-[#1E2E21] rounded-lg font-mono text-[10px] text-[#9CAFA0] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {order.emailReceipt?.textContent || generateReceiptEmailText(order, targetEmail)}
                </div>
              )}
            </div>
          </div>

          {/* SMS & WhatsApp Receipt Telemetry Card */}
          <div className="bg-[#16241A] p-4 rounded-xl space-y-3 border-2 border-[#1E2E21]">
            <div className="flex justify-between items-center pb-2 border-b border-[#1E2E21]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#84CC16] text-[20px]">mark_chat_read</span>
                <span className="text-[11px] font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">
                  SMS Receipt Dispatched to {targetPhone}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B110D] animate-ping" />
                {order.smsReceipt?.status || 'Delivered'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[#9CAFA0]">
              <div>
                <span className="block text-[10px]">Mobile Recipient:</span>
                <strong className="text-[#F1F5F2] font-mono">{targetPhone}</strong>
              </div>
              <div>
                <span className="block text-[10px]">SMS Gateway:</span>
                <span className="font-mono text-[#F1F5F2] text-[11px]">{order.smsReceipt?.gateway || 'Airtel Enterprise SMS'}</span>
              </div>
              <div>
                <span className="block text-[10px]">Message Ref:</span>
                <span className="font-mono text-[#84CC16] font-bold">{order.smsReceipt?.messageId || 'SMS-FARMIN-93912'}</span>
              </div>
              <div>
                <span className="block text-[10px]">Sent At:</span>
                <span className="font-mono text-[#F1F5F2]">{order.smsReceipt?.sentAt || 'Delivered'}</span>
              </div>
            </div>

            {/* Instant Actions for 9391216686 */}
            <div className="pt-2 border-t border-[#1E2E21] grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-[#0B110D] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">chat</span>
                <span>Open WhatsApp</span>
              </a>

              <button
                onClick={handleResend}
                disabled={isResending}
                className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#84CC16] text-[#84CC16] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isResending ? 'sync' : 'send_to_mobile'}
                </span>
                <span>{isResending ? 'Sending...' : 'Resend SMS'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#1E2E21] text-[#F1F5F2] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#84CC16]">
                  {copied ? 'done' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied!' : 'Copy Receipt'}</span>
              </button>

              <button
                onClick={() => downloadReceiptText(order)}
                className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#1E2E21] text-[#F1F5F2] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#84CC16]">download</span>
                <span>Download Invoice</span>
              </button>
            </div>

            {/* Expandable SMS Preview */}
            <div className="pt-2 border-t border-[#1E2E21]">
              <button
                onClick={() => setShowSmsPreview(!showSmsPreview)}
                className="w-full text-[11px] font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16] flex items-center justify-between hover:underline"
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">smartphone</span>
                  {showSmsPreview ? 'Hide SMS Message Body' : 'View Full SMS Sent to 9391216686'}
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  {showSmsPreview ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showSmsPreview && (
                <div className="mt-2 p-3 bg-[#0B110D] border border-[#1E2E21] rounded-lg font-mono text-[10px] text-[#9CAFA0] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {order.smsReceipt?.smsContent || generateReceiptSmsText(order, targetPhone)}
                </div>
              )}
            </div>
          </div>

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

          {/* Pricing & Payment Summary */}
          <div className="bg-[#16241A] p-4 rounded-xl text-xs space-y-3 border-2 border-[#1E2E21]">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2E21]">
              <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">
                Payment Information
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D]">
                {order.paymentDetails?.status || 'Paid (Verified)'}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#111A13] border border-[#1E2E21] flex items-center justify-center text-[#84CC16] shrink-0">
                <span className="material-symbols-outlined text-[18px]">
                  {order.paymentDetails?.icon || 'payments'}
                </span>
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F1F5F2] font-['Space_Grotesk',sans-serif]">
                    {order.paymentDetails?.title || 'Farm Operating Account (UPI / Bank Transfer)'}
                  </span>
                </div>
                <p className="text-[11px] text-[#9CAFA0]">
                  {order.paymentDetails?.subtitle || 'Instant Direct Settlement'}
                </p>
                {order.paymentDetails?.transactionRef && (
                  <span className="text-[10px] font-mono text-[#84CC16] block mt-0.5">
                    Ref: {order.paymentDetails.transactionRef}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#1E2E21]">
              {order.subtotal ? (
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Subtotal:</span>
                  <span className="font-mono text-[#F1F5F2]">₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : null}
              {order.discount && order.discount > 0 ? (
                <div className="flex justify-between text-[#84CC16]">
                  <span>Agri Subsidy Discount ({order.discountCode || 'Promo'}):</span>
                  <span className="font-mono font-bold">-₹{order.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : null}
              {order.shipping !== undefined ? (
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Freight Delivery:</span>
                  <span>{order.shipping === 0 ? <strong className="text-[#84CC16] uppercase">FREE</strong> : `₹${order.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}</span>
                </div>
              ) : null}
              {order.tax ? (
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>GST (5%):</span>
                  <span className="font-mono text-[#F1F5F2]">₹{order.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-bold text-[#F1F5F2] pt-2 border-t border-[#1E2E21]">
                <span className="font-['Space_Grotesk',sans-serif] font-extrabold uppercase">Total Amount:</span>
                <span className="text-[#84CC16] font-['Space_Grotesk',sans-serif] font-black text-base">₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
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

