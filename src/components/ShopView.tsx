import React, { useState } from 'react';
import { Sparkles, Star, Search, Filter, ShoppingBag, Plus, ArrowRight } from 'lucide-react';
import { ProductItem, ProductType } from '../types';

interface ShopViewProps {
  products: ProductItem[];
  onOpenDesignStudio: (template?: ProductType) => void;
  onAddToCart: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  onOpenDesignStudio,
  onAddToCart,
  onSelectProduct
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((item) => {
    const matchesFilter = filterType === 'all' || item.productType === filterType;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] pb-20 bg-slate-50 text-slate-900 select-none">
      {/* Top Header & Search */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-3 pt-3 pb-2.5 border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า เสื้อ เคส กระเป๋า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-slate-900 text-xs pl-8 pr-3 py-1.5 rounded-full border border-slate-200 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
            />
          </div>
          <button
            aria-label="ตัวกรอง"
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bite-sized Studio Banner Button */}
        <div
          onClick={() => onOpenDesignStudio()}
          className="w-full cursor-pointer rounded-xl p-2.5 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200/90 flex items-center justify-between shadow-xs group hover:border-rose-400 transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin [animation-duration:8s]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                <span>✨ สตูดิโอออกแบบเสื้อ เคส กระเป๋า</span>
              </p>
              <p className="text-[10px] text-slate-600 truncate">
                เลือกสินค้า พิมพ์ข้อความ หรือใส่ลายกราฟิกของคุณเอง สั่งพิมพ์ได้ทันที
              </p>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 flex items-center justify-center text-rose-600 shrink-0 ml-1">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'tshirt', label: '👕 เสื้อยืด' },
            { id: 'phonecase', label: '📱 เคสมือถือ' },
            { id: 'totebag', label: '👜 กระเป๋าผ้า' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filterType === cat.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Product Grid */}
      <div className="px-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800">
            สินค้าแนะนำ ({filteredProducts.length})
          </span>
          <span className="text-[10px] text-slate-500">จัดส่งทั่วไทย มีเก็บเงินปลายทาง</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col group cursor-pointer hover:border-slate-300 shadow-xs hover:shadow-sm transition"
            >
              {/* Product Image on Clean Light Canvas */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Customizable Badge */}
                {product.isCustomizable && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-slate-200 text-[9px] font-semibold text-rose-600 shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    <span>คัสตอมได้</span>
                  </div>
                )}

                {/* Quick Add Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  aria-label="เพิ่มลงตะกร้า"
                  className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 active:scale-90 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-700 tabular-nums">{product.rating}</span>
                    <span>·</span>
                    <span>ขายแล้ว {product.salesCount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-600 tabular-nums">
                      ฿{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="ml-1 text-[9px] text-slate-400 line-through tabular-nums">
                        ฿{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDesignStudio(product.productType);
                    }}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold underline flex items-center gap-0.5"
                  >
                    ออกแบบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
