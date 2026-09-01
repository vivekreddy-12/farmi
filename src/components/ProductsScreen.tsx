import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { TiltCard } from './TiltCard';
import { sounds } from '../utils/soundEffects';

interface ProductsScreenProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  products,
  onAddToCart,
  onViewProduct,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [formulationFilter, setFormulationFilter] = useState<string>('All');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Quick Acreage Calculator state
  const [calcAcreage, setCalcAcreage] = useState<number>(10);
  const [calcCrop, setCalcCrop] = useState<string>('Corn / Wheat (Cereals)');

  const categories = ['All', 'Nitrogen', 'NPK Blends', 'Organic', 'Soil Conditioners', 'Micronutrients'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const matchesFormulation =
        formulationFilter === 'All' || p.formulation === formulationFilter;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.npkRatio && p.npkRatio.includes(searchQuery));

      return matchesCategory && matchesFormulation && matchesSearch;
    });
  }, [products, selectedCategory, formulationFilter, searchQuery]);

  const handleAdd = (product: Product) => {
    sounds.playSuccess();
    onAddToCart(product);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-5 py-8 pb-24 md:pb-12 space-y-8">
      {/* Title */}
      <div className="bg-[#111A13]/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border-2 border-[#1E2E21] shadow-sm relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 bg-cover bg-center mix-blend-screen"
          style={{ backgroundImage: `url('/src/assets/images/dark_farm_field_1788272012797.jpg')` }}
        />

        <div className="relative z-10">
          <div className="inline-block bg-[#84CC16] text-[#0B110D] text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-3">
            Commercial Catalog
          </div>
          <h1 className="font-['Space_Grotesk',sans-serif] text-3xl sm:text-4xl font-extrabold text-[#F1F5F2] mb-2 tracking-tight">
            Agricultural Fertilizer Store
          </h1>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-base text-[#9CAFA0] max-w-3xl leading-relaxed font-medium">
            Premium high-purity granular formulas, biological soil amendments, and micronutrient foliar blends delivered direct to your field.
          </p>

          {/* Acreage Dosage Quick Estimator Banner */}
          <div className="mt-6 pt-6 border-t border-[#1E2E21] bg-[#16241A] rounded-lg p-5 border border-[#1E2E21]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#84CC16] fill-icon text-[20px]">
                    calculate
                  </span>
                  <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2]">
                    Acreage Fertilizer Estimator
                  </h3>
                </div>
                <p className="text-xs text-[#9CAFA0] font-medium">
                  Calculate recommended bags and application rates based on your target crop acreage.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-[#111A13] px-3 py-1.5 rounded-lg border-2 border-[#1E2E21]">
                  <label className="text-xs font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16] uppercase">Acreage:</label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={calcAcreage}
                    onChange={(e) => setCalcAcreage(Math.max(1, Number(e.target.value)))}
                    className="w-16 font-['Space_Grotesk',sans-serif] font-black text-sm text-[#F1F5F2] outline-none bg-transparent"
                  />
                  <span className="text-xs font-bold text-[#9CAFA0]">Acres</span>
                </div>

                <div className="flex items-center gap-2 bg-[#111A13] px-3 py-1.5 rounded-lg border-2 border-[#1E2E21]">
                  <label className="text-xs font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16] uppercase">Crop:</label>
                  <select
                    value={calcCrop}
                    onChange={(e) => setCalcCrop(e.target.value)}
                    className="text-xs font-bold text-[#F1F5F2] outline-none bg-transparent"
                  >
                    <option className="bg-[#111A13] text-[#F1F5F2]">Corn / Wheat (Cereals)</option>
                    <option className="bg-[#111A13] text-[#F1F5F2]">Rice Paddy (Flooded)</option>
                    <option className="bg-[#111A13] text-[#F1F5F2]">Tomatoes & Vegetables</option>
                    <option className="bg-[#111A13] text-[#F1F5F2]">Fruit Orchards / Berries</option>
                  </select>
                </div>

                <div className="bg-[#84CC16] text-[#0B110D] px-4 py-2 rounded-lg font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider shadow-sm">
                  Rec: ~{Math.ceil(calcAcreage * 0.8)} Bags Urea + ~{Math.ceil(calcAcreage * 0.5)} Bags DAP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#84CC16] text-[22px]">
              search
            </span>
            <input
              className="w-full h-12 pl-12 pr-10 rounded-lg bg-[#111A13] border-2 border-[#1E2E21] font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold text-[#F1F5F2] transition-all placeholder:text-[#6B7F6E] outline-none shadow-sm focus:border-[#84CC16]"
              placeholder="Search by fertilizer name, NPK ratio, formulation..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CAFA0] hover:text-[#84CC16] p-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-lg font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider font-extrabold whitespace-nowrap transition-all duration-150 active:scale-95 border-2 ${
                selectedCategory === cat
                  ? 'bg-[#84CC16] text-[#0B110D] border-[#84CC16] shadow-sm'
                  : 'bg-[#16241A] border-[#1E2E21] text-[#9CAFA0] hover:border-[#84CC16] hover:text-[#F1F5F2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#111A13] rounded-xl p-12 text-center border-2 border-[#1E2E21] max-w-lg mx-auto shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#84CC16] mb-3">
            inventory_2
          </span>
          <h3 className="font-['Space_Grotesk',sans-serif] text-xl font-extrabold text-[#F1F5F2] mb-1">
            No matching products found
          </h3>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm text-[#9CAFA0] mb-5">
            Try adjusting your search criteria or resetting the category filter.
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              setSelectedCategory('All');
              setFormulationFilter('All');
            }}
            className="px-5 py-2.5 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider font-extrabold rounded-lg border-2 border-[#84CC16] hover:bg-[#99E321]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <TiltCard
              key={product.id}
              maxTilt={8}
              glareOpacity={0.12}
              className="bg-[#111A13] rounded-xl border-2 border-[#1E2E21] flex flex-col hover:border-[#84CC16]/60 transition-all duration-200 overflow-hidden shadow-sm group"
            >
              {/* Product Image */}
              <div 
                className="h-48 bg-[#16241A] relative overflow-hidden cursor-pointer"
                onClick={() => {
                  sounds.playClick();
                  onViewProduct(product);
                }}
                data-cursor-label="VIEW"
              >
                <img
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={product.image}
                />
                {product.badge && (
                  <div className="absolute top-3 right-3 bg-[#84CC16] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs z-10">
                    {product.badge}
                  </div>
                )}
                {product.npkRatio && (
                  <div className="absolute bottom-3 left-3 bg-[#0B110D]/90 text-[#84CC16] text-xs font-mono font-bold px-2 py-0.5 rounded border border-[#1E2E21]">
                    NPK {product.npkRatio}
                  </div>
                )}
              </div>

              {/* Product Content */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider text-[#84CC16] bg-[#16241A] border border-[#1E2E21] px-2 py-0.5 rounded">
                    {product.formulation}
                  </span>
                  <div className="flex items-center text-xs text-[#9CAFA0]">
                    <span className="material-symbols-outlined text-[#FACC15] fill text-[16px] mr-1">
                      star
                    </span>
                    <span className="font-['Space_Grotesk',sans-serif] font-bold text-[#F1F5F2]">{product.rating}</span>
                    <span className="ml-1">({product.reviewsCount})</span>
                  </div>
                </div>

                <h3
                  onClick={() => {
                    sounds.playClick();
                    onViewProduct(product);
                  }}
                  data-cursor-label="VIEW"
                  className="font-['Space_Grotesk',sans-serif] text-lg font-extrabold text-[#F1F5F2] mb-1.5 cursor-pointer hover:text-[#84CC16] line-clamp-1 transition-colors"
                >
                  {product.name}
                </h3>
                
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#9CAFA0] mb-4 flex-grow line-clamp-2 leading-relaxed font-medium">
                  {product.description}
                </p>

                <div className="bg-[#16241A] p-2.5 rounded-lg mb-4 text-[11px] text-[#9CAFA0] flex items-center gap-1.5 border border-[#1E2E21]">
                  <span className="material-symbols-outlined text-[#84CC16] text-[16px]">
                    grass
                  </span>
                  <span className="line-clamp-1 font-bold text-[#F1F5F2]">{product.coveragePerBag}</span>
                </div>

                {/* Footer Action */}
                <div className="flex justify-between items-center pt-3 border-t border-[#1E2E21]">
                  <div>
                    <span className="font-['Space_Grotesk',sans-serif] text-2xl font-black text-[#F1F5F2]">
                      ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[11px] font-bold uppercase text-[#84CC16]/80">
                      {product.weightOrVolume}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAdd(product)}
                    data-cursor-label="ADD"
                    className={`px-4 py-2.5 rounded-lg font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 transition-all duration-150 active:scale-95 border-2 border-[#84CC16] ${
                      justAddedId === product.id
                        ? 'bg-[#84CC16] text-[#0B110D]'
                        : 'bg-[#84CC16] text-[#0B110D] hover:bg-[#99E321]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">
                      {justAddedId === product.id ? 'check' : 'shopping_cart'}
                    </span>
                    {justAddedId === product.id ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      )}
    </main>
  );
};
