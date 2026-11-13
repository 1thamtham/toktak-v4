import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Type,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Move,
  ZoomIn,
  ZoomOut,
  Check
} from 'lucide-react';
import { ProductType, CartItem } from '../types';

interface DesignStudioViewProps {
  initialProductType?: ProductType;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

interface ProductConfig {
  type: ProductType;
  name: string;
  basePrice: number;
  image: string;
  colors: { label: string; hex: string }[];
}

const PRODUCTS_CONFIG: Record<ProductType, ProductConfig> = {
  tshirt: {
    type: 'tshirt',
    name: 'เสื้อยืดโอเวอร์ไซส์ (T-Shirt)',
    basePrice: 490,
    image: '/src/assets/images/tshirt_mockup_1794023817755.jpg',
    colors: [
      { label: 'ดำสนิท', hex: '#0f172a' },
      { label: 'ขาวสตรีท', hex: '#f8fafc' },
      { label: 'เทาสโมค', hex: '#475569' },
      { label: 'เขียวโอลีฟ', hex: '#3f4f34' }
    ]
  },
  phonecase: {
    type: 'phonecase',
    name: 'เคสมือถือกันกระแทก (Phone Case)',
    basePrice: 350,
    image: '/src/assets/images/phonecase_mockup_1794023818273.jpg',
    colors: [
      { label: 'ดำด้าน', hex: '#18181b' },
      { label: 'น้ำเงินกรม', hex: '#1e3a8a' },
      { label: 'ม่วงลาเวนเดอร์', hex: '#7c3aed' },
      { label: 'โปร่งใส/เคลียร์', hex: '#e2e8f0' }
    ]
  },
  totebag: {
    type: 'totebag',
    name: 'กระเป๋าผ้าแคนวาส (Tote Bag)',
    basePrice: 290,
    image: '/src/assets/images/totebag_mockup_1794023818674.jpg',
    colors: [
      { label: 'ขาวครีมดิบ', hex: '#f5f5f0' },
      { label: 'ดำชาร์โคล', hex: '#1c1917' },
      { label: 'กากีเอิร์ธโทน', hex: '#d6c7b2' }
    ]
  }
};

const STICKERS = [
  { id: 'stk-1', label: '🔥 ไฟลุก', symbol: '🔥' },
  { id: 'stk-2', label: '⚡ สายฟ้า', symbol: '⚡' },
  { id: 'stk-3', label: '✦ ดวงดาว', symbol: '✦' },
  { id: 'stk-4', label: '💖 หัวใจ', symbol: '💖' },
  { id: 'stk-5', label: '🌊 คลื่น', symbol: '🌊' },
  { id: 'stk-6', label: '☻ ยิ้ม', symbol: '☻' }
];

const FONTS = [
  { id: 'Prompt', name: 'Prompt (คมชัด)' },
  { id: 'sans-serif', name: 'Minimal Sans' },
  { id: 'serif', name: 'Editorial Serif' },
  { id: 'monospace', name: 'Cyber Mono' }
];

export const DesignStudioView: React.FC<DesignStudioViewProps> = ({
  initialProductType = 'tshirt',
  onClose,
  onAddToCart
}) => {
  const [selectedType, setSelectedType] = useState<ProductType>(initialProductType);
  const currentConfig = PRODUCTS_CONFIG[selectedType];

  const [selectedColor, setSelectedColor] = useState<string>(currentConfig.colors[0].hex);
  const [activeTool, setActiveTool] = useState<'text' | 'sticker' | 'color'>('text');

  // Text Customization
  const [customText, setCustomText] = useState('BANGKOK');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);
  const [selectedFont, setSelectedFont] = useState('Prompt');
  const [textOffsetY, setTextOffsetY] = useState(0);

  // Sticker Customization
  const [selectedSticker, setSelectedSticker] = useState<string | null>('🔥');
  const [stickerSize, setStickerSize] = useState(40);
  const [stickerOffsetY, setStickerOffsetY] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [orderAddedToast, setOrderAddedToast] = useState(false);

  const handleProductChange = (type: ProductType) => {
    setSelectedType(type);
    setSelectedColor(PRODUCTS_CONFIG[type].colors[0].hex);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setSelectedSticker(null);
    }
  };

  const handleAddToCart = () => {
    const newItem: CartItem = {
      id: `custom-${Date.now()}`,
      productName: `${currentConfig.name} [คัสตอมเอง]`,
      productType: selectedType,
      price: currentConfig.basePrice,
      quantity: 1,
      color: selectedColor,
      customText: customText.trim() || undefined,
      customGraphicUrl: uploadedImage || (selectedSticker ? `sticker:${selectedSticker}` : undefined),
      previewImage: currentConfig.image,
      timestamp: Date.now()
    };

    onAddToCart(newItem);
    setOrderAddedToast(true);
    setTimeout(() => {
      setOrderAddedToast(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    setCustomText('BANGKOK');
    setTextColor('#ffffff');
    setTextSize(24);
    setSelectedSticker('🔥');
    setUploadedImage(null);
    setTextOffsetY(0);
    setStickerOffsetY(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 text-slate-900 flex flex-col max-w-md mx-auto overflow-hidden animate-in fade-in duration-200 select-none">
      {/* Top Header */}
      <header className="px-3 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-xs">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h2 className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span>สตูดิโอออกแบบลวดลาย</span>
          </h2>
          <span className="text-[10px] text-slate-500">พรีวิวเสมือนจริง 360°</span>
        </div>

        <button
          onClick={handleReset}
          title="รีเซ็ตการออกแบบ"
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Product Template Selector Strip */}
      <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {[
          { type: 'tshirt', label: '👕 เสื้อยืด', price: 490 },
          { type: 'phonecase', label: '📱 เคสมือถือ', price: 350 },
          { type: 'totebag', label: '👜 กระเป๋าผ้า', price: 290 }
        ].map((item) => (
          <button
            key={item.type}
            onClick={() => handleProductChange(item.type as ProductType)}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center justify-between gap-1.5 ${
              selectedType === item.type
                ? 'bg-rose-500 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>{item.label}</span>
            <span className="text-[10px] opacity-90 tabular-nums">฿{item.price}</span>
          </button>
        ))}
      </div>

      {/* Main Canvas / Preview Area (Studio Soft Off-White Setting) */}
      <div className="flex-1 relative bg-slate-100/90 flex items-center justify-center p-4 overflow-hidden">
        {/* Mockup Canvas Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border border-slate-300 shadow-md flex items-center justify-center bg-white group">
          {/* Base Product Mockup Image */}
          <img
            src={currentConfig.image}
            alt={currentConfig.name}
            className="w-full h-full object-cover transition-transform duration-300"
          />

          {/* Color Tint Filter Overlay */}
          <div
            className="absolute inset-0 mix-blend-multiply opacity-25 pointer-events-none transition-colors duration-300"
            style={{ backgroundColor: selectedColor }}
          />

          {/* Precision Dashed Print Area Guideline on Light Background */}
          <div className="absolute inset-10 border-2 border-dashed border-rose-400/80 rounded-xl pointer-events-none flex flex-col items-center justify-center p-2 bg-white/10 backdrop-blur-[1px]">
            <span className="absolute top-1 right-1.5 text-[8px] text-rose-600 font-bold uppercase font-mono tracking-wider bg-white/80 px-1 rounded shadow-2xs">
              PRINT AREA
            </span>

            {/* Sticker / Custom Graphic Layer */}
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Custom Graphic"
                style={{
                  width: `${stickerSize * 2}px`,
                  transform: `translateY(${stickerOffsetY}px)`
                }}
                className="max-h-24 object-contain drop-shadow-md select-none transition-transform"
              />
            ) : selectedSticker ? (
              <div
                style={{
                  fontSize: `${stickerSize}px`,
                  transform: `translateY(${stickerOffsetY}px)`
                }}
                className="leading-none drop-shadow-md select-none transition-transform"
              >
                {selectedSticker}
              </div>
            ) : null}

            {/* Custom Text Layer */}
            {customText.trim() && (
              <div
                style={{
                  color: textColor,
                  fontSize: `${textSize}px`,
                  fontFamily: selectedFont,
                  transform: `translateY(${textOffsetY}px)`
                }}
                className="font-bold tracking-wider text-center drop-shadow-md transition-all select-none max-w-full truncate px-2 mt-1"
              >
                {customText}
              </div>
            )}
          </div>

          {/* Quick Position Controls overlay */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-200 shadow-sm text-[10px] text-slate-700">
            <Move className="w-3 h-3 text-rose-500" />
            <span className="font-medium">ปรับตำแหน่ง:</span>
            <button
              onClick={() => setTextOffsetY((p) => p - 4)}
              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-800"
            >
              ▲
            </button>
            <button
              onClick={() => setTextOffsetY((p) => p + 4)}
              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-800"
            >
              ▼
            </button>
          </div>
        </div>
      </div>

      {/* Compact Bottom Toolbar with Tabs */}
      <div className="bg-white border-t border-slate-200 shrink-0 shadow-xs">
        {/* Tool Category Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 text-center">
          <button
            onClick={() => setActiveTool('text')}
            className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTool === 'text'
                ? 'text-rose-600 border-b-2 border-rose-500 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>ข้อความ</span>
          </button>

          <button
            onClick={() => setActiveTool('sticker')}
            className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTool === 'sticker'
                ? 'text-rose-600 border-b-2 border-rose-500 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>สติกเกอร์/รูป</span>
          </button>

          <button
            onClick={() => setActiveTool('color')}
            className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTool === 'color'
                ? 'text-rose-600 border-b-2 border-rose-500 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>สีสินค้า</span>
          </button>
        </div>

        {/* Tool Controls Panel */}
        <div className="p-3 bg-white">
          {/* TAB 1: TEXT TOOLS */}
          {activeTool === 'text' && (
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="พิมพ์ข้อความที่ต้องการสกรีน..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="flex-1 bg-slate-100 text-slate-900 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500"
                />
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="bg-slate-100 text-slate-900 text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
                >
                  {FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Size & Colors */}
              <div className="flex items-center justify-between gap-2">
                {/* Font Color circles */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">สีอักษร:</span>
                  {['#ffffff', '#000000', '#f43f5e', '#3b82f6', '#eab308'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setTextColor(c)}
                      className={`w-5 h-5 rounded-full border ${
                        textColor === c ? 'border-rose-500 scale-110 shadow-sm' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Text Size Stepper */}
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setTextSize((s) => Math.max(12, s - 2))}
                    className="text-slate-600 hover:text-slate-900 p-0.5"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-800 w-5 text-center tabular-nums">
                    {textSize}
                  </span>
                  <button
                    onClick={() => setTextSize((s) => Math.min(48, s + 2))}
                    className="text-slate-600 hover:text-slate-900 p-0.5"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STICKER / IMAGE TOOLS */}
          {activeTool === 'sticker' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {/* Upload from device */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-dashed border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 text-[10px] flex items-center gap-1 shrink-0 active:scale-95"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                  <span>อัปโหลดรูป</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Preset Stickers */}
                {STICKERS.map((stk) => (
                  <button
                    key={stk.id}
                    onClick={() => {
                      setSelectedSticker(stk.symbol);
                      setUploadedImage(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 shrink-0 transition ${
                      selectedSticker === stk.symbol && !uploadedImage
                        ? 'bg-rose-50 border border-rose-400 text-rose-700 font-semibold'
                        : 'bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{stk.symbol}</span>
                    <span className="text-[10px]">{stk.label}</span>
                  </button>
                ))}
              </div>

              {/* Sticker size adjuster */}
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>ขนาดสติกเกอร์</span>
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setStickerSize((s) => Math.max(20, s - 4))}
                    className="text-slate-600 hover:text-slate-900 p-0.5"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-slate-800 w-5 text-center tabular-nums">{stickerSize}</span>
                  <button
                    onClick={() => setStickerSize((s) => Math.min(80, s + 4))}
                    className="text-slate-600 hover:text-slate-900 p-0.5"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT COLOR TOOLS */}
          {activeTool === 'color' && (
            <div>
              <span className="text-[10px] text-slate-500 block mb-1.5 font-medium">
                เลือกสีเนื้อผ้า/ตัวเคส:
              </span>
              <div className="flex items-center gap-3">
                {currentConfig.colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(c.hex)}
                    className="flex flex-col items-center gap-1 group active:scale-95"
                  >
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition shadow-xs ${
                        selectedColor === c.hex
                          ? 'border-rose-500 scale-110 shadow-sm'
                          : 'border-slate-300 group-hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {selectedColor === c.hex && (
                        <Check className="w-3.5 h-3.5 text-rose-500 stroke-[3]" />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-600">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Checkout / Order Bar */}
        <div className="px-3 pb-3 pt-2 flex items-center justify-between gap-3 border-t border-slate-200 bg-white">
          <div>
            <span className="text-[10px] text-slate-500 block">ราคาพร้อมสกรีน</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-slate-900 tabular-nums">
                ฿{currentConfig.basePrice}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">ส่งฟรี</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={orderAddedToast}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:brightness-105 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition disabled:opacity-75"
          >
            {orderAddedToast ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>เพิ่มลงตะกร้าแล้ว!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>สั่งซื้อเลย (Add to Cart)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
