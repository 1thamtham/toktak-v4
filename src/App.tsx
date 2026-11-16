import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Music, Home, Compass, PlusSquare, User, Play, ShoppingBag, Send, Upload, Store, Bookmark, MoreVertical } from 'lucide-react';
 
interface CommentItem {
  id: string;
  username: string;
  text: string;
  time: string;
}

interface VideoItem {
  id: string;
  url: string;
  username: string;
  userAvatar: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  isLiked?: boolean;
  isSaved?: boolean;
  commentList?: CommentItem[];
  hasProduct?: boolean;
  productName?: string;
  productPrice?: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: string;
  sales: string;
  image: string;
}

// 📌 คลังวิดีโอหลักถาวร (ฝังในระบบ รีเฟรชหรือเปิดใน LINE กี่ครั้งก็ไม่มีวันหาย เปิดเล่นได้ทันทีเหมือนคลิปทั่วไป)
const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: '1',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-the-grass-41586-large.mp4',
    username: '@my_profile',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    caption: 'น้องหมาวิ่งเล่นในทุ่งหญ้าอย่างมีความสุข 🐶✨ #น้องหมา #สัตว์เลี้ยงน่ารัก',
    song: 'เสียงต้นฉบับ - Creator Studio',
    likes: 1250,
    comments: 48,
    shares: 12,
    saves: 35,
    hasProduct: true,
    productName: 'อาหารเมุน้องหมาพรีเมียม 1.5kg',
    productPrice: '฿390',
    commentList: [
      { id: 'c1', username: '@user_a', text: 'น่ารักมากๆ เลยครับซื้อจากไหนเนี่ย', time: '1 วันที่แล้ว' }
    ]
  },
  {
    id: '2',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-cute-dog-head-tilt-41585-large.mp4',
    username: '@pet_world',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    caption: 'เอียงคอสงสัยอะไรอยู่นะเจ้าตัวเล็ก 🐾❤️ #หมาน่ารัก #tiktokpets',
    song: 'เสียงต้นฉบับ - Pet World',
    likes: 3420,
    comments: 120,
    shares: 85,
    saves: 112,
    hasProduct: false,
    commentList: []
  }
];

const INITIAL_PRODUCTS: ProductItem[] = [
  { id: 'p1', name: 'อาหารเมุน้องหมาพรีเมียม 1.5kg', price: '฿390', sales: 'ขายแล้ว 1.2พัน ชิ้น', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&auto=format&fit=crop&q=60' },
  { id: 'p2', name: 'เสื้อยืดสุนัขลายแฟชั่นสุดเท่', price: '฿190', sales: 'ขายแล้ว 850 ชิ้น', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&auto=format&fit=crop&q=60' },
  { id: 'p3', name: 'แชมพูอาบน้ำสูตรอ่อนโยน', price: '฿250', sales: 'ขายแล้ว 540 ชิ้น', image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=300&auto=format&fit=crop&q=60' }
];

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('toktak_permanent_v13');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading localStorage', e);
    }
    return DEFAULT_VIDEOS;
  });

  const [products] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'upload' | 'profile' | 'services' | 'shop'>('home');
  
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{name: string, price: string} | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // ฟอร์มเพิ่มวิดีโอแบบเสถียร (ใช้ลิงก์ MP4 มั่นใจได้ว่าเปิดที่ไหนก็ไม่หาย)
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newSong, setNewSong] = useState('');
  const [hasProd, setHasProd] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('toktak_permanent_v13', JSON.stringify(videos));
    } catch (e) {
      console.error('Error saving localStorage', e);
    }
  }, [videos]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentIndex) {
        video.currentTime = 0;
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        video.pause();
      }
    });
    setShowComments(false);
  }, [currentIndex, videos]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== currentIndex && index >= 0 && index < videos.length) {
      setCurrentIndex(index);
    }
  };

  const togglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideos(videos.map(v => {
      if (v.id === id) {
        const isLiked = !v.isLiked;
        return { ...v, isLiked, likes: isLiked ? v.likes + 1 : v.likes - 1 };
      }
      return v;
    }));
  };

  const handleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideos(videos.map(v => {
      if (v.id === id) {
        const isSaved = !v.isSaved;
        return { ...v, isSaved, saves: isSaved ? v.saves + 1 : v.saves - 1 };
      }
      return v;
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: Date.now().toString(),
      username: '@my_profile',
      text: newCommentText.trim(),
      time: 'เมื่อสักครู่'
    };

    setVideos(videos.map((v, idx) => {
      if (idx === currentIndex) {
        return {
          ...v,
          comments: v.comments + 1,
          commentList: [newComment, ...(v.commentList || [])]
        };
      }
      return v;
    }));
    setNewCommentText('');
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = videoUrlInput.trim() || 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-the-grass-41586-large.mp4';

    const newItem: VideoItem = {
      id: Date.now().toString(),
      url: finalUrl,
      username: '@my_profile',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
      caption: newCaption.trim() || 'วิดีโอใหม่ของฉัน 🚀',
      song: newSong.trim() || 'เสียงต้นฉบับ - Creator Studio',
      likes: 1,
      comments: 0,
      shares: 0,
      saves: 0,
      hasProduct: hasProd,
      productName: prodName.trim() || 'สินค้าแนะนำ',
      productPrice: prodPrice.trim() || '฿199',
      commentList: []
    };

    setVideos([newItem, ...videos]);
    setVideoUrlInput('');
    setNewCaption('');
    setNewSong('');
    setHasProd(false);
    setProdName('');
    setProdPrice('');
    setActiveTab('home');
    setCurrentIndex(0);
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 h-[100dvh] w-screen overflow-hidden select-none">
      <div className="relative w-full max-w-md h-full bg-white flex flex-col overflow-hidden shadow-2xl border-x border-gray-200">
        
        <div className="flex-1 relative overflow-hidden bg-black">
          
          {/* แท็บหน้าหลัก (Home Feed) */}
          {activeTab === 'home' && (
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar" onScroll={handleScroll}>
              {videos.map((video, index) => (
                <div key={video.id} className="relative w-full h-full snap-start flex items-center justify-center bg-black" onClick={() => togglePlay(index)}>
                  <video
                    ref={(el) => { videoRefs.current[index] = el; }}
                    src={video.url}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    autoPlay
                    muted={false}
                  />

                  {!isPlaying && index === currentIndex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <Play className="w-16 h-16 text-white opacity-80 fill-white" />
                    </div>
                  )}

                  {/* แถบสินค้าพ่วงด้านบน */}
                  {video.hasProduct && (
                    <div className="absolute top-12 left-4 z-30">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct({ name: video.productName || 'สินค้า', price: video.productPrice || '฿0' });
                          setShowCartModal(true);
                        }}
                        className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-red-500 text-gray-900 px-3 py-1.5 rounded-full shadow-lg"
                      >
                        <ShoppingBag className="w-4 h-4 text-red-600 animate-bounce" />
                        <span className="text-xs font-bold truncate max-w-[140px]">{video.productName}</span>
                        <span className="text-xs bg-red-600 px-1.5 py-0.5 rounded text-white font-bold">{video.productPrice}</span>
                      </button>
                    </div>
                  )}

                  {/* รายละเอียดด้านล่าง (โปรไฟล์ + แคปชัน + เสียงเพลง) */}
                  <div className="absolute bottom-16 left-4 right-20 text-white z-30 pointer-events-none">
                    <div className="flex items-center gap-2 mb-2 pointer-events-auto">
                      <img src={video.userAvatar} alt="avatar" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow" />
                      <span className="font-bold text-sm drop-shadow">{video.username}</span>
                      <button onClick={(e) => { e.stopPropagation(); alert('ติดตามสำเร็จ!'); }} className="bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow">ติดตาม</button>
                    </div>
                    <p className="text-sm drop-shadow line-clamp-2">{video.caption}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-90">
                      <Music className="w-3.5 h-3.5 animate-spin" />
                      <span className="truncate">{video.song}</span>
                    </div>
                  </div>

                  {/* แถบเครื่องมือด้านขวา (ครบเครื่องเหมือน TikTok) */}
                  <div className="absolute bottom-20 right-3 flex flex-col items-center gap-3 text-white z-30">
                    <div className="relative">
                      <img src={video.userAvatar} alt="avatar" className="w-10 h-10 rounded-full border border-white object-cover shadow" />
                    </div>

                    <button className="flex flex-col items-center focus:outline-none mt-1" onClick={(e) => handleLike(video.id, e)}>
                      <div className="p-2.5 bg-black/40 rounded-full backdrop-blur-sm">
                        <Heart className={`w-6 h-6 ${video.isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                      </div>
                      <span className="text-[11px] mt-0.5 font-semibold">{video.likes}</span>
                    </button>

                    <button className="flex flex-col items-center focus:outline-none" onClick={(e) => { e.stopPropagation(); setShowComments(true); }}>
                      <div className="p-2.5 bg-black/40 rounded-full backdrop-blur-sm">
                        <MessageCircle className="w-6 h-6 text-white fill-white/20" />
                      </div>
                      <span className="text-[11px] mt-0.5 font-semibold">{video.comments}</span>
                    </button>

                    <button className="flex flex-col items-center focus:outline-none" onClick={(e) => handleSave(video.id, e)}>
                      <div className="p-2.5 bg-black/40 rounded-full backdrop-blur-sm">
                        <Bookmark className={`w-6 h-6 ${video.isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
                      </div>
                      <span className="text-[11px] mt-0.5 font-semibold">{video.saves}</span>
                    </button>

                    <button className="flex flex-col items-center focus:outline-none" onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}>
                      <div className="p-2.5 bg-black/40 rounded-full backdrop-blur-sm">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[11px] mt-0.5 font-semibold">{video.shares}</span>
                    </button>

                    {/* วงกลมเสียงเพลงหมุนๆ ด้านล่างขวา */}
                    <div className="w-9 h-9 bg-zinc-900 rounded-full border-2 border-zinc-700 flex items-center justify-center animate-spin mt-2">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* แท็บโพสต์วิดีโอ */}
          {activeTab === 'upload' && (
            <div className="absolute inset-0 bg-white text-gray-900 flex flex-col p-6 overflow-y-auto z-30">
              <h2 className="text-xl font-bold mb-4 text-center mt-2 text-gray-900">โพสต์วิดีโอใหม่</h2>
              <form onSubmit={handleAddVideo} className="flex flex-col gap-3 pb-12">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-semibold">ลิงก์วิดีโอ (MP4 URL)</label>
                  <input 
                    type="url" 
                    placeholder="https://.../video.mp4 (หรือเว้นว่างเพื่อใช้คลิปตัวอย่าง)" 
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs text-gray-900 focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">*มั่นใจได้ 100% เปิดใน LINE หรือรีเฟรชกี่รอบก็ไม่หาย เปิดดูได้ตลอดกาล</p>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-semibold">คำอธิบาย (Caption)</label>
                  <textarea 
                    placeholder="เขียนแคปชันของคุณที่นี่..." 
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 h-16 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-semibold">ชื่อเพลง / เสียงประกอบ</label>
                  <input 
                    type="text" 
                    placeholder="เสียงต้นฉบับ - Creator Studio" 
                    value={newSong}
                    onChange={(e) => setNewSong(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-gray-800">
                      <ShoppingBag className="w-3.5 h-3.5 text-red-600" /> พ่วงสินค้าในร้านค้า
                    </span>
                    <input 
                      type="checkbox" 
                      checked={hasProd} 
                      onChange={(e) => setHasProd(e.target.checked)}
                      className="w-4 h-4 accent-red-600"
                    />
                  </div>
                  {hasProd && (
                    <div className="flex flex-col gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="ชื่อสินค้า เช่น เสื้อยืดสุดเท่" 
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                      />
                      <input 
                        type="text" 
                        placeholder="ราคา เช่น ฿290" 
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                      />
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors mt-1 shadow-lg text-sm">
                  โพสต์วิดีโอทันที
                </button>
              </form>
            </div>
          )}

          {/* แท็บหน้าร้านค้า */}
          {activeTab === 'shop' && (
            <div className="absolute inset-0 bg-white text-gray-900 flex flex-col p-4 overflow-y-auto z-30">
              <h2 className="text-lg font-bold mb-3 text-center mt-2 flex items-center justify-center gap-2 text-gray-900">
                <Store className="w-5 h-5 text-red-600" /> ร้านค้าแนะนำ
              </h2>
              <div className="grid grid-cols-2 gap-3 pb-12">
                {products.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col justify-between">
                    <img src={item.image} alt={item.name} className="w-full h-28 object-cover" />
                    <div className="p-2.5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-bold text-xs line-clamp-2 text-gray-900">{item.name}</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.sales}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-red-600 font-bold text-sm">{item.price}</span>
                        <button 
                          onClick={() => {
                            setSelectedProduct({ name: item.name, price: item.price });
                            setShowCartModal(true);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-2.5 py-1 rounded-md font-bold shadow"
                        >
                          ดูสินค้า
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* แท็บหน้าบริการ */}
          {activeTab === 'services' && (
            <div className="absolute inset-0 bg-white text-gray-900 flex flex-col p-6 overflow-y-auto z-30">
              <h2 className="text-xl font-bold mb-4 text-center mt-2 text-gray-900">ศูนย์รวมบริการและเมนู</h2>
              <div className="grid grid-cols-2 gap-3 pb-12">
                <button onClick={() => setActiveTab('shop')} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center hover:bg-gray-100 transition-colors">
                  <Store className="w-8 h-8 text-red-600 mb-2" />
                  <h3 className="font-bold text-sm text-gray-900">ร้านค้าแนะนำ</h3>
                  <p className="text-xs text-gray-500 mt-1">เลือกชมสินค้าทั้งหมด</p>
                </button>
                <button onClick={() => setActiveTab('home')} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center hover:bg-gray-100 transition-colors">
                  <Compass className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-bold text-sm text-gray-900">สำรวจฟีด</h3>
                  <p className="text-xs text-gray-500 mt-1">ดูวิดีโอทั้งหมด</p>
                </button>
              </div>
            </div>
          )}

          {/* แท็บโปรไฟล์ */}
          {activeTab === 'profile' && (
            <div className="absolute inset-0 bg-white text-gray-900 flex flex-col items-center pt-12 px-6 overflow-y-auto z-30">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60" alt="profile" className="w-20 h-20 rounded-full object-cover mb-3 shadow-lg border-2 border-red-500" />
              <h2 className="text-lg font-bold text-gray-900">@my_profile</h2>
              <p className="text-xs text-gray-500 mt-1">ผู้สร้างคอนเทนต์วิดีโอสั้นตัวยง</p>
              
              <div className="flex gap-6 mt-6 text-center">
                <div>
                  <span className="block font-bold text-base text-gray-900">{videos.length}</span>
                  <span className="text-xs text-gray-500">โพสต์</span>
                </div>
                <div>
                  <span className="block font-bold text-base text-gray-900">1.5M</span>
                  <span className="text-xs text-gray-500">ผู้ติดตาม</span>
                </div>
                <div>
                  <span className="block font-bold text-base text-gray-900">3.2M</span>
                  <span className="text-xs text-gray-500">ถูกใจ</span>
                </div>
              </div>

              <div className="w-full mt-8 border-t border-gray-200 pt-4 pb-12">
                <h3 className="text-xs font-bold text-gray-700 mb-3">วิดีโอทั้งหมดของคุณ ({videos.length})</h3>
                <div className="grid grid-cols-3 gap-1">
                  {videos.map((v) => (
                    <div key={v.id} className="aspect-[9/16] bg-gray-200 relative overflow-hidden rounded">
                      <video src={v.url} className="w-full h-full object-cover pointer-events-none" muted />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal คอมเมนต์ */}
          {showComments && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col justify-end">
              <div className="bg-white w-full h-[60%] rounded-t-2xl flex flex-col text-gray-900 border-t border-gray-200 shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <span className="text-sm font-bold">ความคิดเห็น ({videos[currentIndex]?.comments || 0})</span>
                  <button onClick={() => setShowComments(false)} className="text-gray-500 font-bold px-2">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {videos[currentIndex]?.commentList?.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shrink-0">
                        {c.username.substring(1, 3).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 font-semibold">{c.username}</span>
                        <p className="text-sm mt-0.5 text-gray-900">{c.text}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">{c.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="แสดงความคิดเห็น..." 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500"
                  />
                  <button type="submit" className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Modal แชร์โซเชียล */}
          {showShareModal && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
              <div className="bg-white w-full rounded-t-2xl p-5 text-gray-900 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold">แชร์ไปยังโซเชียล</span>
                  <button onClick={() => setShowShareModal(false)} className="text-gray-400 font-bold">✕</button>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center pb-4">
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('คัดลอกลิงก์สำเร็จ นำไปวางแชร์ใน LINE ได้เลย!'); setShowShareModal(false); }} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow">LINE</div>
                    <span className="text-[11px]">คัดลอกลิงก์</span>
                  </button>
                  <button onClick={() => { alert('บันทึกคลิปลงเครื่องสำเร็จ!'); setShowShareModal(false); }} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow">💾</div>
                    <span className="text-[11px]">บันทึกวิดีโอ</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal ร้านค้าสินค้า */}
          {showCartModal && selectedProduct && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-200 w-full max-w-xs rounded-2xl p-5 text-gray-900 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold flex items-center gap-1.5 text-red-600">
                    <Store className="w-4 h-4" /> รายละเอียดสินค้า
                  </span>
                  <button onClick={() => setShowCartModal(false)} className="text-gray-400 font-bold">✕</button>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-200">
                  <p className="font-bold text-sm text-gray-900">{selectedProduct.name}</p>
                  <p className="text-red-600 font-bold text-base mt-1">{selectedProduct.price}</p>
                </div>
                <button 
                  onClick={() => { alert('สั่งซื้อสินค้าสำเร็จ!'); setShowCartModal(false); }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow"
                >
                  ยืนยันการสั่งซื้อ
                </button>
              </div>
            </div>
          )}

        </div>

        {/* แถบเมนูด้านล่าง */}
        <div className="h-14 bg-white border-t border-gray-200 flex items-center justify-around px-2 z-40 shrink-0 shadow-lg">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'home' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">หน้าหลัก</span>
          </button>

          <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'shop' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
            <Store className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">ร้านค้า</span>
          </button>

          <button onClick={() => setActiveTab('upload')} className="flex items-center justify-center w-10 h-7 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors shadow">
            <PlusSquare className="w-5 h-5" />
          </button>

          <button onClick={() => setActiveTab('services')} className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'services' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">บริการ</span>
          </button>

          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'profile' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">ฉัน</span>
          </button>
        </div>

      </div>
    </div>
  );
}
