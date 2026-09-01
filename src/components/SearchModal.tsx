import React, { useState } from 'react';
import { CropGuide, Product, FAQItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropGuides: CropGuide[];
  products: Product[];
  faqs: FAQItem[];
  onSelectCropGuide: (guide: CropGuide) => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  cropGuides,
  products,
  faqs,
  onSelectCropGuide,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const matchedCrops = query.trim()
    ? cropGuides.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.scientificName.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchedProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          (p.npkRatio && p.npkRatio.includes(query))
      )
    : [];

  const matchedFaqs = query.trim()
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(query.toLowerCase()) ||
          f.answer.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/75 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col max-h-[80vh] text-[#F1F5F2]">
        {/* Search Header */}
        <div className="p-4 border-b-2 border-[#1E2E21] bg-[#16241A] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#84CC16] text-[24px]">search</span>
          <input
            type="text"
            autoFocus
            placeholder="Search crops, fertilizers, NPK formulations, questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-transparent text-sm font-bold text-[#F1F5F2] outline-none font-['Plus_Jakarta_Sans',sans-serif] placeholder:text-[#9CAFA0]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#9CAFA0] hover:text-[#F1F5F2]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[11px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider text-[#84CC16] hover:bg-[#84CC16] hover:text-[#0B110D] px-2 py-1 bg-[#111A13] border border-[#1E2E21] rounded"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="p-5 overflow-y-auto space-y-5">
          {!query.trim() ? (
            <div className="py-8 text-center text-[#9CAFA0] text-xs space-y-2">
              <span className="material-symbols-outlined text-4xl block text-[#84CC16]">
                travel_explore
              </span>
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[#9CAFA0]">
                Type to search across crop knowledge guides, fertilizer products, and agronomy FAQs.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Rice', 'Tomatoes', 'Urea', 'NPK 10-10-10', 'Soil pH', 'Blossom rot'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-[11px] bg-[#16241A] hover:bg-[#84CC16] hover:text-[#0B110D] text-[#84CC16] font-['Space_Grotesk',sans-serif] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#1E2E21] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {matchedCrops.length === 0 && matchedProducts.length === 0 && matchedFaqs.length === 0 && (
                <div className="py-8 text-center text-[#9CAFA0] text-xs font-['Plus_Jakarta_Sans',sans-serif]">
                  No matching results found for "{query}".
                </div>
              )}

              {/* Crop Guides */}
              {matchedCrops.length > 0 && (
                <div>
                  <h4 className="text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-widest text-[#84CC16] mb-2">
                    Crop Guides ({matchedCrops.length})
                  </h4>
                  <div className="divide-y-2 divide-[#1E2E21] border-2 border-[#1E2E21] rounded-xl overflow-hidden">
                    {matchedCrops.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCropGuide(c);
                          onClose();
                        }}
                        className="p-3 bg-[#16241A] hover:bg-[#111A13] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-10 h-10 rounded border border-[#1E2E21] object-cover"
                          />
                          <div>
                            <h5 className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2]">{c.name}</h5>
                            <span className="text-[11px] text-[#9CAFA0]">{c.recommendedHeader}</span>
                          </div>
                        </div>
                        <span className="text-xs font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16]">View Guide →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <h4 className="text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-widest text-[#84CC16] mb-2">
                    Fertilizer Products ({matchedProducts.length})
                  </h4>
                  <div className="divide-y-2 divide-[#1E2E21] border-2 border-[#1E2E21] rounded-xl overflow-hidden">
                    {matchedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        className="p-3 bg-[#16241A] hover:bg-[#111A13] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded border border-[#1E2E21] object-cover"
                          />
                          <div>
                            <h5 className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2]">{p.name}</h5>
                            <span className="text-[11px] text-[#9CAFA0] font-medium">
                              ₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} • {p.weightOrVolume}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16]">View Product →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {matchedFaqs.length > 0 && (
                <div>
                  <h4 className="text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-widest text-[#84CC16] mb-2">
                    FAQ Answers ({matchedFaqs.length})
                  </h4>
                  <div className="space-y-2">
                    {matchedFaqs.map((f, i) => (
                      <div key={i} className="p-3 bg-[#16241A] rounded-lg border-2 border-[#1E2E21]">
                        <h5 className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#F1F5F2]">{f.question}</h5>
                        <p className="text-xs text-[#9CAFA0] mt-1 line-clamp-2 font-medium">{f.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
