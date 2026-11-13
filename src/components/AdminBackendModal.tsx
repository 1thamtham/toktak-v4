import React, { useState } from 'react';
import {
  ShieldAlert,
  Crown,
  ShoppingBag,
  Video,
  Package,
  Settings,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { ProductItem, VideoItem, ServiceItem, AdminOrder, ProductType } from '../types';

interface AdminBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onUpdateProducts: (products: ProductItem[]) => void;
  videos: VideoItem[];
  onUpdateVideos: (videos: VideoItem[]) => void;
  orders: AdminOrder[];
  onUpdateOrders: (orders: AdminOrder[]) => void;
  superadminEmail: string;
}

export const AdminBackendModal: React.FC<AdminBackendModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  videos,
  onUpdateVideos,
  orders,
  onUpdateOrders,
  superadminEmail
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'videos' | 'orders' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing Product State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(490);
  const [newProductType, setNewProductType] = useState<ProductType>('tshirt');
  const [newProductImage, setNewProductImage] = useState('/src/assets/images/tshirt_mockup_1794023817755.jpg');

  // Editing Video State
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);

  // Store Settings State
  const [storeName, setStoreName] = useState('TokDesign Official Studio');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [isLiveEnabled, setIsLiveEnabled] = useState(true);

  if (!isOpen) return null;

  // Overview Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0) + 12480;
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

  // Handlers for Products
  const handleDeleteProduct = (id: string) => {
    if (confirm('คุณต้องการลบสินค้านี้ออกจากร้านค้าใช่หรือไม่?')) {
      const updated = products.filter((p) => p.id !== id);
      onUpdateProducts(updated);
    }
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    onUpdateProducts(updated);
    setEditingProduct(null);
  };

  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    const item: ProductItem = {
      id: `prod-admin-${Date.now()}`,
      name: newProductName.trim(),
      price: Number(newProductPrice) || 390,
      image: newProductImage,
      productType: newProductType,
      creatorName: 'Golden River City (Superadmin)',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95',
      salesCount: 0,
      rating: 5.0,
      isCustomizable: true,
      description: 'สินค้าคอลเลกชันใหม่จากผู้ดูแลระบบ'
    };
    onUpdateProducts([item, ...products]);
    setIsAddingProduct(false);
    setNewProductName('');
  };

  // Handlers for Videos
  const handleDeleteVideo = (id: string) => {
    if (confirm('คุณต้องการลบคลิปวิดีโอนี้ออกจากฟีดใช่หรือไม่?')) {
      const updated = videos.filter((v) => v.id !== id);
      onUpdateVideos(updated);
    }
  };

  const handleSaveVideoEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    const updated = videos.map((v) => (v.id === editingVideo.id ? editingVideo : v));
    onUpdateVideos(updated);
    setEditingVideo(null);
  };

  // Handlers for Orders
  const handleUpdateOrderStatus = (orderId: string, newStatus: AdminOrder['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    onUpdateOrders(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Superadmin Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-md">
              <Crown className="w-4 h-4 fill-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black tracking-tight text-white">ระบบจัดการหลังบ้าน</h2>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                  SUPERADMIN & ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-mono">{superadminEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 grid grid-cols-5 text-center text-[10px] font-semibold text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 flex flex-col items-center gap-0.5 transition ${
              activeTab === 'overview' ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ภาพรวม</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 flex flex-col items-center gap-0.5 transition ${
              activeTab === 'products' ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>สินค้า ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-2 flex flex-col items-center gap-0.5 transition ${
              activeTab === 'videos' ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:bg-slate-50'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>คลิป ({videos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 flex flex-col items-center gap-0.5 transition relative ${
              activeTab === 'orders' ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:bg-slate-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>ออเดอร์ ({orders.length})</span>
            {pendingOrders > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 flex flex-col items-center gap-0.5 transition ${
              activeTab === 'settings' ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ตั้งค่า</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-slate-900">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] font-semibold">ยอดขายสะสม</span>
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-base font-extrabold text-slate-900 tabular-nums">
                    ฿{totalRevenue.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-emerald-600 font-medium">↑ +18.4% จากสัปดาห์ก่อน</span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] font-semibold">คำสั่งซื้อรอดำเนินการ</span>
                    <Package className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="text-base font-extrabold text-rose-600 tabular-nums">
                    {pendingOrders} ออเดอร์
                  </div>
                  <span className="text-[9px] text-slate-500">จากทั้งหมด {orders.length} ออเดอร์</span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] font-semibold">สินค้าในระบบ</span>
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-base font-extrabold text-slate-900 tabular-nums">
                    {products.length} รายการ
                  </div>
                  <span className="text-[9px] text-blue-600">พร้อมขาย & คัสตอม</span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] font-semibold">คอนเทนต์ / คลิป</span>
                    <Video className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="text-base font-extrabold text-slate-900 tabular-nums">
                    {videos.length} คลิป
                  </div>
                  <span className="text-[9px] text-indigo-600">แสดงบน TikTok ฟีด</span>
                </div>
              </div>

              {/* Superadmin Info Box */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-50 via-white to-amber-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <h4 className="font-bold text-slate-900">สิทธิ์ผู้ดูแลระบบสูงสุด (Superadmin RBAC)</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    คุณเข้าใช้งานในฐานะ <strong>{superadminEmail}</strong> มีสิทธิ์เต็มในการเพิ่ม ลบ
                    แก้ไขสินค้า อนุมัติสถานะคำสั่งซื้อ และจัดการฟีดวิดีโอแบบสด
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">เมนูลัดสำหรับ Superadmin</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsAddingProduct(true);
                      setActiveTab('products');
                    }}
                    className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left flex items-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">ลงสินค้าใหม่</span>
                      <span className="text-[9px] text-slate-500">เพิ่มสินค้าเข้าหน้าร้าน</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left flex items-center gap-2 transition"
                  >
                    <Package className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">ตรวจออเดอร์</span>
                      <span className="text-[9px] text-slate-500">อัปเดตสถานะการส่ง</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS MANAGEMENT TAB */}
          {activeTab === 'products' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อสินค้า..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shrink-0 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มสินค้า</span>
                </button>
              </div>

              {/* Add New Product Form */}
              {isAddingProduct && (
                <form
                  onSubmit={handleAddNewProductSubmit}
                  className="p-3.5 bg-white rounded-2xl border-2 border-blue-500 shadow-sm space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">เพิ่มสินค้าใหม่เข้าสู่ร้านค้า</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">ชื่อสินค้า</label>
                      <input
                        type="text"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="เช่น เสื้อยืดสตรีทลายลิมิเต็ด"
                        required
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">ราคาขาย (บาท)</label>
                        <input
                          type="number"
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(Number(e.target.value))}
                          required
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">ประเภทสินค้า</label>
                        <select
                          value={newProductType}
                          onChange={(e) => setNewProductType(e.target.value as ProductType)}
                          className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                        >
                          <option value="tshirt">เสื้อยืด (T-Shirt)</option>
                          <option value="phonecase">เคสมือถือ (Phone Case)</option>
                          <option value="totebag">กระเป๋าผ้า (Tote Bag)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">URL รูปภาพสินค้า</label>
                      <input
                        type="text"
                        value={newProductImage}
                        onChange={(e) => setNewProductImage(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      บันทึกสินค้าใหม่
                    </button>
                  </div>
                </form>
              )}

              {/* Products List */}
              <div className="space-y-2">
                {products
                  .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((product) => (
                    <div
                      key={product.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded uppercase font-medium">
                            {product.productType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px]">
                          <span className="font-extrabold text-rose-600">฿{product.price}</span>
                          <span className="text-slate-500">ยอดขาย: {product.salesCount} ชิ้น</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                          title="แก้ไขราคา/ชื่อ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition"
                          title="ลบสินค้า"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Edit Product Modal Sheet */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                  <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900">แก้ไขข้อมูลสินค้า</span>
                      <button onClick={() => setEditingProduct(null)}>
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <form onSubmit={handleSaveProductEdit} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-1">ชื่อสินค้า</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-1">ราคาขาย (฿)</label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-1">URL รูปภาพ</label>
                        <input
                          type="text"
                          value={editingProduct.image}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900 font-mono text-[11px]"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="flex-1 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                        >
                          บันทึกการแก้ไข
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. VIDEOS & CONTENT MANAGEMENT TAB */}
          {activeTab === 'videos' && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-700 block">
                จัดการคลิปวิดีโอในฟีด TikTok ({videos.length} รายการ)
              </span>

              <div className="space-y-2">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3"
                  >
                    <div className="w-12 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 relative">
                      <img src={vid.posterUrl} alt={vid.caption} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-500 font-medium">{vid.creatorHandle}</span>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{vid.caption}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                        <span>❤️ {vid.likesCount} ไลก์</span>
                        <span>💬 {vid.commentsCount} คอมเมนต์</span>
                        <span>🎵 {vid.musicTitle}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingVideo(vid)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                        title="แก้ไขคำบรรยาย"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(vid.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition"
                        title="ลบคลิป"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Video Modal */}
              {editingVideo && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                  <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900">แก้ไขข้อมูลคลิปวิดีโอ</span>
                      <button onClick={() => setEditingVideo(null)}>
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <form onSubmit={handleSaveVideoEdit} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-1">คำบรรยายคลิป (Caption)</label>
                        <textarea
                          rows={2}
                          value={editingVideo.caption}
                          onChange={(e) => setEditingVideo({ ...editingVideo, caption: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-1">ชื่อเพลง (Music)</label>
                        <input
                          type="text"
                          value={editingVideo.musicTitle}
                          onChange={(e) => setEditingVideo({ ...editingVideo, musicTitle: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingVideo(null)}
                          className="flex-1 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                        >
                          บันทึก
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. ORDERS MANAGEMENT TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-700 block">
                จัดการคำสั่งซื้อลูกค้า ({orders.length} รายการ)
              </span>

              <div className="space-y-2.5">
                {orders.map((order) => {
                  const getStatusBadge = (status: AdminOrder['status']) => {
                    switch (status) {
                      case 'pending':
                        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">รอดำเนินการ</span>;
                      case 'processing':
                        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">กำลังผลิต</span>;
                      case 'shipped':
                        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">จัดส่งแล้ว</span>;
                      case 'completed':
                        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">สำเร็จ</span>;
                    }
                  };

                  return (
                    <div key={order.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{order.orderNumber}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <span className="text-xs font-extrabold text-rose-600 tabular-nums">
                          ฿{order.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        <div className="font-semibold text-slate-800">{order.productTitle}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          ผู้สั่ง: {order.customerName} ({order.customerEmail})
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          ที่อยู่: {order.shippingAddress}
                        </div>
                      </div>

                      {/* Status Action Buttons for Superadmin */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-500">ปรับสถานะ:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                              order.status === 'processing'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            พิมพ์ลาย/ผลิต
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                              order.status === 'shipped'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            ส่งแล้ว
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                              order.status === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            สำเร็จ
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900">การตั้งค่าระบบร้านค้า</h4>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">ชื่อร้านค้าอย่างเป็นทางการ</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">เปิดระบบ Live สตรีมสด</span>
                    <span className="text-[10px] text-slate-500">อนุญาตให้ครีเอเตอร์ไลฟ์ขายของ</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLiveEnabled}
                    onChange={(e) => setIsLiveEnabled(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">สิทธิ์ Superadmin สูงสุด</span>
                    <span className="text-[10px] text-slate-500">{superadminEmail}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>คำเตือนด้านความปลอดภัย</span>
                </div>
                <p className="text-[10px] leading-relaxed text-amber-700">
                  ระบบนี้สงวนสิทธิ์สำหรับบัญชี <strong>Superadmin</strong> และ <strong>Admin</strong> เท่านั้น บัญชีผู้ใช้อื่นหรือโปรไฟล์ทั่วไปจะไม่สามารถมองเห็นหรือเปิดเมนูหลังบ้านนี้ได้
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[10px] text-slate-500">สถานะ: ซิงค์ข้อมูลกับหน้าร้านแบบ Real-time</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
          >
            ปิดหน้าต่างหลังบ้าน
          </button>
        </div>
      </div>
    </div>
  );
};
