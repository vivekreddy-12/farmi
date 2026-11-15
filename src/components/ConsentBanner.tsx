import React from 'react';

interface ConsentBannerProps {
  onChoose: (choice: 'accepted' | 'declined') => void;
}

const ConsentBanner: React.FC<ConsentBannerProps> = ({ onChoose }) => (
  <div
    role="dialog"
    aria-live="polite"
    aria-label="Cookie and analytics preferences"
    className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
  >
    <div className="mx-auto max-w-3xl bg-[#111A13] border-2 border-[#2A402E] rounded-xl shadow-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <p className="text-sm text-[#C7D4CA] leading-relaxed flex-1">
        We use local storage to keep you signed in and remember your cart. With your OK, we also use
        anonymous analytics to improve farmin. See our{' '}
        <a href="/privacy" className="text-[#84CC16] underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChoose('declined')}
          className="min-h-[44px] px-4 rounded-lg border-2 border-[#2A402E] text-[#F1F5F2] text-sm font-bold hover:border-[#84CC16] transition-colors"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => onChoose('accepted')}
          className="min-h-[44px] px-4 rounded-lg bg-[#84CC16] border-2 border-[#84CC16] text-[#0B110D] text-sm font-extrabold hover:bg-[#99E321] transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  </div>
);

export default ConsentBanner;
