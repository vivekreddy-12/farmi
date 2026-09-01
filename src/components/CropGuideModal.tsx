import React, { useState } from 'react';
import { CropGuide, Product } from '../types';

interface CropGuideModalProps {
  guide: CropGuide | null;
  onClose: () => void;
  onOrderRecommended: (productName: string) => void;
  products: Product[];
}

export const CropGuideModal: React.FC<CropGuideModalProps> = ({
  guide,
  onClose,
  onOrderRecommended,
}) => {
  const [fieldAcres, setFieldAcres] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'schedule' | 'deficiencies' | 'calculator'>('schedule');

  if (!guide) return null;

  const totalNitrogenLbs = guide.fullGuideDetails.nitrogenPerAcreLbs * fieldAcres;
  const totalPhosphorusLbs = guide.fullGuideDetails.phosphorusPerAcreLbs * fieldAcres;
  const totalPotassiumLbs = guide.fullGuideDetails.potassiumPerAcreLbs * fieldAcres;
  const estimatedUreaBags = Math.ceil(totalNitrogenLbs / 23); // ~23 lbs N per 50lb bag urea 46%
  const estimatedDapBags = Math.ceil(totalPhosphorusLbs / 23);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border-2 border-[#1E2E21] overflow-hidden text-[#F1F5F2]">
        {/* Modal Header */}
        <div className="relative h-44 sm:h-52 bg-[#16241A] overflow-hidden shrink-0 border-b-2 border-[#1E2E21]">
          <img
            src={guide.image}
            alt={guide.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#111A13] via-[#111A13]/60 to-transparent" />
          
          <button
            onClick={onClose}
            aria-label="Close Guide"
            className="absolute top-4 right-4 bg-[#111A13]/80 hover:bg-[#111A13] text-[#F1F5F2] p-2 rounded-full backdrop-blur-xs transition-colors z-10 border border-[#1E2E21]"
          >
            <span className="material-symbols-outlined text-[20px] block">close</span>
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-[#F1F5F2]">
            <span className="bg-[#84CC16] text-[#0B110D] px-2.5 py-0.5 rounded text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-widest mb-1.5 inline-block shadow-sm">
              {guide.badgeCategory} Guide
            </span>
            <h2 className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5F2]">
              {guide.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#9CAFA0] font-['Plus_Jakarta_Sans',sans-serif]">
              {guide.scientificName} • Optimum Soil pH: {guide.fullGuideDetails.optimumSoilPhRange}
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b-2 border-[#1E2E21] bg-[#16241A] px-4 gap-2 shrink-0 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-3.5 text-xs font-['Space_Grotesk',sans-serif] font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-[#84CC16] text-[#84CC16] bg-[#111A13]'
                : 'border-transparent text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">timeline</span>
            Timeline & Plan
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3 px-3.5 text-xs font-['Space_Grotesk',sans-serif] font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-[#84CC16] text-[#84CC16] bg-[#111A13]'
                : 'border-transparent text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">calculate</span>
            Dosage Calculator
          </button>

          <button
            onClick={() => setActiveTab('deficiencies')}
            className={`py-3 px-3.5 text-xs font-['Space_Grotesk',sans-serif] font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'deficiencies'
                ? 'border-[#84CC16] text-[#84CC16] bg-[#111A13]'
                : 'border-transparent text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Deficiencies
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-5">
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="bg-[#16241A] p-4 rounded-xl border-2 border-[#1E2E21]">
                <h3 className="text-xs font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider text-[#84CC16] flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#84CC16] text-[20px]">
                    {guide.recommendedIcon}
                  </span>
                  {guide.recommendedHeader}
                </h3>
                <p className="text-xs text-[#9CAFA0] leading-relaxed font-medium">
                  {guide.description} Basal placement provides deep root anchorage, followed by targeted top dressing at rapid biomass expansion.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk',sans-serif] font-extrabold text-xs uppercase tracking-wider text-[#84CC16]">Growth Stages & Application Plan:</h4>
                <div className="divide-y-2 divide-[#1E2E21] border-2 border-[#1E2E21] rounded-xl overflow-hidden">
                  {guide.fullGuideDetails.stages.map((stg, i) => (
                    <div key={i} className="p-4 bg-[#16241A] hover:bg-[#1C2C20] transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="font-['Space_Grotesk',sans-serif] font-extrabold text-sm text-[#F1F5F2] flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#84CC16] text-[#0B110D] text-[10px] flex items-center justify-center font-black">
                            {i + 1}
                          </span>
                          {stg.stage}
                        </span>
                        <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider text-[#84CC16] bg-[#111A13] px-2 py-0.5 rounded border border-[#1E2E21]">
                          {stg.timing}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#84CC16] mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                        Nutrient Input: {stg.fertilizerNeed}
                      </p>
                      <p className="text-xs text-[#9CAFA0] mt-0.5 leading-relaxed font-medium">
                        {stg.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="bg-[#16241A] p-4 rounded-xl border-2 border-[#1E2E21] text-[#F1F5F2]">
                <h4 className="font-['Space_Grotesk',sans-serif] font-extrabold text-sm mb-1 flex items-center gap-1.5 text-[#84CC16]">
                  <span className="material-symbols-outlined text-[20px]">yard</span>
                  Field Dosage Requirements
                </h4>
                <p className="text-xs text-[#9CAFA0] font-medium">
                  Enter your field acreage to calculate precise seasonal fertilizer demands.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#16241A] p-4 rounded-xl border-2 border-[#1E2E21]">
                <label className="text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase text-[#84CC16]">Target Field Size:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={fieldAcres}
                    onChange={(e) => setFieldAcres(Math.max(1, Number(e.target.value)))}
                    className="w-24 px-3 py-1.5 bg-[#111A13] border-2 border-[#1E2E21] rounded-lg font-bold text-base text-[#F1F5F2] focus:border-[#84CC16] outline-none text-center"
                  />
                  <span className="font-['Space_Grotesk',sans-serif] font-bold text-sm text-[#F1F5F2]">Acres</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#16241A] p-4 rounded-xl border-2 border-[#1E2E21] shadow-2xs text-center">
                  <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black text-[#84CC16] block uppercase tracking-wider">Total Nitrogen</span>
                  <span className="text-2xl font-['Space_Grotesk',sans-serif] font-black text-[#F1F5F2] block my-1">
                    {totalNitrogenLbs} lbs
                  </span>
                  <span className="text-[11px] text-[#9CAFA0] font-bold">~{estimatedUreaBags} bags (50lb Urea)</span>
                </div>

                <div className="bg-[#16241A] p-4 rounded-xl border-2 border-[#1E2E21] shadow-2xs text-center">
                  <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black text-[#84CC16] block uppercase tracking-wider">Total Phosphorus</span>
                  <span className="text-2xl font-['Space_Grotesk',sans-serif] font-black text-[#F1F5F2] block my-1">
                    {totalPhosphorusLbs} lbs
                  </span>
                  <span className="text-[11px] text-[#9CAFA0] font-bold">~{estimatedDapBags} bags (50lb DAP)</span>
                </div>

                <div className="bg-[#16241A] p-4 rounded-xl border-2 border-[#1E2E21] shadow-2xs text-center">
                  <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black text-[#84CC16] block uppercase tracking-wider">Total Potassium</span>
                  <span className="text-2xl font-['Space_Grotesk',sans-serif] font-black text-[#F1F5F2] block my-1">
                    {totalPotassiumLbs} lbs
                  </span>
                  <span className="text-[11px] text-[#9CAFA0] font-bold">Muriate of Potash</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deficiencies' && (
            <div className="space-y-3">
              <h4 className="font-['Space_Grotesk',sans-serif] font-extrabold text-xs uppercase tracking-wider text-[#84CC16]">Diagnostic Clues & Remediation:</h4>
              <div className="space-y-3">
                {guide.fullGuideDetails.commonDeficiencies.map((def, idx) => (
                  <div key={idx} className="p-4 bg-[#16241A] rounded-xl border-2 border-[#1E2E21] space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#84CC16] text-[20px]">
                        error_outline
                      </span>
                      <span className="font-['Space_Grotesk',sans-serif] font-extrabold text-sm text-[#F1F5F2]">
                        {def.nutrient} Deficiency
                      </span>
                    </div>
                    <p className="text-xs text-[#F1F5F2] font-medium">
                      <strong className="text-[#84CC16]">Symptoms:</strong> {def.symptoms}
                    </p>
                    <p className="text-xs text-[#9CAFA0] font-medium bg-[#111A13] p-2.5 rounded-lg border border-[#1E2E21]">
                      <strong className="text-[#84CC16]">Corrective Action:</strong> {def.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#16241A] border-t-2 border-[#1E2E21] flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <span className="text-xs text-[#9CAFA0] font-medium">
            Need field-specific advice? Consult our certified soil agronomists.
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border-2 border-[#1E2E21] text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-wider text-[#9CAFA0] hover:text-[#F1F5F2] hover:border-[#84CC16] flex-1 sm:flex-none transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onOrderRecommended(guide.name);
                onClose();
              }}
              className="px-5 py-2.5 rounded-lg bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider hover:bg-[#99E321] transition-colors flex-1 sm:flex-none flex items-center justify-center gap-1.5 border-2 border-[#84CC16]"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">shopping_cart</span>
              Order Fertilizer for {guide.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
