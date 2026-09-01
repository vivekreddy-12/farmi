import React, { useState } from 'react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-lg shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col max-h-[90vh] text-[#F1F5F2]">
        {/* Product Image Banner */}
        <div className="h-56 bg-[#16241A] relative shrink-0 border-b-2 border-[#1E2E21]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-[#111A13]/80 hover:bg-[#111A13] text-[#F1F5F2] p-1.5 rounded-full backdrop-blur-xs transition-colors border border-[#1E2E21]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          {product.badge && (
            <span className="absolute top-4 left-4 bg-[#84CC16] text-[#0B110D] text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-widest text-[#84CC16] bg-[#16241A] px-2 py-0.5 rounded border border-[#1E2E21]">
                {product.category} • {product.formulation}
              </span>
              <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-extrabold text-[#F1F5F2] mt-1.5">
                {product.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="font-['Space_Grotesk',sans-serif] text-2xl font-black text-[#84CC16]">
                ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="block text-[11px] text-[#9CAFA0] font-bold">{product.weightOrVolume}</span>
            </div>
          </div>

          <p className="text-xs text-[#9CAFA0] leading-relaxed font-medium">
            {product.fullDescription}
          </p>

          <div className="bg-[#16241A] p-3.5 rounded-xl border-2 border-[#1E2E21] grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#9CAFA0] block font-bold text-[11px]">Formulation:</span>
              <strong className="text-[#F1F5F2] font-['Space_Grotesk',sans-serif]">{product.formulation}</strong>
            </div>
            <div>
              <span className="text-[#9CAFA0] block font-bold text-[11px]">NPK Ratio:</span>
              <strong className="text-[#84CC16] font-['Space_Grotesk',sans-serif]">{product.npkRatio || 'Organic / Specialty'}</strong>
            </div>
            <div className="col-span-2 pt-2 border-t border-[#1E2E21]">
              <span className="text-[#9CAFA0] block font-bold text-[11px]">Coverage Standard:</span>
              <strong className="text-[#F1F5F2] font-['Space_Grotesk',sans-serif]">{product.coveragePerBag}</strong>
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-['Space_Grotesk',sans-serif] font-black uppercase text-[#84CC16]">Quantity:</span>
            <div className="flex items-center border-2 border-[#1E2E21] rounded-lg bg-[#16241A]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-sm text-[#F1F5F2] font-bold hover:bg-[#111A13]"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-sm font-['Space_Grotesk',sans-serif] font-extrabold text-[#84CC16]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1.5 text-sm text-[#F1F5F2] font-bold hover:bg-[#111A13]"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16241A] border-t-2 border-[#1E2E21] flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-lg border-2 border-[#1E2E21] text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-wider text-[#9CAFA0] hover:text-[#F1F5F2] hover:border-[#84CC16] flex-1 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className={`flex-2 py-3 rounded-lg font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 border-2 border-[#84CC16] ${
              added
                ? 'bg-[#84CC16] text-[#0B110D]'
                : 'bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] font-bold">
              {added ? 'check' : 'add_shopping_cart'}
            </span>
            {added ? 'Added to Cart!' : `Add to Cart • ₹${(product.price * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </button>
        </div>
      </div>
    </div>
  );
};
