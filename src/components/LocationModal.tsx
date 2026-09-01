import React from 'react';
import { FarmLocation } from '../types';
import { FARM_LOCATIONS } from '../data/mockData';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: FarmLocation;
  onSelectLocation: (loc: FarmLocation) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-md shadow-2xl border-2 border-[#1E2E21] overflow-hidden text-[#F1F5F2]">
        <div className="p-5 bg-[#16241A] border-b-2 border-[#1E2E21] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#84CC16] fill-icon text-[22px]">
              location_on
            </span>
            <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2]">
              Select Farm Location
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#111A13] text-[#9CAFA0] hover:text-[#F1F5F2] transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-[#9CAFA0] font-medium font-['Plus_Jakarta_Sans',sans-serif]">
            Switching field locations updates the local weather window, humidity, and optimal spraying advisory.
          </p>

          <div className="space-y-2.5">
            {FARM_LOCATIONS.map((loc) => {
              const isSelected = loc.id === currentLocation.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                    isSelected
                      ? 'border-[#84CC16] bg-[#16241A] shadow-xs'
                      : 'border-[#1E2E21] bg-[#16241A]/50 hover:bg-[#16241A] hover:border-[#84CC16]'
                  }`}
                >
                  <div>
                    <h4 className="font-['Space_Grotesk',sans-serif] font-extrabold text-sm text-[#F1F5F2]">
                      {loc.name}, {loc.state}
                    </h4>
                    <p className="text-xs text-[#9CAFA0] mt-0.5 font-medium">{loc.forecastSummary}</p>
                    <div className="flex gap-3 text-[11px] text-[#84CC16] mt-1.5 font-bold">
                      <span>Temp: {loc.temperatureF}°F</span>
                      <span>Humidity: {loc.humidity}</span>
                      <span>Wind: {loc.wind}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider px-2.5 py-1 rounded ${
                        loc.sprayCondition === 'Optimal'
                          ? 'bg-[#84CC16] text-[#0B110D]'
                          : 'bg-[#111A13] text-[#9CAFA0] border border-[#1E2E21]'
                      }`}
                    >
                      {loc.sprayCondition}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
