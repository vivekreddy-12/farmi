import React, { useState } from 'react';
import { Product } from '../types';

interface SoilScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewProductDetails: (product: Product) => void;
  products: Product[];
}

export const SoilScanModal: React.FC<SoilScanModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onViewProductDetails,
  products,
}) => {
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [sampleType, setSampleType] = useState<'topsoil' | 'clay' | 'sandy' | 'loam'>('topsoil');
  const [selectedPreset, setSelectedPreset] = useState<number>(0);

  if (!isOpen) return null;

  const samplePresets = [
    {
      title: 'North Field Corn Parcel (Nitrogen Depletion)',
      texture: 'Dark Silt Loam',
      ph: '6.2 (Slightly Acidic)',
      organicMatter: '2.4% (Sub-optimal)',
      nLevel: 'Low (18 ppm)',
      pLevel: 'Optimal (42 ppm)',
      kLevel: 'Medium (160 ppm)',
      moisture: '28%',
      ec: '1.2 dS/m',
      deficiency: 'Severe Nitrogen & Trace Zinc Deficiency',
      recommendedProduct: products[0], // Pro-Gro Nitrogen Plus
      remedy: 'Broadcast 45 lbs/acre rapid nitrogen solution followed by light sprinkler fertigation.',
    },
    {
      title: 'South Block Orchard (Calcium & Alkaline Lockup)',
      texture: 'Calcareous Clay',
      ph: '7.8 (Alkaline)',
      organicMatter: '1.8%',
      nLevel: 'Medium (35 ppm)',
      pLevel: 'Low (14 ppm - Locked)',
      kLevel: 'High (240 ppm)',
      moisture: '34%',
      ec: '2.1 dS/m',
      deficiency: 'Calcium Bioavailability Deficit & Phosphate Fixation',
      recommendedProduct: products[4] || products[1], // Bio-Calcium or EcoBalance
      remedy: 'Foliar application of Bio-Calcium booster combined with humic acid soil conditioner.',
    },
    {
      title: 'Greenhouse Seedling Bed (Phosphorus Deficiency)',
      texture: 'Perlite & Peat Blend',
      ph: '6.5 (Optimal)',
      organicMatter: '5.2%',
      nLevel: 'Optimal (48 ppm)',
      pLevel: 'Low (8 ppm)',
      kLevel: 'Optimal (210 ppm)',
      moisture: '42%',
      ec: '0.9 dS/m',
      deficiency: 'Early Rooting Phosphate Starvation',
      recommendedProduct: products[3] || products[0], // DAP 18-46-0
      remedy: 'Apply water-soluble Diammonium Phosphate at 2.5 kg per 100 sq meters.',
    },
  ];

  const currentSample = samplePresets[selectedPreset];

  const handleStartScan = () => {
    setScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col max-h-[92vh] text-[#F1F5F2]">
        {/* Header */}
        <div className="p-5 bg-[#16241A] border-b-2 border-[#1E2E21] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#84CC16] text-[#0B110D] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">document_scanner</span>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2]">
                AI Optical Soil Scanner & Spectrum Analysis
              </h3>
              <span className="text-xs text-[#9CAFA0] font-medium">
                Real-time NPK, Soil pH, & Trace Mineral Diagnostics
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Scanner Viewfinder / Camera Simulation */}
          <div className="relative rounded-2xl bg-[#0B110D] border-2 border-[#1E2E21] h-60 overflow-hidden flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1000&q=80"
              alt="Soil Sample"
              className="absolute inset-0 w-full h-full object-cover opacity-60 filter contrast-125"
            />
            
            {/* Viewfinder Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
              <div className="border-r border-b border-[#84CC16]" />
              <div className="border-r border-b border-[#84CC16]" />
              <div className="border-b border-[#84CC16]" />
              <div className="border-r border-b border-[#84CC16]" />
              <div className="border-r border-b border-[#84CC16]" />
              <div className="border-b border-[#84CC16]" />
              <div className="border-r border-[#84CC16]" />
              <div className="border-r border-[#84CC16]" />
              <div />
            </div>

            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#84CC16]" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#84CC16]" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#84CC16]" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#84CC16]" />

            {/* Scanning Laser Animation */}
            {scanning && (
              <div className="absolute inset-x-0 h-1 bg-[#84CC16] shadow-[0_0_15px_#84CC16] animate-pulse top-1/2 -translate-y-1/2" />
            )}

            {/* Viewfinder Status Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-[#111A13]/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-[#1E2E21] text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${scanning ? 'bg-amber-400 animate-ping' : scanComplete ? 'bg-[#84CC16]' : 'bg-white/50'}`} />
                <span className="font-mono font-bold text-[#F1F5F2]">
                  {scanning ? 'Analyzing Optical Spectrum...' : scanComplete ? 'Analysis Complete (98.4% Confidence)' : 'Sample Frame Ready'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#84CC16] font-black uppercase">
                Spectral Matrix v4.2
              </span>
            </div>
          </div>

          {/* Preset Selector for Field Simulation */}
          <div className="space-y-2">
            <label className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider text-[#84CC16] block">
              Select Field Sample or Test Target:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={preset.title}
                  onClick={() => {
                    setSelectedPreset(idx);
                    setScanComplete(true);
                  }}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                    selectedPreset === idx
                      ? 'border-[#84CC16] bg-[#16241A] text-[#F1F5F2]'
                      : 'border-[#1E2E21] bg-[#111A13] text-[#9CAFA0] hover:border-[#84CC16]/40'
                  }`}
                >
                  <strong className="block text-xs font-['Space_Grotesk',sans-serif] line-clamp-1">
                    {preset.title.split(' (')[0]}
                  </strong>
                  <span className="text-[10px] text-[#84CC16] block font-mono mt-0.5">
                    {preset.texture}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action trigger button */}
          <button
            onClick={handleStartScan}
            disabled={scanning}
            className="w-full py-3 bg-[#84CC16] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#99E321] transition-all flex items-center justify-center gap-2 border-2 border-[#84CC16] shadow-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px] font-bold">
              {scanning ? 'hourglass_top' : 'filter_center_focus'}
            </span>
            <span>{scanning ? 'Running Spectral NPK Scan...' : 'Scan New Soil Core Sample'}</span>
          </button>

          {/* Diagnostic Metrics Matrix */}
          {(scanComplete || !scanning) && currentSample && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#16241A] p-4 rounded-xl border-2 border-[#1E2E21] space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#1E2E21]">
                  <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">
                    Optical Diagnostic Telemetry
                  </span>
                  <span className="text-[10px] font-mono text-[#9CAFA0]">
                    Field: {currentSample.title.split(' (')[0]}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-[#111A13] p-2.5 rounded-lg border border-[#1E2E21]">
                    <span className="text-[10px] text-[#9CAFA0] block font-semibold">Soil pH</span>
                    <strong className="text-sm font-mono text-[#F1F5F2]">{currentSample.ph.split(' ')[0]}</strong>
                    <span className="text-[9px] text-[#84CC16] block">{currentSample.ph.split('(')[1]?.replace(')', '') || 'Normal'}</span>
                  </div>

                  <div className="bg-[#111A13] p-2.5 rounded-lg border border-[#1E2E21]">
                    <span className="text-[10px] text-[#9CAFA0] block font-semibold">Nitrogen (N)</span>
                    <strong className="text-sm font-mono text-amber-400">{currentSample.nLevel.split(' ')[0]}</strong>
                    <span className="text-[9px] text-[#9CAFA0] block">{currentSample.nLevel.split('(')[1]?.replace(')', '') || '18 ppm'}</span>
                  </div>

                  <div className="bg-[#111A13] p-2.5 rounded-lg border border-[#1E2E21]">
                    <span className="text-[10px] text-[#9CAFA0] block font-semibold">Phosphorus (P)</span>
                    <strong className="text-sm font-mono text-[#84CC16]">{currentSample.pLevel.split(' ')[0]}</strong>
                    <span className="text-[9px] text-[#9CAFA0] block">{currentSample.pLevel.split('(')[1]?.replace(')', '') || '42 ppm'}</span>
                  </div>

                  <div className="bg-[#111A13] p-2.5 rounded-lg border border-[#1E2E21]">
                    <span className="text-[10px] text-[#9CAFA0] block font-semibold">Potassium (K)</span>
                    <strong className="text-sm font-mono text-[#84CC16]">{currentSample.kLevel.split(' ')[0]}</strong>
                    <span className="text-[9px] text-[#9CAFA0] block">{currentSample.kLevel.split('(')[1]?.replace(')', '') || '160 ppm'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#111A13] rounded-lg border border-[#1E2E21] space-y-1">
                  <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase text-[#ef4444] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Detected Deficiency: {currentSample.deficiency}
                  </span>
                  <p className="text-xs text-[#9CAFA0] leading-relaxed">
                    {currentSample.remedy}
                  </p>
                </div>
              </div>

              {/* Recommended Product Direct Buy */}
              {currentSample.recommendedProduct && (
                <div className="bg-[#16241A] p-4 rounded-xl border-2 border-[#84CC16]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={currentSample.recommendedProduct.image}
                      alt={currentSample.recommendedProduct.name}
                      className="w-14 h-14 object-cover rounded-lg bg-[#111A13] border-2 border-[#1E2E21] shrink-0"
                    />
                    <div>
                      <span className="text-[9px] font-black font-['Space_Grotesk',sans-serif] uppercase tracking-wider bg-[#84CC16] text-[#0B110D] px-2 py-0.5 rounded">
                        Target Remediation Formula
                      </span>
                      <h4 className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2] mt-1">
                        {currentSample.recommendedProduct.name}
                      </h4>
                      <span className="text-xs font-mono font-black text-[#84CC16]">
                        ₹{currentSample.recommendedProduct.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} • {currentSample.recommendedProduct.weightOrVolume}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onViewProductDetails(currentSample.recommendedProduct!)}
                      className="px-3 py-2 border-2 border-[#1E2E21] hover:border-[#84CC16] rounded-lg text-xs font-bold text-[#F1F5F2] transition-colors"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => {
                        onAddToCart(currentSample.recommendedProduct!, 1);
                        onClose();
                      }}
                      className="px-4 py-2 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider rounded-lg hover:bg-[#99E321] transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px] font-bold">add_shopping_cart</span>
                      Add to Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16241A] border-t-2 border-[#1E2E21] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-wider rounded-lg hover:bg-[#99E321] transition-colors border-2 border-[#84CC16]"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
