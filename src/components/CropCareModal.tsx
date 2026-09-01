import React, { useState } from 'react';
import { Product } from '../types';
import { SoilAbsorptionVisualizer } from './SoilAbsorptionVisualizer';
import { sounds } from '../utils/soundEffects';

interface CropCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderProduct: (productName: string) => void;
  onOpenSoilScan?: () => void;
  products: Product[];
}

export const CropCareModal: React.FC<CropCareModalProps> = ({
  isOpen,
  onClose,
  onOrderProduct,
  onOpenSoilScan,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'simulation'>('diagnostic');
  const [selectedCrop, setSelectedCrop] = useState('Corn');
  const [symptom, setSymptom] = useState('yellow-bottom-leaves');

  if (!isOpen) return null;

  const diagnostics: Record<string, { issue: string; severity: string; remedy: string; recommendedProduct: string }> = {
    'yellow-bottom-leaves': {
      issue: 'Nitrogen Deficiency (Chlorosis)',
      severity: 'Moderate to High',
      remedy: 'Apply fast-acting water-soluble nitrogen or side-dress Urea immediately before tasseling/heading.',
      recommendedProduct: 'Pro-Gro Nitrogen Plus',
    },
    'purple-sheath': {
      issue: 'Phosphorus Deficiency (Purpling)',
      severity: 'Moderate',
      remedy: 'Root zone phosphorus uptake is restricted, often due to cold or compacted soil. Band Diammonium Phosphate (DAP).',
      recommendedProduct: 'Diammonium Phosphate (DAP 18-46-0)',
    },
    'brown-leaf-edges': {
      issue: 'Potassium Deficiency (Marginal Scorch)',
      severity: 'High',
      remedy: 'Stalk weakness and poor drought resistance. Apply Sulfate of Potash or balanced slow-release NPK pellets.',
      recommendedProduct: 'Time-Release NPK blend',
    },
    'blossom-rot': {
      issue: 'Calcium Deficiency / Moisture Stress',
      severity: 'High (Fruit Loss)',
      remedy: 'Foliar spray with chelated Bio-Calcium and equalize drip irrigation cycles.',
      recommendedProduct: 'Bio-Calcium Organic Booster',
    },
    'interveinal-yellow': {
      issue: 'Zinc / Iron Micronutrient Lockup',
      severity: 'Moderate',
      remedy: 'Soil pH is likely alkaline. Apply EDTA chelated micronutrients as a foliar mist during early mornings.',
      recommendedProduct: 'Chelated Micronutrient Complex',
    },
  };

  const activeDiagnosis = diagnostics[symptom] || diagnostics['yellow-bottom-leaves'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-lg shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col max-h-[90vh] text-[#F1F5F2]">
        {/* Header */}
        <div className="p-5 bg-[#16241A] border-b-2 border-[#1E2E21] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#84CC16] text-[#0B110D] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">agriculture</span>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2]">
                Crop Care & Diagnostic Assistant
              </h3>
              <span className="text-xs text-[#9CAFA0] font-medium">Instant agronomic issue diagnosis</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#111A13] text-[#9CAFA0] hover:text-[#F1F5F2] transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex border-b-2 border-[#1E2E21] bg-[#16241A]/60">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('diagnostic');
            }}
            className={`flex-1 py-2.5 text-xs font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'diagnostic'
                ? 'bg-[#16241A] text-[#84CC16] border-b-2 border-[#84CC16]'
                : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">biotech</span>
            Field Symptom Diagnosis
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('simulation');
            }}
            className={`flex-1 py-2.5 text-xs font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'simulation'
                ? 'bg-[#16241A] text-[#84CC16] border-b-2 border-[#84CC16]'
                : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">science</span>
            Soil Absorption Physics Lab
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {activeTab === 'simulation' ? (
            <SoilAbsorptionVisualizer />
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider text-[#84CC16]">1. Select Your Crop:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Corn', 'Rice', 'Wheat', 'Tomatoes', 'Soybeans', 'Berries'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedCrop(c);
                      }}
                      className={`py-2 px-2 text-xs font-['Space_Grotesk',sans-serif] font-bold uppercase rounded-lg border-2 transition-all ${
                        selectedCrop === c
                          ? 'bg-[#84CC16] text-[#0B110D] border-[#84CC16]'
                          : 'bg-[#16241A] text-[#F1F5F2] border-[#1E2E21] hover:border-[#84CC16]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider text-[#84CC16]">2. Observed Field Symptoms:</label>
                <select
                  value={symptom}
                  onChange={(e) => {
                    sounds.playClick();
                    setSymptom(e.target.value);
                  }}
                  className="w-full bg-[#16241A] border-2 border-[#1E2E21] rounded-lg p-2.5 text-xs text-[#F1F5F2] font-bold outline-none focus:border-[#84CC16]"
                >
                  <option value="yellow-bottom-leaves" className="bg-[#16241A] text-[#F1F5F2]">Lower leaves turning pale yellow (V-shape along midrib)</option>
                  <option value="purple-sheath" className="bg-[#16241A] text-[#F1F5F2]">Stunted growth with purplish leaves and stems</option>
                  <option value="brown-leaf-edges" className="bg-[#16241A] text-[#F1F5F2]">Brown crispy scorching along leaf margins and tips</option>
                  <option value="blossom-rot" className="bg-[#16241A] text-[#F1F5F2]">Black sunken leathery spots on bottom of fruits</option>
                  <option value="interveinal-yellow" className="bg-[#16241A] text-[#F1F5F2]">Yellowing between leaf veins on top new growth</option>
                </select>
              </div>

              {/* Diagnostic Result */}
              <div className="bg-[#16241A] p-4 rounded-xl border-2 border-[#1E2E21] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-['Space_Grotesk',sans-serif] font-black text-[10px] uppercase tracking-wider text-[#84CC16]">Diagnosis:</span>
                  <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-bold uppercase tracking-wider bg-[#84CC16] text-[#0B110D] px-2 py-0.5 rounded">
                    Severity: {activeDiagnosis.severity}
                  </span>
                </div>

                <h4 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2]">
                  {activeDiagnosis.issue} in {selectedCrop}
                </h4>

                <p className="text-xs text-[#9CAFA0] leading-relaxed font-medium">
                  <strong className="text-[#F1F5F2]">Agronomic Action:</strong> {activeDiagnosis.remedy}
                </p>

                <div className="pt-2 border-t border-[#1E2E21] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#9CAFA0] block font-bold text-[10px] uppercase">Recommended Formula:</span>
                    <strong className="text-[#84CC16] font-['Space_Grotesk',sans-serif] font-extrabold">{activeDiagnosis.recommendedProduct}</strong>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      onOrderProduct(activeDiagnosis.recommendedProduct);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] font-bold uppercase rounded-lg hover:bg-[#99E321] transition-colors border border-[#84CC16]"
                  >
                    View Product
                  </button>
                </div>

                {onOpenSoilScan && (
                  <div className="mt-3 p-3 bg-[#16241A] rounded-lg border border-[#84CC16]/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="material-symbols-outlined text-[#84CC16] text-[18px]">photo_camera</span>
                      <span className="text-[#F1F5F2] font-semibold">Test your soil directly with Camera</span>
                    </div>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onClose();
                        onOpenSoilScan();
                      }}
                      className="text-[11px] font-['Space_Grotesk',sans-serif] font-extrabold uppercase px-2.5 py-1 bg-[#84CC16] text-[#0B110D] rounded hover:bg-[#99E321] transition-colors whitespace-nowrap"
                    >
                      Scan Soil
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16241A] border-t-2 border-[#1E2E21] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-wider rounded-lg hover:bg-[#99E321] transition-colors border-2 border-[#84CC16]"
          >
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
