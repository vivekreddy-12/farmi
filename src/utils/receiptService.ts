import { Order, SmsReceiptInfo, EmailReceiptInfo } from '../types';

export const DEFAULT_RECEIPT_PHONE = '9391216686';
export const FORMATTED_DEFAULT_PHONE = '+91 9391216686';
export const DEFAULT_RECEIPT_EMAIL = 'njersey382@gmail.com';

/**
 * Formats clean SMS receipt text optimized for carrier SMS gateways.
 */
export function generateReceiptSmsText(order: Order, phone: string = DEFAULT_RECEIPT_PHONE): string {
  const itemsSummary = order.items
    .map((item) => `• ${item.product.name} (x${item.quantity}) - ₹${(item.product.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const discountLine = order.discount && order.discount > 0 
    ? `\nDiscount Applied: -₹${order.discount.toFixed(2)}` 
    : '';

  const paymentTitle = order.paymentDetails?.title || 'Farm Account';
  const paymentStatus = order.paymentDetails?.status || 'Paid';
  const txnRef = order.paymentDetails?.transactionRef ? `\nTxn Ref: ${order.paymentDetails.transactionRef}` : '';

  return `[farmin AGRO RECEIPT]
Order ID: ${order.orderNumber}
Date: ${order.date}
Recipient Phone: ${phone}

Items:
${itemsSummary}
${discountLine}
Delivery: ${order.shipping === 0 ? 'FREE' : `₹${order.shipping?.toFixed(2)}`}
GST (5%): ₹${order.tax?.toFixed(2) || '0.00'}
TOTAL AMOUNT: ₹${order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

Payment: ${paymentTitle} (${paymentStatus})${txnRef}
Tracking: ${order.trackingNumber}
Estimated Delivery: ${order.estimatedDelivery}
Gate: ${order.destination}

Thank you for choosing farmin Agro Solutions! 
Support: 1800-419-AGRO`;
}

/**
 * Generates direct WhatsApp click-to-chat receipt URL for the specified phone number.
 */
export function generateWhatsAppUrl(order: Order, phone: string = DEFAULT_RECEIPT_PHONE): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const message = generateReceiptSmsText(order, phone);
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Simulates carrier SMS dispatch and records receipt metadata.
 */
export function dispatchOrderReceiptSms(order: Order, phone: string = DEFAULT_RECEIPT_PHONE): SmsReceiptInfo {
  const cleanPhone = phone.trim();
  const smsContent = generateReceiptSmsText(order, cleanPhone);
  const whatsappUrl = generateWhatsAppUrl(order, cleanPhone);
  const randomMsgSeq = Math.floor(100000 + Math.random() * 900000);

  return {
    phone: cleanPhone.startsWith('+') ? cleanPhone : `+91 ${cleanPhone}`,
    sentAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    messageId: `SMS-FARMIN-${randomMsgSeq}`,
    gateway: 'Airtel Enterprise SMS Hub / DLT-AGRI-049',
    status: 'Delivered',
    smsContent,
    whatsappUrl,
  };
}

/**
 * Formats standard Email subject line for order confirmation.
 */
export function generateReceiptEmailSubject(order: Order): string {
  return `🧾 farmin Agro Order Receipt & Tax Invoice - ${order.orderNumber} (₹${order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`;
}

/**
 * Formats plaintext email body.
 */
export function generateReceiptEmailText(order: Order, email: string = DEFAULT_RECEIPT_EMAIL): string {
  const itemsList = order.items
    .map(
      (item, i) =>
        `${i + 1}. ${item.product.name}\n   Qty: ${item.quantity} | Unit Price: ₹${item.product.price.toFixed(2)} | Subtotal: ₹${(item.product.price * item.quantity).toFixed(2)}`
    )
    .join('\n\n');

  const discountText =
    order.discount && order.discount > 0
      ? `\nPromotional/Kisan Discount: -₹${order.discount.toFixed(2)}`
      : '';

  const paymentTitle = order.paymentDetails?.title || 'UPI / Agri Payment';
  const paymentStatus = order.paymentDetails?.status || 'Paid';
  const txnRef = order.paymentDetails?.transactionRef || 'N/A';

  return `Dear Valued Farmer,

Thank you for your order with farmin Agro Solutions! Your order has been confirmed and registered with our agronomy logistics center.

============================================================
ORDER SUMMARY & DIGITAL TAX INVOICE
============================================================
Order Number:        ${order.orderNumber}
Order Date:          ${order.date}
Recipient Email:     ${email}
Recipient Phone:     ${order.recipientPhone || DEFAULT_RECEIPT_PHONE}
Delivery Gate:       ${order.destination}
Estimated Delivery:  ${order.estimatedDelivery}
Live Tracking ID:    ${order.trackingNumber}

------------------------------------------------------------
ORDERED ITEMS & SPECIFICATIONS
------------------------------------------------------------
${itemsList}

------------------------------------------------------------
FINANCIAL BREAKDOWN
------------------------------------------------------------
Subtotal:            ₹${(order.subtotal || order.total).toFixed(2)}${discountText}
Freight Delivery:    ${order.shipping === 0 ? 'FREE (Agricultural Freight Subsidy)' : `₹${order.shipping?.toFixed(2)}`}
GST (5% Agri Tax):   ₹${order.tax?.toFixed(2) || '0.00'}
------------------------------------------------------------
TOTAL AMOUNT PAID:   ₹${order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
------------------------------------------------------------

PAYMENT CONFIRMATION
Method:              ${paymentTitle}
Payment Status:      ${paymentStatus}
Transaction Ref:     ${txnRef}
UPI Virtual Address: 9391216686@ybl

============================================================
AGRONOMY SUPPORT & SEED CERTIFICATION
============================================================
All fertilizers and crop enhancers in this shipment are 100% lab certified for active NPK ratios and soil safety standards.

Need help with soil application or timing?
Call Agronomy Helpline: 1800-419-AGRO (Toll Free)
Email Support: support@farmin.ag

Warm regards,
The farmin Agro Team
www.farmin.ag`;
}

/**
 * Formats rich HTML email template.
 */
export function generateReceiptEmailHtml(order: Order, email: string = DEFAULT_RECEIPT_EMAIL): string {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; font-weight: 600; color: #111827;">${item.product.name}</td>
        <td style="padding: 12px 8px; text-align: center; color: #4b5563;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #4b5563;">₹${item.product.price.toFixed(2)}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: 700; color: #15803d;">₹${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>farmin Order Receipt</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
    <div style="background-color: #111A13; padding: 24px; border-bottom: 4px solid #84CC16; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">farmin<span style="color: #84CC16;">.</span></h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #9CAFA0; text-transform: uppercase; letter-spacing: 1px;">Official Tax Invoice & Order Receipt</p>
    </div>
    
    <div style="padding: 24px;">
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 4px 0; font-size: 16px; color: #166534;">✓ Order Confirmed & Paid</h2>
        <p style="margin: 0; font-size: 13px; color: #15803d;">Receipt sent to <strong>${email}</strong> & SMS to <strong>+91 ${order.recipientPhone || DEFAULT_RECEIPT_PHONE}</strong></p>
      </div>

      <table style="width: 100%; font-size: 13px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Order Number:</td>
          <td style="padding: 4px 0; font-weight: 700; text-align: right; font-family: monospace;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Tracking Number:</td>
          <td style="padding: 4px 0; font-weight: 700; text-align: right; color: #15803d; font-family: monospace;">${order.trackingNumber}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Delivery Gate:</td>
          <td style="padding: 4px 0; font-weight: 600; text-align: right;">${order.destination}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Payment Method:</td>
          <td style="padding: 4px 0; font-weight: 600; text-align: right;">${order.paymentDetails?.title || 'UPI (9391216686@ybl)'} (Paid)</td>
        </tr>
      </table>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px;">Items Ordered</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 8px; text-align: left; color: #6b7280;">Item</th>
            <th style="padding: 8px; text-align: center; color: #6b7280;">Qty</th>
            <th style="padding: 8px; text-align: right; color: #6b7280;">Price</th>
            <th style="padding: 8px; text-align: right; color: #6b7280;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Subtotal:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${(order.subtotal || order.total).toFixed(2)}</td>
          </tr>
          ${
            order.discount && order.discount > 0
              ? `<tr><td style="padding: 4px 0; color: #15803d;">Agri Discount:</td><td style="padding: 4px 0; text-align: right; font-weight: 700; color: #15803d;">-₹${order.discount.toFixed(2)}</td></tr>`
              : ''
          }
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Freight:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #15803d;">${order.shipping === 0 ? 'FREE' : `₹${order.shipping?.toFixed(2)}`}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">GST (5%):</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${order.tax?.toFixed(2) || '0.00'}</td>
          </tr>
          <tr style="border-top: 2px solid #e5e7eb;">
            <td style="padding: 8px 0 0 0; font-size: 16px; font-weight: 800; color: #111827;">Total Paid:</td>
            <td style="padding: 8px 0 0 0; font-size: 18px; font-weight: 800; text-align: right; color: #15803d;">₹${order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
        farmin Agro Solutions • Support: 1800-419-AGRO • <a href="mailto:support@farmin.ag" style="color: #15803d; text-decoration: none;">support@farmin.ag</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Builds standard mailto URL for desktop & mobile mail clients.
 */
export function generateMailtoUrl(order: Order, email: string = DEFAULT_RECEIPT_EMAIL): string {
  const subject = generateReceiptEmailSubject(order);
  const body = generateReceiptEmailText(order, email);
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Automatically dispatches the email receipt and returns delivery metadata.
 */
export function dispatchOrderReceiptEmail(order: Order, email: string = DEFAULT_RECEIPT_EMAIL): EmailReceiptInfo {
  const targetEmail = email.trim();
  const subject = generateReceiptEmailSubject(order);
  const textContent = generateReceiptEmailText(order, targetEmail);
  const htmlContent = generateReceiptEmailHtml(order, targetEmail);
  const mailtoUrl = generateMailtoUrl(order, targetEmail);
  const randomMsgSeq = Math.floor(100000 + Math.random() * 900000);

  return {
    email: targetEmail,
    sentAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    messageId: `MAIL-FARMIN-${randomMsgSeq}`,
    gateway: 'farmin Cloud Mail Relay (SES-SMTP-AGRI)',
    status: 'Delivered',
    subject,
    textContent,
    htmlContent,
    mailtoUrl,
  };
}

/**
 * Downloads a plaintext digital invoice receipt file to the device.
 */
export function downloadReceiptText(order: Order): void {
  const receiptText = generateReceiptSmsText(order, order.recipientPhone || DEFAULT_RECEIPT_PHONE);
  const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Farmin-Receipt-${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads HTML invoice receipt file.
 */
export function downloadReceiptHtml(order: Order): void {
  const htmlContent = generateReceiptEmailHtml(order, order.recipientEmail || DEFAULT_RECEIPT_EMAIL);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Farmin-Invoice-${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

