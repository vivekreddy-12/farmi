import React, { useState, useEffect } from 'react';
import { PaymentMethodType, PaymentDetails } from '../types';
import {
  launchPaymentApp,
  buildUpiUri,
  FARMIN_VPA,
  FARMIN_PAYEE_NAME,
} from '../utils/paymentAppLauncher';
import { sounds } from '../utils/soundEffects';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onChangeMethod: (method: PaymentMethodType, details: PaymentDetails) => void;
  totalAmount: number;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onChangeMethod,
  totalAmount,
}) => {
  // UPI states
  const [upiOption, setUpiOption] = useState<'apps' | 'id' | 'qr'>('apps');
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [upiId, setUpiId] = useState('9391216686@ybl');
  const [isUpiVerified, setIsUpiVerified] = useState(true);
  const [qrCountdown, setQrCountdown] = useState(300);
  const [appLaunchToast, setAppLaunchToast] = useState<string | null>(null);

  const handleLaunchApp = (appName: string) => {
    sounds.playClick();
    setAppLaunchToast(`Opening ${appName}... Please authorize the payment of ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to ${upiId || FARMIN_VPA}`);
    launchPaymentApp(appName, {
      appName,
      amount: totalAmount,
      vpa: upiId || FARMIN_VPA,
      payeeName: FARMIN_PAYEE_NAME,
      note: 'farmin Agro Order',
    });
    setTimeout(() => {
      setAppLaunchToast(null);
    }, 6000);
  };

  // Card states
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState('ALEX MILLER');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('789');
  const [saveCard, setSaveCard] = useState(true);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string>('card-1');

  // KCC states
  const [kccNumber, setKccNumber] = useState('KCC-9821-4402-9912');
  const [farmerRegId, setFarmerRegId] = useState('AGRI-FARM-KS-4029');
  const [kccBank, setKccBank] = useState('SBI Agricultural Development Branch');

  // Net Banking states
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [searchBankQuery, setSearchBankQuery] = useState('');

  // Wallet states
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // Pay After Harvest states
  const [harvestTerm, setHarvestTerm] = useState<'90_days' | '120_days' | '180_days'>('90_days');
  const [harvestSeason, setHarvestSeason] = useState('Kharif Harvest 2026');

  // Bank Transfer (NEFT/RTGS) states
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // COD states
  const [codType, setCodType] = useState<'cash' | 'field_pos'>('cash');

  // Timer for QR
  useEffect(() => {
    if (selectedMethod === 'upi' && upiOption === 'qr') {
      const timer = setInterval(() => {
        setQrCountdown((prev) => (prev > 0 ? prev - 1 : 300));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedMethod, upiOption]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper to trigger parent onChange with appropriate metadata
  const updateDetails = (method: PaymentMethodType) => {
    let details: PaymentDetails;
    switch (method) {
      case 'upi':
        details = {
          method: 'upi',
          title: upiOption === 'apps' ? `UPI - ${selectedUpiApp}` : upiOption === 'id' ? `UPI ID: ${upiId}` : 'UPI Dynamic QR Payment',
          subtitle: 'Instant Settlement • 0% Transaction Surcharge',
          icon: 'qr_code_scanner',
          status: 'Paid',
          transactionRef: `UPI-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
          meta: { app: selectedUpiApp, vpa: upiId },
        };
        break;
      case 'card':
        details = {
          method: 'card',
          title: selectedSavedCard === 'card-1' ? 'Visa Corporate Farm Card (•• 8821)' : 'RuPay Kisan Platinum (•• 1045)',
          subtitle: 'Secured via RBI Compliant 256-bit Tokenization',
          icon: 'credit_card',
          status: 'Paid',
          transactionRef: `CRD-AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
          meta: { cardHolder, expiry: cardExpiry },
        };
        break;
      case 'kcc':
        details = {
          method: 'kcc',
          title: `Kisan Credit Card (${kccBank.split(' ')[0]})`,
          subtitle: '4% Subsidized Farm Loan Rate • DBT Linked',
          icon: 'agriculture',
          status: 'Authorized',
          transactionRef: `KCC-DBT-${farmerRegId}`,
          meta: { kccNumber, farmerRegId, bank: kccBank },
        };
        break;
      case 'netbanking':
        details = {
          method: 'netbanking',
          title: `Net Banking - ${selectedBank}`,
          subtitle: 'Direct Corporate / Agri Account Debit',
          icon: 'account_balance',
          status: 'Paid',
          transactionRef: `NB-${selectedBank.substring(0, 3).toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`,
          meta: { bank: selectedBank },
        };
        break;
      case 'wallet':
        details = {
          method: 'wallet',
          title: `${selectedWallet} Agro Wallet`,
          subtitle: 'Instant 1-Tap Payment from Wallet Balance',
          icon: 'account_balance_wallet',
          status: 'Paid',
          transactionRef: `WLT-${selectedWallet.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          meta: { wallet: selectedWallet },
        };
        break;
      case 'pay_after_harvest':
        details = {
          method: 'pay_after_harvest',
          title: `Pay After Harvest (${harvestTerm.replace('_', ' ')})`,
          subtitle: `0% Interest Deferred to ${harvestSeason}`,
          icon: 'calendar_month',
          status: 'Deferred 0% Interest',
          transactionRef: `BNPL-HARVEST-${Math.floor(10000 + Math.random() * 90000)}`,
          meta: { harvestSeason, harvestTerm },
        };
        break;
      case 'bank_transfer':
        details = {
          method: 'bank_transfer',
          title: 'Direct Bank Wire (NEFT / RTGS / IMPS)',
          subtitle: 'Dedicated Virtual Escrow Account (HDFC0000042)',
          icon: 'receipt_long',
          status: 'Authorized',
          transactionRef: utrNumber ? `UTR-${utrNumber}` : `ESCROW-RTGS-${Math.floor(1000000 + Math.random() * 9000000)}`,
          meta: { beneficiary: 'Farmin Agro Supplies Ltd', virtualAcc: 'FARMIN906391992' },
        };
        break;
      case 'cod':
        details = {
          method: 'cod',
          title: codType === 'cash' ? 'Pay on Delivery (Cash on Flatbed Drop)' : 'Pay on Delivery (Field POS Terminal)',
          subtitle: 'Verified Phone OTP Required upon Delivery',
          icon: 'local_shipping',
          status: 'Pending on Delivery',
          transactionRef: `COD-VERIFY-${Math.floor(1000 + Math.random() * 9000)}`,
          meta: { codType },
        };
        break;
      default:
        details = {
          method: 'upi',
          title: 'UPI Payment',
          subtitle: 'Instant UPI Transfer',
          icon: 'qr_code_scanner',
          status: 'Paid',
        };
    }
    onChangeMethod(method, details);
  };

  const paymentMethodsList: {
    id: PaymentMethodType;
    name: string;
    tag?: string;
    tagColor?: string;
    icon: string;
    desc: string;
  }[] = [
    {
      id: 'upi',
      name: 'UPI (GPay / PhonePe / QR)',
      tag: 'FASTEST',
      tagColor: 'bg-[#84CC16] text-[#0B110D]',
      icon: 'qr_code_scanner',
      desc: 'Google Pay, PhonePe, Paytm, BHIM, Instant QR',
    },
    {
      id: 'card',
      name: 'Credit / Debit Cards',
      tag: 'VISA • MC • RUPAY',
      tagColor: 'bg-[#16241A] text-[#84CC16] border border-[#84CC16]/40',
      icon: 'credit_card',
      desc: 'RuPay Kisan, Visa, Mastercard, Corporate Cards',
    },
    {
      id: 'kcc',
      name: 'Kisan Credit Card (KCC)',
      tag: '4% SUBSIDY',
      tagColor: 'bg-[#84CC16]/20 text-[#84CC16] border border-[#84CC16]',
      icon: 'agriculture',
      desc: 'Direct Govt. Subsidy & Kisan Credit Loan A/C',
    },
    {
      id: 'netbanking',
      name: 'Net Banking (50+ Banks)',
      tag: 'ALL BANKS',
      tagColor: 'bg-[#16241A] text-[#9CAFA0] border border-[#1E2E21]',
      icon: 'account_balance',
      desc: 'SBI, HDFC, ICICI, PNB, Bank of Baroda & Rural Banks',
    },
    {
      id: 'wallet',
      name: 'Wallets & Agro Balance',
      tag: '1-TAP',
      tagColor: 'bg-[#16241A] text-[#84CC16] border border-[#84CC16]/30',
      icon: 'account_balance_wallet',
      desc: 'Paytm, Amazon Pay, PhonePe Wallet, MobiKwik',
    },
    {
      id: 'pay_after_harvest',
      name: 'Pay After Harvest (Agri-BNPL)',
      tag: '0% INTEREST',
      tagColor: 'bg-[#84CC16] text-[#0B110D] font-black',
      icon: 'calendar_month',
      desc: '90-180 Days Credit term settled after crop harvest',
    },
    {
      id: 'bank_transfer',
      name: 'Bank Wire (NEFT / RTGS)',
      tag: 'BULK ORDERS',
      tagColor: 'bg-[#16241A] text-[#9CAFA0] border border-[#1E2E21]',
      icon: 'receipt_long',
      desc: 'Virtual Escrow Account for commercial orders > ₹20,000',
    },
    {
      id: 'cod',
      name: 'Pay on Field Delivery',
      tag: 'CASH / POS',
      tagColor: 'bg-[#16241A] text-[#F1F5F2] border border-[#1E2E21]',
      icon: 'local_shipping',
      desc: 'Pay cash or swipe card with flatbed driver at farm gate',
    },
  ];

  const popularBanks = [
    { name: 'State Bank of India', code: 'SBI', icon: 'account_balance' },
    { name: 'HDFC Bank', code: 'HDFC', icon: 'account_balance' },
    { name: 'ICICI Bank', code: 'ICICI', icon: 'account_balance' },
    { name: 'Punjab National Bank', code: 'PNB', icon: 'account_balance' },
    { name: 'Bank of Baroda', code: 'BOB', icon: 'account_balance' },
    { name: 'Axis Bank', code: 'AXIS', icon: 'account_balance' },
  ];

  const allBanksList = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Axis Bank',
    'Canara Bank',
    'Union Bank of India',
    'Kotak Mahindra Bank',
    'Bank of India',
    'IndusInd Bank',
    'Central Bank of India',
    'Indian Overseas Bank',
    'NABARD Regional Rural Bank (RRB)',
    'IDBI Bank',
    'Federal Bank',
    'Yes Bank',
    'Punjab & Sind Bank',
  ];

  const filteredBanks = allBanksList.filter((b) =>
    b.toLowerCase().includes(searchBankQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-['Space_Grotesk',sans-serif] font-black text-[#84CC16] uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">payments</span>
          Select Payment Method
        </label>
        <span className="text-[10px] text-[#9CAFA0] font-mono flex items-center gap-1">
          <span className="material-symbols-outlined text-[#84CC16] text-[13px]">lock</span>
          256-Bit SSL Encrypted
        </span>
      </div>

      {/* Methods List Accordion / Selectors */}
      <div className="grid grid-cols-1 gap-2">
        {paymentMethodsList.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <div
              key={method.id}
              className={`rounded-xl border-2 transition-all overflow-hidden ${
                isSelected
                  ? 'border-[#84CC16] bg-[#16241A] shadow-md'
                  : 'border-[#1E2E21] bg-[#111A13] hover:border-[#84CC16]/40'
              }`}
            >
              {/* Header item */}
              <button
                type="button"
                onClick={() => updateDetails(method.id)}
                className="w-full p-3.5 flex items-center justify-between text-left gap-3 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-[#84CC16] text-[#0B110D] border-[#84CC16]'
                        : 'bg-[#16241A] text-[#9CAFA0] border-[#1E2E21]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] font-bold">
                      {method.icon}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2]">
                        {method.name}
                      </span>
                      {method.tag && (
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${method.tagColor}`}
                        >
                          {method.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9CAFA0] font-medium line-clamp-1 mt-0.5">
                      {method.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-[#84CC16] bg-[#84CC16]'
                        : 'border-[#1E2E21] bg-[#111A13]'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#0B110D]" />
                    )}
                  </div>
                </div>
              </button>

              {/* Sub-form when selected */}
              {isSelected && (
                <div className="p-4 pt-1 border-t border-[#1E2E21] bg-[#111A13]/90 text-xs space-y-3">
                  {/* UPI Form */}
                  {method.id === 'upi' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#16241A] rounded-lg border border-[#1E2E21]">
                        <button
                          type="button"
                          onClick={() => {
                            setUpiOption('apps');
                            setTimeout(() => updateDetails('upi'), 50);
                          }}
                          className={`py-1.5 rounded text-[11px] font-['Space_Grotesk',sans-serif] font-bold uppercase transition-colors ${
                            upiOption === 'apps'
                              ? 'bg-[#84CC16] text-[#0B110D]'
                              : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
                          }`}
                        >
                          UPI Apps
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUpiOption('id');
                            setTimeout(() => updateDetails('upi'), 50);
                          }}
                          className={`py-1.5 rounded text-[11px] font-['Space_Grotesk',sans-serif] font-bold uppercase transition-colors ${
                            upiOption === 'id'
                              ? 'bg-[#84CC16] text-[#0B110D]'
                              : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
                          }`}
                        >
                          UPI ID / VPA
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUpiOption('qr');
                            setTimeout(() => updateDetails('upi'), 50);
                          }}
                          className={`py-1.5 rounded text-[11px] font-['Space_Grotesk',sans-serif] font-bold uppercase transition-colors ${
                            upiOption === 'qr'
                              ? 'bg-[#84CC16] text-[#0B110D]'
                              : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
                          }`}
                        >
                          Scan QR Code
                        </button>
                      </div>

                      {upiOption === 'apps' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { name: 'Google Pay', icon: 'g_mobiledata', color: 'text-[#84CC16]' },
                              { name: 'PhonePe', icon: 'phone_iphone', color: 'text-[#84CC16]' },
                              { name: 'Paytm UPI', icon: 'account_balance_wallet', color: 'text-[#84CC16]' },
                              { name: 'BHIM UPI', icon: 'flag', color: 'text-[#84CC16]' },
                              { name: 'Amazon Pay', icon: 'shopping_cart', color: 'text-[#84CC16]' },
                              { name: 'CRED UPI', icon: 'credit_card', color: 'text-[#84CC16]' },
                            ].map((app) => (
                              <button
                                key={app.name}
                                type="button"
                                onClick={() => {
                                  setSelectedUpiApp(app.name);
                                  setTimeout(() => updateDetails('upi'), 50);
                                }}
                                className={`p-2.5 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                                  selectedUpiApp === app.name
                                    ? 'border-[#84CC16] bg-[#16241A] text-[#F1F5F2]'
                                    : 'border-[#1E2E21] bg-[#111A13] text-[#9CAFA0] hover:border-[#84CC16]/40'
                                }`}
                              >
                                <span className={`material-symbols-outlined text-[22px] ${app.color}`}>
                                  {app.icon}
                                </span>
                                <span className="text-[11px] font-bold font-['Space_Grotesk',sans-serif]">
                                  {app.name}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Direct Launch Button */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => handleLaunchApp(selectedUpiApp)}
                              className="w-full py-3 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm border border-[#84CC16]"
                            >
                              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                              <span>Open {selectedUpiApp} & Pay ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {upiOption === 'id' && (
                        <div className="space-y-3">
                          <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block">
                            Virtual Payment Address (VPA) / UPI ID
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-grow">
                              <input
                                type="text"
                                value={upiId}
                                onChange={(e) => {
                                  setUpiId(e.target.value);
                                  setIsUpiVerified(false);
                                }}
                                placeholder="9391216686@ybl"
                                className="w-full bg-[#16241A] border-2 border-[#84CC16]/70 rounded-lg p-2.5 text-xs text-[#F1F5F2] font-mono font-bold outline-none focus:border-[#84CC16]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsUpiVerified(true);
                                updateDetails('upi');
                              }}
                              className={`px-3.5 py-2 rounded-lg font-['Space_Grotesk',sans-serif] text-xs font-bold uppercase transition-colors shrink-0 ${
                                isUpiVerified
                                  ? 'bg-[#16241A] text-[#84CC16] border border-[#84CC16]'
                                  : 'bg-[#84CC16] text-[#0B110D]'
                              }`}
                            >
                              {isUpiVerified ? '✓ Verified' : 'Verify'}
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleLaunchApp('UPI')}
                              className="flex-grow py-2.5 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              <span>Open in UPI Payment App</span>
                            </button>
                          </div>

                          {isUpiVerified && (
                            <div className="p-2 bg-[#16241A] rounded border border-[#84CC16]/40 flex items-center justify-between text-[11px]">
                              <span className="text-[#84CC16] font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                Target UPI ID: <strong className="font-mono">{upiId}</strong> (YES Bank / PhonePe)
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(upiId, 'upi-id')}
                                className="text-[10px] font-mono text-[#9CAFA0] hover:text-[#84CC16]"
                              >
                                {copiedField === 'upi-id' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {upiOption === 'qr' && (
                        <div className="p-4 bg-[#16241A] rounded-xl border border-[#1E2E21] flex flex-col items-center text-center space-y-3">
                          <div className="p-3 bg-white rounded-xl shadow-inner inline-block">
                            {/* SVG Mock QR Code with Farmin Seed center */}
                            <svg viewBox="0 0 120 120" className="w-32 h-32">
                              <rect width="120" height="120" fill="#ffffff" />
                              {/* QR Pattern mock blocks */}
                              <rect x="10" y="10" width="30" height="30" fill="#0B110D" />
                              <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                              <rect x="20" y="20" width="10" height="10" fill="#0B110D" />
                              <rect x="80" y="10" width="30" height="30" fill="#0B110D" />
                              <rect x="85" y="15" width="20" height="20" fill="#ffffff" />
                              <rect x="90" y="20" width="10" height="10" fill="#0B110D" />
                              <rect x="10" y="80" width="30" height="30" fill="#0B110D" />
                              <rect x="15" y="85" width="20" height="20" fill="#ffffff" />
                              <rect x="20" y="90" width="10" height="10" fill="#0B110D" />
                              {/* Data pixels */}
                              <rect x="45" y="15" width="6" height="6" fill="#0B110D" />
                              <rect x="55" y="15" width="6" height="6" fill="#0B110D" />
                              <rect x="65" y="25" width="6" height="6" fill="#0B110D" />
                              <rect x="45" y="35" width="6" height="6" fill="#0B110D" />
                              <rect x="55" y="45" width="14" height="14" fill="#84CC16" rx="2" />
                              <rect x="75" y="45" width="6" height="6" fill="#0B110D" />
                              <rect x="20" y="55" width="6" height="6" fill="#0B110D" />
                              <rect x="35" y="65" width="6" height="6" fill="#0B110D" />
                              <rect x="45" y="75" width="6" height="6" fill="#0B110D" />
                              <rect x="60" y="85" width="6" height="6" fill="#0B110D" />
                              <rect x="80" y="75" width="6" height="6" fill="#0B110D" />
                              <rect x="95" y="85" width="6" height="6" fill="#0B110D" />
                            </svg>
                          </div>
                          <div className="space-y-1 w-full">
                            <span className="font-['Space_Grotesk',sans-serif] font-black text-sm text-[#F1F5F2]">
                              Scan & Pay ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <div className="flex items-center justify-center gap-1 text-[11px] text-[#9CAFA0]">
                              <span>UPI ID: <strong className="font-mono text-[#84CC16]">9391216686@ybl</strong></span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard('9391216686@ybl', 'upi-qr-id')}
                                className="text-[10px] text-[#84CC16] hover:underline ml-1"
                              >
                                {copiedField === 'upi-qr-id' ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <span className="text-[10px] font-mono text-[#84CC16] block pt-1">
                              QR Valid for: {Math.floor(qrCountdown / 60)}:{(qrCountdown % 60).toString().padStart(2, '0')}
                            </span>
                          </div>

                          {/* Direct App Opener from QR tab for phone users */}
                          <button
                            type="button"
                            onClick={() => handleLaunchApp('UPI')}
                            className="w-full py-2.5 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">phone_android</span>
                            <span>Open Payment App on This Device</span>
                          </button>
                        </div>
                      )}

                      {/* App Launch Toast Notification */}
                      {appLaunchToast && (
                        <div className="p-3 bg-[#84CC16]/15 border border-[#84CC16] rounded-xl flex items-center gap-2.5 text-xs text-[#F1F5F2] animate-fade-in">
                          <span className="material-symbols-outlined text-[#84CC16] text-[20px] shrink-0 animate-spin">
                            sync
                          </span>
                          <div className="flex-grow">
                            <p className="font-bold text-[#84CC16]">Launching Payment App</p>
                            <p className="text-[11px] text-[#9CAFA0]">{appLaunchToast}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Form */}
                  {method.id === 'card' && (
                    <div className="space-y-3">
                      {/* Saved Cards quick pick */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider">
                          Saved Farm Accounts
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSavedCard('card-1');
                              setCardNumber('4532 •••• •••• 8821');
                              updateDetails('card');
                            }}
                            className={`p-2.5 rounded-lg border-2 text-left flex items-center justify-between ${
                              selectedSavedCard === 'card-1'
                                ? 'border-[#84CC16] bg-[#16241A]'
                                : 'border-[#1E2E21] bg-[#111A13]'
                            }`}
                          >
                            <div>
                              <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2] block">
                                Visa Agri Corporate
                              </span>
                              <span className="font-mono text-[11px] text-[#84CC16]">•••• 8821</span>
                            </div>
                            <span className="text-[10px] font-bold bg-[#111A13] px-2 py-0.5 rounded text-[#9CAFA0] border border-[#1E2E21]">
                              Exp 08/29
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSavedCard('card-2');
                              setCardNumber('6082 •••• •••• 1045');
                              updateDetails('card');
                            }}
                            className={`p-2.5 rounded-lg border-2 text-left flex items-center justify-between ${
                              selectedSavedCard === 'card-2'
                                ? 'border-[#84CC16] bg-[#16241A]'
                                : 'border-[#1E2E21] bg-[#111A13]'
                            }`}
                          >
                            <div>
                              <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2] block">
                                RuPay Kisan Platinum
                              </span>
                              <span className="font-mono text-[11px] text-[#84CC16]">•••• 1045</span>
                            </div>
                            <span className="text-[10px] font-bold bg-[#111A13] px-2 py-0.5 rounded text-[#9CAFA0] border border-[#1E2E21]">
                              Exp 11/30
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Card Details Form */}
                      <div className="space-y-2 pt-1 border-t border-[#1E2E21]">
                        <div>
                          <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2.5 text-xs text-[#F1F5F2] font-mono outline-none focus:border-[#84CC16] pr-16"
                              placeholder="4000 1234 5678 9010"
                            />
                            <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#84CC16] text-[#0B110D] rounded">
                                {cardNumber.startsWith('6') ? 'RuPay' : 'Visa'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2.5 text-xs text-[#F1F5F2] font-mono outline-none focus:border-[#84CC16]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block mb-1">
                              CVV / CVC
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="•••"
                              className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2.5 text-xs text-[#F1F5F2] font-mono outline-none focus:border-[#84CC16]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block mb-1">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="ALEX MILLER"
                            className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2.5 text-xs text-[#F1F5F2] font-bold outline-none focus:border-[#84CC16]"
                          />
                        </div>

                        <label className="flex items-center gap-2 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="rounded accent-[#84CC16]"
                          />
                          <span className="text-[11px] text-[#9CAFA0]">
                            Securely tokenized as per RBI / PCI-DSS compliance for fast agro checkout
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* KCC Form */}
                  {method.id === 'kcc' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#84CC16]/10 border border-[#84CC16]/40 rounded-xl flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[#84CC16] text-[20px] shrink-0">
                          verified
                        </span>
                        <div>
                          <strong className="text-[#84CC16] font-['Space_Grotesk',sans-serif] block">
                            Govt. Subsidized Kisan Credit Scheme
                          </strong>
                          <span className="text-[11px] text-[#9CAFA0] leading-tight block">
                            Enjoy an effective 4.0% p.a. interest subvention with instant Direct Benefit Transfer (DBT) verification.
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block mb-1">
                            KCC 16-Digit Account Number
                          </label>
                          <input
                            type="text"
                            value={kccNumber}
                            onChange={(e) => setKccNumber(e.target.value)}
                            className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2.5 text-xs text-[#F1F5F2] font-mono outline-none focus:border-[#84CC16]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block mb-1">
                              Farmer Registration / Khata ID
                            </label>
                            <input
                              type="text"
                              value={farmerRegId}
                              onChange={(e) => setFarmerRegId(e.target.value)}
                              className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2.5 text-xs text-[#F1F5F2] font-mono outline-none focus:border-[#84CC16]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block mb-1">
                              Issuing Agri Bank
                            </label>
                            <select
                              value={kccBank}
                              onChange={(e) => setKccBank(e.target.value)}
                              className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2 text-xs text-[#F1F5F2] font-bold outline-none focus:border-[#84CC16]"
                            >
                              <option>SBI Agri Development</option>
                              <option>PNB Krishi Seva</option>
                              <option>Bank of Baroda Agro</option>
                              <option>NABARD Primary Credit</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Banking Form */}
                  {method.id === 'netbanking' && (
                    <div className="space-y-3">
                      <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block">
                        Popular Agricultural & Nationalized Banks
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {popularBanks.map((bank) => (
                          <button
                            key={bank.name}
                            type="button"
                            onClick={() => {
                              setSelectedBank(bank.name);
                              setTimeout(() => updateDetails('netbanking'), 50);
                            }}
                            className={`p-2 rounded-lg border-2 text-center transition-all flex flex-col items-center gap-1 ${
                              selectedBank === bank.name
                                ? 'border-[#84CC16] bg-[#16241A] text-[#84CC16]'
                                : 'border-[#1E2E21] bg-[#111A13] text-[#9CAFA0] hover:border-[#84CC16]/40'
                            }`}
                          >
                            <span className="font-['Space_Grotesk',sans-serif] font-black text-xs">
                              {bank.code}
                            </span>
                            <span className="text-[10px] font-medium line-clamp-1">
                              {bank.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block">
                          Or search from 50+ Banks
                        </label>
                        <input
                          type="text"
                          placeholder="Search bank name (e.g. Canara, Union, Kotak)..."
                          value={searchBankQuery}
                          onChange={(e) => setSearchBankQuery(e.target.value)}
                          className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2 text-xs text-[#F1F5F2] outline-none focus:border-[#84CC16] mb-1"
                        />
                        <select
                          value={selectedBank}
                          onChange={(e) => {
                            setSelectedBank(e.target.value);
                            setTimeout(() => updateDetails('netbanking'), 50);
                          }}
                          className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2.5 text-xs text-[#F1F5F2] font-bold outline-none focus:border-[#84CC16]"
                        >
                          {filteredBanks.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Wallets Form */}
                  {method.id === 'wallet' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Paytm Wallet', balance: '₹4,250.00', icon: 'account_balance_wallet' },
                          { name: 'Amazon Pay Balance', balance: '₹8,500.00', icon: 'shopping_bag' },
                          { name: 'PhonePe Wallet', balance: '₹2,300.00', icon: 'phone_iphone' },
                          { name: 'MobiKwik ZIP', balance: '₹12,000.00', icon: 'bolt' },
                        ].map((w) => (
                          <button
                            key={w.name}
                            type="button"
                            onClick={() => {
                              setSelectedWallet(w.name);
                              setTimeout(() => updateDetails('wallet'), 50);
                            }}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              selectedWallet === w.name
                                ? 'border-[#84CC16] bg-[#16241A]'
                                : 'border-[#1E2E21] bg-[#111A13] hover:border-[#84CC16]/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-[16px] text-[#84CC16]">
                                {w.icon}
                              </span>
                              <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2]">
                                {w.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#9CAFA0] block">
                              Available: <strong className="text-[#84CC16] font-mono">{w.balance}</strong>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pay After Harvest (BNPL) Form */}
                  {method.id === 'pay_after_harvest' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#84CC16]/10 border border-[#84CC16]/40 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-[#84CC16] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider">
                            Pre-Approved Farm Credit
                          </strong>
                          <span className="text-xs font-mono font-black text-[#84CC16] bg-[#16241A] px-2 py-0.5 rounded border border-[#84CC16]/40">
                            Limit: ₹1,50,000.00
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9CAFA0]">
                          Zero interest and zero upfront cost. Settle payment directly once your crop yield is liquidated at the agricultural produce market.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block">
                          Select Harvest Repayment Cycle
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { term: '90_days' as const, label: '90 Days', note: 'Kharif Nov 2026' },
                            { term: '120_days' as const, label: '120 Days', note: 'Winter Dec 2026' },
                            { term: '180_days' as const, label: '180 Days', note: 'Rabi Apr 2027' },
                          ].map((item) => (
                            <button
                              key={item.term}
                              type="button"
                              onClick={() => {
                                setHarvestTerm(item.term);
                                setHarvestSeason(item.note);
                                setTimeout(() => updateDetails('pay_after_harvest'), 50);
                              }}
                              className={`p-2 rounded-lg border-2 text-center transition-all ${
                                harvestTerm === item.term
                                  ? 'border-[#84CC16] bg-[#16241A] text-[#84CC16]'
                                  : 'border-[#1E2E21] bg-[#111A13] text-[#9CAFA0]'
                              }`}
                            >
                              <strong className="block text-xs font-['Space_Grotesk',sans-serif]">
                                {item.label}
                              </strong>
                              <span className="text-[9px] text-[#9CAFA0] block mt-0.5">
                                {item.note}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer (NEFT / RTGS) */}
                  {method.id === 'bank_transfer' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#16241A] rounded-xl border border-[#1E2E21] space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">
                          <span>Farmin Agro Dedicated Escrow Account</span>
                          <span>IMPS / NEFT / RTGS</span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center py-1 border-b border-[#1E2E21]">
                            <span className="text-[#9CAFA0]">Beneficiary Name:</span>
                            <span className="font-bold text-[#F1F5F2]">Farmin Agricultural Supplies Ltd</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-[#1E2E21]">
                            <span className="text-[#9CAFA0]">Virtual A/C No:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[#84CC16]">FARMIN906391992</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard('FARMIN906391992', 'acc')}
                                className="text-[10px] bg-[#111A13] hover:bg-[#84CC16] hover:text-[#0B110D] px-1.5 py-0.5 rounded border border-[#1E2E21] text-[#9CAFA0] transition-colors"
                              >
                                {copiedField === 'acc' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-[#9CAFA0]">IFSC Code:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[#F1F5F2]">HDFC0000042</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard('HDFC0000042', 'ifsc')}
                                className="text-[10px] bg-[#111A13] hover:bg-[#84CC16] hover:text-[#0B110D] px-1.5 py-0.5 rounded border border-[#1E2E21] text-[#9CAFA0] transition-colors"
                              >
                                {copiedField === 'ifsc' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-[#9CAFA0] uppercase font-bold tracking-wider block mb-1">
                          Optional: Enter Bank UTR Reference Number (if already wired)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. UTR49281048291"
                          value={utrNumber}
                          onChange={(e) => {
                            setUtrNumber(e.target.value);
                            updateDetails('bank_transfer');
                          }}
                          className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2 text-xs text-[#F1F5F2] font-mono outline-none focus:border-[#84CC16]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cash / POS on Delivery */}
                  {method.id === 'cod' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCodType('cash');
                            setTimeout(() => updateDetails('cod'), 50);
                          }}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            codType === 'cash'
                              ? 'border-[#84CC16] bg-[#16241A]'
                              : 'border-[#1E2E21] bg-[#111A13]'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-[#84CC16] text-[18px]">
                              payments
                            </span>
                            <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2]">
                              Cash on Delivery
                            </span>
                          </div>
                          <span className="text-[10px] text-[#9CAFA0]">
                            Hand currency to freight driver upon delivery
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCodType('field_pos');
                            setTimeout(() => updateDetails('cod'), 50);
                          }}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            codType === 'field_pos'
                              ? 'border-[#84CC16] bg-[#16241A]'
                              : 'border-[#1E2E21] bg-[#111A13]'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-[#84CC16] text-[18px]">
                              point_of_sale
                            </span>
                            <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2]">
                              Field POS Terminal
                            </span>
                          </div>
                          <span className="text-[10px] text-[#9CAFA0]">
                            Driver carries wireless card swipe & UPI QR machine
                          </span>
                        </button>
                      </div>

                      <div className="p-2.5 bg-[#16241A] rounded-lg border border-[#1E2E21] flex items-center gap-2 text-[11px] text-[#9CAFA0]">
                        <span className="material-symbols-outlined text-[#84CC16] text-[16px]">
                          sms
                        </span>
                        <span>A delivery confirmation OTP code will be sent to your registered phone number.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
