import React from 'react';
import { X, Sparkles, ShoppingCart, Star } from 'lucide-react';
import { ProductItem, ProductType } from '../types';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem) => void;
  onOpenDesignStudio: (type: ProductType) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenDesignStudio
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900">รายละเอียดสินค้า</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 space-y-3">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isCustomizable && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md border border-slate-200 text-[10px] font-semibold text-rose-600 shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>ปรับแต่งลายเองได้</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-extrabold text-rose-600 tabular-nums">
                ฿{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  ฿{product.originalPrice}
                </span>
              )}
              <span className="text-[10px] text-slate-500 ml-auto flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-700">{product.rating}</span>
                <span>({product.salesCount} ยอดขาย)</span>
              </span>
            </div>
            {product.description && (
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenDesignStudio(product.productType);
              }}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>🎨 ปรับแต่งลายเอง</span>
            </button>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="py-2.5 px-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1 active:scale-95 transition hover:brightness-105"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>ใส่ตะกร้าสั่งซื้อ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
