import React from 'react';

interface ApplicationGuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationGuidesModal: React.FC<ApplicationGuidesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const guides = [
    {
      title: 'Precision Boom Sprayer Calibration Guide',
      category: 'Equipment',
      readTime: '4 min read',
      summary: 'Calculate nozzle flow rate (GPM), tractor ground speed, and tank agitation settings for uniform foliar micro-dosing.',
    },
    {
      title: 'Spinning Disc Granular Spreader Overlap Calculation',
      category: 'Broadcasting',
      readTime: '6 min read',
      summary: 'Ensure 100% pyramid overlap patterns to eliminate nitrogen streaking across wheat and corn fields.',
    },
    {
      title: 'Drip Fertigation Solubility & Jar Compatibility Test',
      category: 'Irrigation',
      readTime: '5 min read',
      summary: 'Perform jar tests before mixing Calcium Nitrate with Phosphorus or Sulfate solutions to avoid clogging emitter lines.',
    },
    {
      title: 'Soil Sampling Protocol for Accurate Laboratory Analysis',
      category: 'Soil Testing',
      readTime: '3 min read',
      summary: 'Best practices for taking 0-6 inch and 6-24 inch core samples across grid zones before seasonal planting.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-xl shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col max-h-[90vh] text-[#F1F5F2]">
        <div className="p-5 bg-[#16241A] border-b-2 border-[#1E2E21] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#84CC16] text-[#0B110D] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
            </div>
            <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2]">
              Agricultural Application Guides
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#111A13] text-[#9CAFA0] hover:text-[#F1F5F2] transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {guides.map((g, i) => (
            <div key={i} className="p-4 bg-[#16241A] border-2 border-[#1E2E21] rounded-xl hover:border-[#84CC16] transition-colors space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-['Space_Grotesk',sans-serif] font-black text-[#84CC16] uppercase tracking-wider">{g.category}</span>
                <span className="text-[#9CAFA0] font-bold">{g.readTime}</span>
              </div>
              <h4 className="font-['Space_Grotesk',sans-serif] font-extrabold text-sm text-[#F1F5F2]">{g.title}</h4>
              <p className="text-xs text-[#9CAFA0] leading-relaxed font-medium">{g.summary}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#16241A] border-t-2 border-[#1E2E21] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider font-extrabold rounded-lg hover:bg-[#99E321] transition-colors border-2 border-[#84CC16]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
