import React, { useState } from 'react';
import { OrderItem, Order, PaymentMethodType, PaymentDetails } from '../types';
import { PaymentMethodSelector } from './PaymentMethodSelector';
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
  sendOrderReceiptToCreator,
} from '../utils/receiptService';
import {
  detectCurrentDeliveryLocation,
  DetectedLocationResult,
} from '../utils/geolocationService';
import { launchPaymentApp, FARMIN_VPA } from '../utils/paymentAppLauncher';
import { sounds } from '../utils/soundEffects';

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
  const [currentStep, setCurrentStep] = useState<'cart' | 'payment'>('cart');
  const [deliveryAddress, setDeliveryAddress] = useState('Alex Miller - North Field Gate 2, Kansas City MO');
  const [recipientPhone, setRecipientPhone] = useState(DEFAULT_RECEIPT_PHONE);
  const [recipientEmail, setRecipientEmail] = useState(DEFAULT_RECEIPT_EMAIL);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const [smsNotificationToast, setSmsNotificationToast] = useState<string | null>(null);
  const [isResendingSms, setIsResendingSms] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [copiedEmailReceipt, setCopiedEmailReceipt] = useState(false);
  const [showSmsPreview, setShowSmsPreview] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Payment states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('upi');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 'upi',
    title: 'UPI (9391216686@ybl)',
    subtitle: 'Instant Settlement • 0% Transaction Surcharge',
    icon: 'qr_code_scanner',
    status: 'Paid',
    transactionRef: `UPI-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
    meta: { vpa: '9391216686@ybl' },
  });

  // Promo / Subsidy coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Auto-Detect Location states
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocationInfo, setDetectedLocationInfo] = useState<DetectedLocationResult | null>(null);
  const [locationDetectionError, setLocationDetectionError] = useState<string | null>(null);
  const [locationSuccessToast, setLocationSuccessToast] = useState<string | null>(null);

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationDetectionError(null);
    sounds.playClick();

    const result = await detectCurrentDeliveryLocation();
    setIsDetectingLocation(false);

    if (result.success && result.location) {
      setDeliveryAddress(result.location.formattedAddress);
      setDetectedLocationInfo(result.location);
      setLocationSuccessToast(`✓ GPS Location Detected (Accuracy ±${result.location.accuracyMeters}m)`);
      sounds.playSuccess();
      setTimeout(() => setLocationSuccessToast(null), 5000);
    } else {
      setLocationDetectionError(
        result.error?.message || 'Unable to access GPS location. Please allow browser location permissions.'
      );
      sounds.playClick();
    }
  };

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  let shipping = subtotal > 3000 ? 0 : 250.00;
  let discountAmount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.code === 'FARMIN10') {
      discountAmount = subtotal * 0.10;
    } else if (appliedCoupon.code === 'KISAN2026') {
      discountAmount = Math.min(500, subtotal * 0.5);
    } else if (appliedCoupon.code === 'GREENEARTH') {
      discountAmount = 200;
      shipping = 0;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.05;
  const total = taxableAmount + shipping + tax;

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');

    if (code === 'KISAN2026') {
      setAppliedCoupon({ code: 'KISAN2026', discount: 500 });
      setCouponCode('KISAN2026');
    } else if (code === 'FARMIN10') {
      setAppliedCoupon({ code: 'FARMIN10', discount: 10 });
      setCouponCode('FARMIN10');
    } else if (code === 'GREENEARTH') {
      setAppliedCoupon({ code: 'GREENEARTH', discount: 200 });
      setCouponCode('GREENEARTH');
    } else {
      setCouponError('Invalid coupon code. Try KISAN2026 or FARMIN10');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) return;
    setCurrentStep('payment');
  };

  const handleConfirmOrder = () => {
    if (cartItems.length === 0) return;

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const targetPhone = recipientPhone.trim() || DEFAULT_RECEIPT_PHONE;

    const preliminaryOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `Order #FM-${randomId}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: selectedPaymentMethod === 'cod' ? 'Processing' : 'In Transit',
      statusBadge: selectedPaymentMethod === 'cod' ? 'Processing' : 'In Transit',
      statusColor: 'text-[#795548]',
      statusClass: 'bg-[#fdcdbc] text-[#795548]',
      badgeClass: 'bg-secondary-container text-on-secondary-container',
      itemsCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      total: total,
      subtotal: subtotal,
      discount: discountAmount,
      discountCode: appliedCoupon?.code,
      tax: tax,
      shipping: shipping,
      icon: 'local_shipping',
      items: [...cartItems],
      destination: deliveryAddress,
      recipientPhone: targetPhone,
      recipientEmail: DEFAULT_RECEIPT_EMAIL,
      trackingNumber: `FM-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      estimatedDelivery: 'Arriving in 2 Business Days',
      paymentDetails: { ...paymentDetails },
    };

    // Auto dispatch SMS to 9391216686 & Email to njersey382@gmail.com
    const smsReceipt = dispatchOrderReceiptSms(preliminaryOrder, targetPhone);
    const emailReceipt = dispatchOrderReceiptEmail(preliminaryOrder, DEFAULT_RECEIPT_EMAIL);
    const finalOrder: Order = {
      ...preliminaryOrder,
      smsReceipt,
      emailReceipt,
    };

    // Automatically email the order receipt to the creator via Resend the
    // moment the order is placed. Fire-and-forget so it never blocks checkout.
    void sendOrderReceiptToCreator(finalOrder);

    // If UPI payment method, automatically trigger device payment app deep link
    if (selectedPaymentMethod === 'upi') {
      const appTitle = paymentDetails?.title || 'UPI';
      launchPaymentApp(appTitle, {
        appName: appTitle,
        amount: total,
        vpa: FARMIN_VPA,
        payeeName: 'farmin Agro Solutions',
        transactionRef: preliminaryOrder.orderNumber,
        note: `farmin ${preliminaryOrder.orderNumber}`,
      });
      setSmsNotificationToast(`Opening ${appTitle}... Order receipt emailed to ${emailReceipt.email}`);
    } else {
      setSmsNotificationToast(`Order placed! Receipt emailed to ${emailReceipt.email}`);
    }

    setNewOrder(finalOrder);
    setOrderPlaced(true);
    setTimeout(() => setSmsNotificationToast(null), 6000);

    onCheckoutComplete(finalOrder);
  };

  const handleResendSms = () => {
    if (!newOrder) return;
    setIsResendingSms(true);
    setTimeout(() => {
      const targetPhone = recipientPhone.trim() || DEFAULT_RECEIPT_PHONE;
      const updatedSms = dispatchOrderReceiptSms(newOrder, targetPhone);
      setNewOrder({ ...newOrder, smsReceipt: updatedSms });
      setIsResendingSms(false);
      setSmsNotificationToast(`SMS Receipt successfully resent to ${updatedSms.phone} (ID: ${updatedSms.messageId})`);
      setTimeout(() => setSmsNotificationToast(null), 4500);
    }, 600);
  };

  const handleResendEmail = () => {
    if (!newOrder) return;
    setIsResendingEmail(true);
    setTimeout(() => {
      const targetEmail = recipientEmail.trim() || DEFAULT_RECEIPT_EMAIL;
      const updatedEmail = dispatchOrderReceiptEmail(newOrder, targetEmail);
      setNewOrder({ ...newOrder, emailReceipt: updatedEmail });
      setIsResendingEmail(false);
      setSmsNotificationToast(`E-Invoice & Receipt successfully resent to ${updatedEmail.email} (ID: ${updatedEmail.messageId})`);
      setTimeout(() => setSmsNotificationToast(null), 4500);
    }, 600);
  };

  const handleCopyReceipt = () => {
    if (!newOrder) return;
    const text = newOrder.smsReceipt?.smsContent || generateReceiptSmsText(newOrder, recipientPhone);
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const handleCopyEmailReceipt = () => {
    if (!newOrder) return;
    const text = newOrder.emailReceipt?.textContent || generateReceiptEmailText(newOrder, recipientEmail);
    navigator.clipboard.writeText(text);
    setCopiedEmailReceipt(true);
    setTimeout(() => setCopiedEmailReceipt(false), 2500);
  };

  const handlePaymentMethodChange = (method: PaymentMethodType, details: PaymentDetails) => {
    setSelectedPaymentMethod(method);
    setPaymentDetails(details);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex justify-end animate-fade-in-up">
      <div className="bg-[#111A13] w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l-2 border-[#1E2E21] text-[#F1F5F2]">
        {/* Header */}
        <div className="p-5 border-b-2 border-[#1E2E21] flex justify-between items-center bg-[#16241A] shrink-0">
          <div className="flex items-center gap-2.5">
            {currentStep === 'payment' && !orderPlaced ? (
              <button
                onClick={() => setCurrentStep('cart')}
                className="p-1 rounded-lg hover:bg-[#111A13] text-[#84CC16] transition-colors"
                title="Back to Cart"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
            ) : (
              <span className="material-symbols-outlined text-[#84CC16] text-[24px]">
                shopping_bag
              </span>
            )}
            <div>
              <h2 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2] flex items-center gap-2">
                {orderPlaced
                  ? 'Order Receipt & SMS Dispatch'
                  : currentStep === 'payment'
                  ? 'Secure Checkout & Payment'
                  : `Farm Cart (${cartItems.reduce((sum, i) => sum + i.quantity, 0)})`}
              </h2>
              <span className="text-[10px] text-[#9CAFA0] font-mono block">
                {orderPlaced
                  ? 'Receipt sent to 9391216686'
                  : currentStep === 'payment'
                  ? 'Step 2 of 2: Payment Selection'
                  : 'Step 1 of 2: Order Review'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#111A13] text-[#9CAFA0] hover:text-[#F1F5F2] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Toast Notification */}
        {smsNotificationToast && (
          <div className="mx-4 mt-3 p-3 bg-[#16241A] border-2 border-[#84CC16] rounded-xl flex items-center justify-between gap-2 shadow-lg animate-fade-in-up">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#84CC16] text-[20px] animate-pulse">
                sms
              </span>
              <span className="text-xs font-bold text-[#F1F5F2]">
                {smsNotificationToast}
              </span>
            </div>
            <button
              onClick={() => setSmsNotificationToast(null)}
              className="text-[#9CAFA0] hover:text-[#F1F5F2]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-grow space-y-4">
          {orderPlaced && newOrder ? (
            /* Confirmed Order State */
            <div className="text-center py-2 space-y-4">
              <div className="w-14 h-14 bg-[#84CC16] text-[#0B110D] rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <span className="material-symbols-outlined text-3xl font-bold">check</span>
              </div>
              <div>
                <h3 className="font-['Space_Grotesk',sans-serif] text-xl font-extrabold text-[#F1F5F2]">
                  Order Confirmed & Receipt Sent!
                </h3>
                <p className="text-xs text-[#9CAFA0] max-w-xs mx-auto font-medium mt-1">
                  Thank you, Alex. <strong>{newOrder.orderNumber}</strong> has been confirmed. Official tax receipt automatically dispatched to <strong>{newOrder.recipientEmail || DEFAULT_RECEIPT_EMAIL}</strong> & <strong>{newOrder.recipientPhone || FORMATTED_DEFAULT_PHONE}</strong>.
                </p>
              </div>

              {/* Email Receipt Auto-Dispatched Telemetry Card */}
              <div className="bg-[#16241A] p-4 rounded-xl text-left border-2 border-[#84CC16] space-y-3 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E2E21]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#84CC16] text-[20px]">
                      mark_email_read
                    </span>
                    <span className="text-xs font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">
                      E-Invoice Sent to {newOrder.recipientEmail || DEFAULT_RECEIPT_EMAIL}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B110D] animate-ping" />
                    {newOrder.emailReceipt?.status || 'Delivered'}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-[#9CAFA0]">
                  <div className="flex justify-between">
                    <span>Recipient Email:</span>
                    <strong className="text-[#F1F5F2] font-mono">{newOrder.recipientEmail || DEFAULT_RECEIPT_EMAIL}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mail Gateway:</span>
                    <span className="font-mono text-[11px] text-[#F1F5F2]">{newOrder.emailReceipt?.gateway || 'farmin Cloud Mail Relay (SES)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispatch Message ID:</span>
                    <span className="font-mono text-[#84CC16] font-bold">{newOrder.emailReceipt?.messageId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sent Timestamp:</span>
                    <span className="font-mono text-[#F1F5F2]">{newOrder.emailReceipt?.sentAt || 'Just now'}</span>
                  </div>
                </div>

                {/* Instant Actions for njersey382@gmail.com */}
                <div className="pt-2 border-t border-[#1E2E21] grid grid-cols-2 gap-2">
                  <a
                    href={newOrder.emailReceipt?.mailtoUrl || generateMailtoUrl(newOrder, newOrder.recipientEmail || DEFAULT_RECEIPT_EMAIL)}
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
                    <span>{isResendingEmail ? 'Resending...' : 'Resend Email'}</span>
                  </button>

                  <button
                    onClick={handleCopyEmailReceipt}
                    className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#1E2E21] text-[#F1F5F2] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#84CC16]">
                      {copiedEmailReceipt ? 'done' : 'content_copy'}
                    </span>
                    <span>{copiedEmailReceipt ? 'Copied!' : 'Copy Email Text'}</span>
                  </button>

                  <button
                    onClick={() => downloadReceiptHtml(newOrder)}
                    className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#1E2E21] text-[#F1F5F2] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#84CC16]">receipt_long</span>
                    <span>Download E-Invoice</span>
                  </button>
                </div>

                {/* Toggle Live Email Preview */}
                <div className="pt-2 border-t border-[#1E2E21]">
                  <button
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="w-full text-[11px] font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16] flex items-center justify-between hover:underline"
                  >
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      {showEmailPreview ? 'Hide Email Receipt Preview' : 'Inspect Formatted Email (njersey382@gmail.com)'}
                    </span>
                    <span className="material-symbols-outlined text-[16px]">
                      {showEmailPreview ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {showEmailPreview && (
                    <div className="mt-2 p-3 bg-[#0B110D] border border-[#1E2E21] rounded-lg font-mono text-[10px] text-[#9CAFA0] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {newOrder.emailReceipt?.textContent || generateReceiptEmailText(newOrder, newOrder.recipientEmail || DEFAULT_RECEIPT_EMAIL)}
                    </div>
                  )}
                </div>
              </div>

              {/* SMS & WhatsApp Receipt Sent Telemetry Banner */}
              <div className="bg-[#16241A] p-4 rounded-xl text-left border-2 border-[#84CC16] space-y-3 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E2E21]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#84CC16] text-[20px]">
                      mark_chat_read
                    </span>
                    <span className="text-xs font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">
                      Receipt Sent to {newOrder.recipientPhone || FORMATTED_DEFAULT_PHONE}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B110D] animate-ping" />
                    {newOrder.smsReceipt?.status || 'Delivered'}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-[#9CAFA0]">
                  <div className="flex justify-between">
                    <span>Target Phone:</span>
                    <strong className="text-[#F1F5F2] font-mono">{newOrder.recipientPhone || FORMATTED_DEFAULT_PHONE}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>SMS Gateway:</span>
                    <span className="font-mono text-[11px] text-[#F1F5F2]">{newOrder.smsReceipt?.gateway || 'Airtel Enterprise SMS Hub'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Message Reference:</span>
                    <span className="font-mono text-[#84CC16] font-bold">{newOrder.smsReceipt?.messageId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sent Timestamp:</span>
                    <span className="font-mono text-[#F1F5F2]">{newOrder.smsReceipt?.sentAt || 'Just now'}</span>
                  </div>
                </div>

                {/* Instant Actions for 9391216686 */}
                <div className="pt-2 border-t border-[#1E2E21] grid grid-cols-2 gap-2">
                  <a
                    href={newOrder.smsReceipt?.whatsappUrl || generateWhatsAppUrl(newOrder, newOrder.recipientPhone || DEFAULT_RECEIPT_PHONE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-[#0B110D] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">chat</span>
                    <span>Open WhatsApp</span>
                  </a>

                  <button
                    onClick={handleResendSms}
                    disabled={isResendingSms}
                    className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#84CC16] text-[#84CC16] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isResendingSms ? 'sync' : 'send_to_mobile'}
                    </span>
                    <span>{isResendingSms ? 'Resending...' : 'Resend SMS'}</span>
                  </button>

                  <button
                    onClick={handleCopyReceipt}
                    className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#1E2E21] text-[#F1F5F2] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#84CC16]">
                      {copiedReceipt ? 'done' : 'content_copy'}
                    </span>
                    <span>{copiedReceipt ? 'Copied!' : 'Copy Receipt'}</span>
                  </button>

                  <button
                    onClick={() => downloadReceiptText(newOrder)}
                    className="p-2 bg-[#111A13] hover:bg-[#1E2E21] border border-[#1E2E21] text-[#F1F5F2] rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#84CC16]">download</span>
                    <span>Download TXT</span>
                  </button>
                </div>

                {/* Toggle Live SMS Preview */}
                <div className="pt-2 border-t border-[#1E2E21]">
                  <button
                    onClick={() => setShowSmsPreview(!showSmsPreview)}
                    className="w-full text-[11px] font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16] flex items-center justify-between hover:underline"
                  >
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">smartphone</span>
                      {showSmsPreview ? 'Hide Phone SMS Preview' : 'Inspect Exact SMS Message (9391216686)'}
                    </span>
                    <span className="material-symbols-outlined text-[16px]">
                      {showSmsPreview ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {showSmsPreview && (
                    <div className="mt-2 p-3 bg-[#0B110D] border border-[#1E2E21] rounded-lg font-mono text-[10px] text-[#9CAFA0] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {newOrder.smsReceipt?.smsContent || generateReceiptSmsText(newOrder, newOrder.recipientPhone || DEFAULT_RECEIPT_PHONE)}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Order Summary Card */}
              <div className="bg-[#16241A] p-4 rounded-xl text-left text-xs space-y-3 border-2 border-[#1E2E21]">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E2E21]">
                  <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">
                    Payment Confirmation
                  </span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D]">
                    {newOrder.paymentDetails?.status || 'Paid'}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#111A13] border border-[#1E2E21] flex items-center justify-center text-[#84CC16] shrink-0">
                    <span className="material-symbols-outlined text-[22px]">
                      {newOrder.paymentDetails?.icon || 'payments'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-['Space_Grotesk',sans-serif] font-bold text-[#F1F5F2] text-xs">
                      {newOrder.paymentDetails?.title || 'Farm Payment'}
                    </h4>
                    <p className="text-[11px] text-[#9CAFA0] mt-0.5">
                      {newOrder.paymentDetails?.subtitle}
                    </p>
                    {newOrder.paymentDetails?.transactionRef && (
                      <span className="text-[10px] font-mono text-[#84CC16] block mt-1">
                        Ref: {newOrder.paymentDetails.transactionRef}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E2E21] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#9CAFA0]">
                    <span>Tracking Number:</span>
                    <span className="font-mono text-[#84CC16] font-bold">{newOrder.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between text-[#9CAFA0]">
                    <span>Estimated Delivery:</span>
                    <span className="font-bold text-[#F1F5F2]">{newOrder.estimatedDelivery}</span>
                  </div>
                  <div className="flex justify-between text-[#9CAFA0]">
                    <span>Delivery Gate:</span>
                    <span className="text-[#F1F5F2] font-semibold line-clamp-1">{newOrder.destination}</span>
                  </div>
                  {newOrder.discount && newOrder.discount > 0 ? (
                    <div className="flex justify-between text-[#84CC16]">
                      <span>Agri Discount Applied:</span>
                      <span className="font-mono font-bold">-₹{newOrder.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-bold text-[#F1F5F2] pt-1.5 border-t border-[#1E2E21]">
                    <span className="font-['Space_Grotesk',sans-serif] uppercase">Total Amount:</span>
                    <span className="font-['Space_Grotesk',sans-serif] font-black text-base text-[#84CC16]">
                      ₹{newOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Optional Re-launch UPI payment app */}
                {newOrder.paymentDetails?.method === 'upi' && (
                  <div className="pt-2 border-t border-[#1E2E21]">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        launchPaymentApp(newOrder.paymentDetails?.title || 'UPI', {
                          appName: newOrder.paymentDetails?.title,
                          amount: newOrder.total,
                          vpa: FARMIN_VPA,
                          payeeName: 'farmin Agro Solutions',
                          transactionRef: newOrder.orderNumber,
                          note: `farmin ${newOrder.orderNumber}`,
                        });
                        setSmsNotificationToast(`Opening ${newOrder.paymentDetails?.title || 'Payment App'} again...`);
                        setTimeout(() => setSmsNotificationToast(null), 4000);
                      }}
                      className="w-full py-2.5 bg-[#111A13] hover:bg-[#1E2E21] border border-[#84CC16]/60 text-[#84CC16] font-['Space_Grotesk',sans-serif] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      <span>Open {newOrder.paymentDetails?.title || 'Payment App'} Again</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setOrderPlaced(false);
                  setCurrentStep('cart');
                  onClose();
                }}
                className="w-full py-3.5 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider font-extrabold rounded-lg hover:bg-[#99E321] border-2 border-[#84CC16] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16 space-y-3">
              <span className="material-symbols-outlined text-6xl text-[#84CC16]">
                remove_shopping_cart
              </span>
              <h3 className="font-['Space_Grotesk',sans-serif] font-extrabold text-base text-[#F1F5F2]">
                Your cart is empty
              </h3>
              <p className="text-xs text-[#9CAFA0] font-medium">
                Explore our catalog for premium nitrogen, NPK blends, organic conditioners, and soil fertilizers.
              </p>
            </div>
          ) : currentStep === 'cart' ? (
            /* Step 1: Cart Items & Destination */
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

              {/* Delivery Address & GPS Auto-Detect */}
              <div className="bg-[#16241A] p-3.5 rounded-xl border-2 border-[#1E2E21] space-y-3 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-['Space_Grotesk',sans-serif] font-black text-[#84CC16] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">pin_drop</span>
                      Delivery Destination
                    </label>

                    {/* Auto Detect Location Button */}
                    <button
                      type="button"
                      onClick={handleAutoDetectLocation}
                      disabled={isDetectingLocation}
                      className={`text-[10px] font-['Space_Grotesk',sans-serif] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all active:scale-95 ${
                        isDetectingLocation
                          ? 'bg-[#16241A] border-[#84CC16] text-[#84CC16] animate-pulse cursor-wait'
                          : 'bg-[#84CC16] text-[#0B110D] border-[#84CC16] hover:bg-[#99E321]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[14px] ${
                          isDetectingLocation ? 'animate-spin' : ''
                        }`}
                      >
                        {isDetectingLocation ? 'sync' : 'my_location'}
                      </span>
                      <span>{isDetectingLocation ? 'Detecting GPS...' : 'Auto Detect Location'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (detectedLocationInfo) setDetectedLocationInfo(null);
                      }}
                      placeholder="e.g. North Field Gate 2, Plot #409, Kansas City MO"
                      className="w-full text-xs bg-[#111A13] border-2 border-[#1E2E21] rounded-lg p-2.5 text-[#F1F5F2] font-semibold outline-none focus:border-[#84CC16] pr-8"
                    />
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#9CAFA0] text-[18px] pointer-events-none">
                      edit_location
                    </span>
                  </div>

                  {/* Location Success Badge */}
                  {detectedLocationInfo && (
                    <div className="p-2 bg-[#111A13] rounded-lg border border-[#84CC16]/50 flex items-center justify-between text-[11px] animate-fade-in">
                      <div className="flex items-center gap-1.5 text-[#84CC16] font-medium">
                        <span className="material-symbols-outlined text-[15px] fill-icon">gps_fixed</span>
                        <span>
                          GPS Precision: <strong>±{detectedLocationInfo.accuracyMeters}m</strong> • ({detectedLocationInfo.latitude.toFixed(4)}°, {detectedLocationInfo.longitude.toFixed(4)}°)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoDetectLocation}
                        className="text-[10px] font-mono text-[#9CAFA0] hover:text-[#84CC16] underline ml-2 shrink-0"
                      >
                        Re-scan
                      </button>
                    </div>
                  )}

                  {/* Location Detection Toast Notification */}
                  {locationSuccessToast && (
                    <div className="text-[11px] text-[#84CC16] font-bold bg-[#84CC16]/10 border border-[#84CC16]/40 p-2 rounded flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>{locationSuccessToast}</span>
                    </div>
                  )}

                  {/* Location Error Notification */}
                  {locationDetectionError && (
                    <div className="p-2.5 bg-[#ef4444]/10 border border-[#ef4444]/40 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#ef4444] font-bold">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">location_off</span>
                          <span>Location Permission Notice</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLocationDetectionError(null)}
                          className="text-[#9CAFA0] hover:text-[#F1F5F2]"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[11px] text-[#F1F5F2]">{locationDetectionError}</p>
                      <button
                        type="button"
                        onClick={handleAutoDetectLocation}
                        className="text-[10px] font-bold uppercase text-[#84CC16] hover:underline flex items-center gap-1 pt-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">refresh</span>
                        Retry Auto-Detect
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Promo Coupon Card */}
              <div className="bg-[#16241A] p-3.5 rounded-xl border-2 border-[#1E2E21] space-y-2">
                <label className="text-[10px] font-['Space_Grotesk',sans-serif] font-black text-[#84CC16] uppercase tracking-wider block">
                  Kisan Subsidy / Agro Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code (e.g. KISAN2026)"
                    className="flex-grow text-xs bg-[#111A13] border-2 border-[#1E2E21] rounded p-2 text-[#F1F5F2] font-mono outline-none focus:border-[#84CC16] uppercase"
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 bg-[#ef4444]/20 border border-[#ef4444] text-[#ef4444] text-xs font-bold rounded hover:bg-[#ef4444]/30 uppercase"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="px-3.5 py-2 bg-[#84CC16] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-extrabold uppercase rounded hover:bg-[#99E321] transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>

                {/* Quick Coupon Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-[#9CAFA0]">Quick Apply:</span>
                  {[
                    { code: 'KISAN2026', label: '₹500 KISAN' },
                    { code: 'FARMIN10', label: '10% OFF' },
                    { code: 'GREENEARTH', label: 'FREE FREIGHT' },
                  ].map((chip) => (
                    <button
                      key={chip.code}
                      onClick={() => handleApplyCoupon(chip.code)}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#111A13] text-[#84CC16] border border-[#1E2E21] hover:border-[#84CC16] transition-colors"
                    >
                      {chip.code}
                    </button>
                  ))}
                </div>

                {couponError && (
                  <p className="text-[11px] text-[#ef4444] font-medium">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[11px] text-[#84CC16] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Voucher {appliedCoupon.code} applied! Saved ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>

              {/* Cost Summary */}
              <div className="space-y-1.5 pt-3 border-t-2 border-[#1E2E21] text-xs">
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Subtotal:</span>
                  <span className="font-bold text-[#F1F5F2] font-mono">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#84CC16]">
                    <span>Discount ({appliedCoupon?.code}):</span>
                    <span className="font-bold font-mono">
                      -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Freight Delivery:</span>
                  <span>
                    {shipping === 0 ? (
                      <strong className="text-[#84CC16] uppercase font-bold">
                        FREE (Over ₹3,000)
                      </strong>
                    ) : (
                      `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[#9CAFA0]">
                  <span>Estimated Tax (GST 5%):</span>
                  <span className="font-mono text-[#F1F5F2]">
                    ₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#F1F5F2] pt-2 border-t border-[#1E2E21]">
                  <span className="font-['Space_Grotesk',sans-serif] font-extrabold uppercase">Total:</span>
                  <span className="text-[#84CC16] font-['Space_Grotesk',sans-serif] font-black text-lg">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Step 2: Payment Method Selector */
            <div className="space-y-4">
              {/* Order total banner */}
              <div className="bg-[#16241A] p-3.5 rounded-xl border-2 border-[#1E2E21] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase text-[#9CAFA0]">
                    Total Amount Due:
                  </span>
                  <div className="text-xl font-black font-['Space_Grotesk',sans-serif] text-[#84CC16]">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right text-[11px] text-[#9CAFA0]">
                  <span>{cartItems.reduce((s, i) => s + i.quantity, 0)} Items</span>
                  <span className="block font-medium text-[#F1F5F2]">{deliveryAddress.split(',')[0]}</span>
                </div>
              </div>

              {/* All Payment Methods */}
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onChangeMethod={handlePaymentMethodChange}
                totalAmount={total}
              />

              {/* Security Banner */}
              <div className="p-3 bg-[#16241A] rounded-xl border border-[#1E2E21] flex items-center justify-between text-[11px] text-[#9CAFA0]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#84CC16] text-[16px]">verified_user</span>
                  <span>100% Buyer Protection & Agro Assurance</span>
                </div>
                <span className="text-[#84CC16] font-bold">farmin Secure</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        {!orderPlaced && cartItems.length > 0 && (
          <div className="p-4 bg-[#16241A] border-t-2 border-[#1E2E21] shrink-0">
            {currentStep === 'cart' ? (
              <button
                onClick={handleProceedToPayment}
                className="w-full py-3.5 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-lg transition-colors active:scale-95 shadow-sm flex items-center justify-center gap-2 border-2 border-[#84CC16]"
              >
                <span>Proceed to Payment Methods</span>
                <span className="material-symbols-outlined text-[18px] font-bold">arrow_forward</span>
                <span className="font-mono font-bold">• ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep('cart')}
                  className="px-4 py-3.5 border-2 border-[#1E2E21] bg-[#111A13] text-[#9CAFA0] hover:text-[#F1F5F2] hover:border-[#84CC16] rounded-lg font-['Space_Grotesk',sans-serif] text-xs font-extrabold uppercase transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-grow py-3.5 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-lg transition-colors active:scale-95 shadow-sm flex items-center justify-center gap-2 border-2 border-[#84CC16]"
                >
                  <span className="material-symbols-outlined text-[18px] font-bold">
                    {selectedPaymentMethod === 'cod'
                      ? 'local_shipping'
                      : selectedPaymentMethod === 'upi'
                      ? 'open_in_new'
                      : 'verified'}
                  </span>
                  <span>
                    {selectedPaymentMethod === 'cod'
                      ? `Confirm & Pay on Delivery • ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      : selectedPaymentMethod === 'pay_after_harvest'
                      ? `Confirm Harvest Credit • ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      : selectedPaymentMethod === 'upi'
                      ? `Open ${paymentDetails?.title || 'UPI App'} & Pay • ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      : `Pay Now • ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
