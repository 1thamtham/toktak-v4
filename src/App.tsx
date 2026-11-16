import React, { useState, useEffect } from 'react';
import {
  Home,
  ShoppingBag,
  Plus,
  Compass,
  User,
  Heart,
  MessageCircle,
  Share2,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Crown,
  Search,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { VideoItem, ProductItem, UserProfile, CartItem } from './types';
import { ProfileView } from './components/ProfileView';

export function App() {
  // โหลดข้อมูลคลิปจาก localStorage ป้องกันคลิปหายและไม่ดึงคลิปกระต่ายมาทับ
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('toktak_my_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading videos', e);
    }
    // ค่าเริ่มต้นถ้ายังไม่มีคลิป
    return [
      {
        id: 'default-1',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        caption: 'มอเตอร์ไซค์ไฟฟ้าประดิษฐ์เอง ฝีมือคนไทยสุดเจ๋ง!',
        creatorName: 'Golden River City',
        creatorHandle: '@goldenrivercity',
        likesCount: 1540,
        musicTitle: 'Original Sound - TokDesign Creator',
        isLiked: false,
        isPrivate: false,
        isDraft: false
      }
    ];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('toktak_current_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Error loading user', e);
    }
    return {
      email: '***************@*****.***',
      name: 'Golden River City',
      handle: '@goldenrivercity',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95',
      bio: 'นักประดิษฐ์มอเตอร์ไซค์ไฟฟ้า และครีเอเตอร์ TokTak',
      followersCount: 1250,
      followingCount: 180,
      likesCount: 9400,
      joinedDate: 'พฤศจิกายน 2568',
      role: 'superadmin'
    };
  });

  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'create' | 'explore' | 'profile'>('home');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [myProducts, setMyProducts] = useState<ProductItem[]>([
    {
      id: 'p1',
      name: 'เสื้อยืดโอเวอร์ไซส์ ลิมิเต็ดอิดิชั่น',
      price: 390,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      salesCount: 48
    }
  ]);

  // บันทึกข้อมูลลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    try {
      localStorage.setItem('toktak_my_videos', JSON.stringify(videos));
    } catch (e) {
      console.error('Error saving videos', e);
    }
  }, [videos]);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('toktak_current_user', JSON.stringify(currentUser));
      } catch (e) {
        console.error('Error saving user', e);
      }
    }
  }, [currentUser]);

  const handleAddVideo = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev]);
    setActiveTab('profile');
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  const handleToggleVideoPrivacy = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isPrivate: !v.isPrivate } : v))
    );
  };

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* ส่วนแสดงผลหลักตามแท็บ */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-center items-center">
        {activeTab === 'home' && (
          <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
            {videos.length > 0 && videos[currentVideoIndex] ? (
              <>
                <video
                  src={videos[currentVideoIndex].videoUrl}
                  poster={videos[currentVideoIndex].posterUrl}
                  autoPlay
                  playsInline
                  loop
                  muted={isMuted}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-16 left-4 right-16 z-20 text-white drop-shadow-md">
                  <h3 className="text-sm font-bold">{videos[currentVideoIndex].creatorName}</h3>
                  <p className="text-xs mt-1 line-clamp-2">{videos[currentVideoIndex].caption}</p>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 text-xs">ยังไม่มีวิดีโอในระบบ</div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-900">
            <ProfileView
              currentUser={currentUser}
              onLoginWithGoogle={(email, name) => {
                if (email) {
                  setCurrentUser((prev) => ({
                    ...(prev || {
                      followersCount: 0,
                      followingCount: 0,
                      likesCount: 0,
                      joinedDate: 'วันนี้',
                      role: 'user'
                    }),
                    email,
                    name: name || email.split('@')[0],
                    handle: `@${email.split('@')[0]}`
                  }));
                }
              }}
              onLogout={() => setCurrentUser(null)}
              onUpdateProfile={(updated) => {
                setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
              }}
              cart={cart}
              onRemoveFromCart={(id) => setCart((prev) => prev.filter((i) => i.id !== id))}
              onClearCart={() => setCart([])}
              onOpenDesignStudio={() => alert('เปิดหน้าดีไซน์สตูดิโอ')}
              onOpenCreateClip={() => setActiveTab('create')}
              onOpenAdminBackend={() => alert('เปิดหลังบ้าน Admin')}
              onOpenTokTakShop={() => alert('เปิด TokTak Shop')}
              onPlayVideo={(vid) => {
                const idx = videos.findIndex((v) => v.id === vid.id);
                if (idx !== -1) setCurrentVideoIndex(idx);
                setActiveTab('home');
              }}
              onDeleteVideo={handleDeleteVideo}
              onToggleVideoPrivacy={handleToggleVideoPrivacy}
              myProducts={myProducts}
              myVideos={videos}
            />
          </div>
        )}

        {activeTab === 'create' && (
          <div className="w-full h-full bg-white text-slate-900 p-4 flex flex-col justify-center items-center">
            <h2 className="text-base font-bold mb-4">โพสต์คลิปวิดีโอใหม่</h2>
            <button
              onClick={() => {
                const sampleVid: VideoItem = {
                  id: 'clip-' + Date.now(),
                  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                  posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
                  caption: 'คลิปมอเตอร์ไซค์ไฟฟ้าคันใหม่ล่าสุด!',
                  creatorName: currentUser?.name || 'Golden River City',
                  creatorHandle: currentUser?.handle || '@goldenrivercity',
                  authorEmail: currentUser?.email,
                  likesCount: 1,
                  musicTitle: 'Electric Motorcycle Sound',
                  isLiked: false,
                  isPrivate: false,
                  isDraft: false
                };
                handleAddVideo(sampleVid);
              }}
              className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition"
            >
              จำลองอัปโหลดคลิปตัวอย่าง
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="mt-3 text-xs text-slate-500 underline"
            >
              กลับหน้าโปรไฟล์
            </button>
          </div>
        )}
      </div>

      {/* แถบเมนูด้านล่าง */}
      <div className="h-14 bg-white border-t border-slate-200 flex items-center justify-around text-slate-600 px-2 z-30 shrink-0">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center ${activeTab === 'home' ? 'text-rose-600 font-bold' : 'text-slate-400'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">หน้าแรก</span>
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center ${activeTab === 'shop' ? 'text-rose-600 font-bold' : 'text-slate-400'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ร้านค้า</span>
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-rose-500 text-white flex items-center justify-center shadow-md active:scale-95 transition"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center ${activeTab === 'explore' ? 'text-rose-600 font-bold' : 'text-slate-400'}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">อื่นๆ</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-rose-600 font-bold' : 'text-slate-400'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">โปรไฟล์</span>
        </button>
      </div>
    </div>
  );
}
