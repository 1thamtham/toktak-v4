import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Package,
  ShieldCheck,
  Award,
  Video,
  ExternalLink,
  Plus,
  HelpCircle,
  Building,
  CreditCard,
  Phone,
  User,
  ArrowRight
} from 'lucide-react';
import { ProductItem } from '../types';

interface TokTakCreatorShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  currentUserEmail?: string;
  currentUserName?: string;
  onPinProductToClip?: (product: ProductItem) => void;
}

const CATEGORIES = [
  { id: 'apparel', label: '👕 เสื้อยืด & แฟชั่นสตรีท', commission: '25%' },
  { id: 'phonecase', label: '📱 เคสมือถือ & แก็ดเจ็ต', commission: '30%' },
  { id: 'totebag', label: '👜 กระเป๋าผ้า & ไลฟ์สไตล์', commission: '20%' },
  { id: 'art', label: '🎨 งานอาร์ต & ของสะสม', commission: '35%' }
];

const BANKS = [
  'ธนาคารกสิกรไทย (KBank)',
  'ธนาคารไทยพาณิชย์ (SCB)',
  'ธนาคารกรุงเทพ (BBL)',
  'ธนาคารกรุงไทย (KTB)',
  'ธนาคารทหารไทยธนชาต (ttb)',
  'พร้อมเพย์ (PromptPay)'
];

export const TokTakCreatorShopModal: React.FC<TokTakCreatorShopModalProps> = ({
  isOpen,
  onClose,
  products,
  currentUserEmail = 'goldenrivercity@gmail.com',
  currentUserName = 'Golden River City',
  onPinProductToClip
}) => {
  // Form State
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info');
  const [creatorName, setCreatorName] = useState(currentUserName);
  const [phone, setPhone] = useState('089-123-4567');
  const [lineId, setLineId] = useState('@golden_creator');
  const [idCardNumber, setIdCardNumber] = useState('1103702938475');
  const [bankName, setBankName] = useState(BANKS[0]);
  const [bankAccountNumber, setBankAccountNumber] = useState('045-2-98471-0');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'apparel',
    'phonecase'
  ]);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Commission Simulator State
  const [estimatedMonthlyOrders, setEstimatedMonthlyOrders] = useState(150);
  const avgOrderPrice = 450;
  const avgCommissionRate = 0.25; // 25%
  const estimatedEarnings = Math.round(
    estimatedMonthlyOrders * avgOrderPrice * avgCommissionRate
  );

  // Success Notification
  const [pinnedProductId, setPinnedProductId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== id));
      }
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim() || !phone.trim() || !bankAccountNumber.trim()) {
      return;
    }
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* 1. Header Banner: TokTak Shop สำหรับครีเอเตอร์ */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 p-4 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md border border-white/30">
                <ShoppingBag className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold tracking-tight">
                    TokTak Shop สำหรับครีเอเตอร์
                  </h3>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                    Partner
                  </span>
                </div>
                <p className="text-[11px] text-white/90">
                  ศูนย์รวมครีเอเตอร์ & สมัครปักตะกร้าสร้างรายได้
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-white/20 text-center text-[10px] font-bold">
            <button
              onClick={() => setStep('info')}
              className={`py-1 rounded-full transition ${
                step === 'info'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              1. สิทธิประโยชน์
            </button>
            <button
              onClick={() => setStep('form')}
              className={`py-1 rounded-full transition ${
                step === 'form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              2. กรอกใบสมัคร
            </button>
            <button
              onClick={() => setStep('success')}
              className={`py-1 rounded-full transition ${
                step === 'success'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              3. เริ่มปักตะกร้า
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 bg-slate-50">
          {/* ======================================================== */}
          {/* STEP 1: OVERVIEW & BENEFITS & COMMISSION CALCULATOR */}
          {/* ======================================================== */}
          {step === 'info' && (
            <div className="space-y-4">
              {/* Highlight Perks Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">ค่าคอมมิชชันสูง</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    รับส่วนแบ่ง 10% - 35% ทุกออเดอร์ที่สั่งซื้อผ่านคลิปหรือไลฟ์สดของคุณ
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">ไม่ต้องสต็อกสินค้า</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    TokDesign ผลิต สกรีน แพ็ก และจัดส่งให้ลูกค้าทั้งหมด ครีเอเตอร์แค่รีวิว
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">ขอรับสินค้าตัวอย่างฟรี</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    เลือกเสื้อ เคส และกระเป๋าไปใส่รีวิวสร้างคอนเทนต์ได้ฟรีก่อนใคร
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">ปักตะกร้าง่าย 1 วินาที</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    กดเลือกลิงก์สินค้าแล้วปักลงวิดีโอหรือไลฟ์สดได้ทันที ไม่ต้องรอข้ามวัน
                  </p>
                </div>
              </div>

              {/* Creator Eligibility Status Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>การตรวจสอบคุณสมบัติบัญชีของคุณ</span>
                </span>
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-[11px]">ยืนยันตัวตน Google Verified</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      ผ่านเกณฑ์
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-[11px]">ไม่ติดประวัติผิดนโยบายชุมชน</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      ผ่านเกณฑ์
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-[11px]">พร้อมเปิดระบบปักตะกร้าทันที</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      พร้อมสมัคร
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Simulator */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>คำนวณรายได้จำลองจากการปักตะกร้า</span>
                  </span>
                  <span className="text-[10px] text-slate-300">
                    (ส่วนแบ่งเฉลี่ย ~25%)
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">ยอดสั่งซื้อผ่านคลิปต่อเดือน:</span>
                    <span className="font-bold text-amber-400">
                      {estimatedMonthlyOrders.toLocaleString()} ออเดอร์
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={estimatedMonthlyOrders}
                    onChange={(e) => setEstimatedMonthlyOrders(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>20 ออเดอร์</span>
                    <span>500 ออเดอร์</span>
                    <span>1,000+ ออเดอร์</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      รายได้ค่าคอมมิชชันโดยประมาณ
                    </span>
                    <span className="text-xl font-black text-amber-400 tabular-nums">
                      ฿{estimatedEarnings.toLocaleString()} /เดือน
                    </span>
                  </div>
                  <button
                    onClick={() => setStep('form')}
                    className="px-3 py-2 bg-gradient-to-r from-amber-400 to-rose-500 hover:brightness-110 text-slate-950 font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition flex items-center gap-1"
                  >
                    <span>สมัครเลย</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Primary Next Action Button */}
              <button
                onClick={() => setStep('form')}
                className="w-full py-3 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:brightness-105 text-white font-bold text-xs rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
              >
                <span>กรอกข้อมูลสมัครปักตะกร้า (ใช้เวลา 1 นาที)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: REGISTRATION FORM */}
          {/* ======================================================== */}
          {step === 'form' && (
            <form onSubmit={handleSubmitApplication} className="space-y-3.5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs">
                <span className="font-bold block">📝 ข้อมูลสำหรับรับเงินค่าคอมมิชชัน</span>
                <span className="text-[10px] text-blue-700 leading-relaxed block mt-0.5">
                  ระบบจะโอนเงินเข้าบัญชีธนาคารที่คุณระบุโดยอัตโนมัติทุกสัปดาห์
                </span>
              </div>

              {/* Creator Name & Channel Handle */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  ชื่อ-นามสกุล / ชื่อช่องครีเอเตอร์ *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี หรือ @channel"
                    className="w-full pl-8 pr-3 py-2 bg-white text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Phone & Line ID */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    เบอร์โทรศัพท์มือถือ *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full pl-8 pr-3 py-2 bg-white text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Line ID (สำหรับติดต่อ)
                  </label>
                  <input
                    type="text"
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    placeholder="@myline"
                    className="w-full px-3 py-2 bg-white text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-900"
                  />
                </div>
              </div>

              {/* ID Card Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  เลขบัตรประจำตัวประชาชน 13 หลัก (สำหรับเอกสารภาษี) *
                </label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={17}
                    value={idCardNumber}
                    onChange={(e) => setIdCardNumber(e.target.value)}
                    placeholder="X-XXXX-XXXXX-XX-X"
                    className="w-full pl-8 pr-3 py-2 bg-white text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-2 pt-1 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-900 block">
                  🏦 ข้อมูลบัญชีรับเงินค่าคอมมิชชัน
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-600 block">เลือกธนาคาร</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-900"
                    >
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-600 block">เลขที่บัญชี *</label>
                    <input
                      type="text"
                      required
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="XXX-X-XXXXX-X"
                      className="w-full px-2.5 py-2 bg-white text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Categories Selection */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                <label className="text-[11px] font-bold text-slate-900 block">
                  หมวดหมู่สินค้าที่ต้องการปักตะกร้า (เลือกได้หลายหมวด)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">{cat.label}</span>
                        <span className="text-[10px] text-emerald-600 font-extrabold mt-1">
                          ค่าคอม {cat.commission}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-rose-600 rounded"
                />
                <span className="text-[10px] text-slate-600 leading-tight">
                  ฉันยอมรับข้อตกลงและเงื่อนไขการเป็น TokTak Creator Partner และตกลงรับเงินค่าคอมมิชชันตามยอดจำหน่ายจริง
                </span>
              </label>

              {/* Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:brightness-105 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ยืนยันการสมัครปักตะกร้า</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 3: SUCCESS & PRODUCT PINNING LIST */}
          {/* ======================================================== */}
          {step === 'success' && (
            <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-white rounded-3xl border border-emerald-200 shadow-sm space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  🎉 ยินดีด้วย! คุณได้รับสิทธิ์ปักตะกร้าแล้ว
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  บัญชี <strong>{creatorName}</strong> ได้รับการอนุมัติเป็น TokTak Creator เรียบร้อย สามารถเลือกลิงก์สินค้าด้านล่างเพื่อเริ่มปักตะกร้าในคลิปหรือไลฟ์สดได้ทันที!
                </p>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>TokTak Shop Creator Verified ID: #{Date.now().toString().slice(-6)}</span>
                </div>
              </div>

              {/* Sample Products to Pin Immediately */}
              <div className="text-left space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                    <span>สินค้าแนะนำยอดนิยมสำหรับปักตะกร้า</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    ค่าคอม 20-30%
                  </span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
                  {products.map((prod) => {
                    const isPinned = pinnedProductId === prod.id;
                    const commissionAmount = Math.round(prod.price * 0.25);
                    return (
                      <div
                        key={prod.id}
                        className="p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2.5 hover:border-rose-200 transition"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate">
                            {prod.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-extrabold text-slate-900">
                              ฿{prod.price}
                            </span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                              + ได้รับ ฿{commissionAmount}/ชิ้น
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setPinnedProductId(prod.id);
                            if (onPinProductToClip) {
                              onPinProductToClip(prod);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 flex items-center gap-1 ${
                            isPinned
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs hover:brightness-105'
                          }`}
                        >
                          {isPinned ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ปักแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>ปักตะกร้า</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition"
              >
                ปิดหน้าต่างและเริ่มสร้างคลิป
              </button>
            </div>
          )}
        </div>

        {/* 3. Footer info */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
          <span>นโยบายครีเอเตอร์ TokTak Shop พาร์ทเนอร์</span>
          <span className="font-semibold text-rose-600">รับเงินโอนทุกวันศุกร์</span>
        </div>
      </div>
    </div>
  );
};
