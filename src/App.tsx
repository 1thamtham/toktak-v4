import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Music, Home, Compass, PlusSquare, Inbox, User, Play, ShoppingBag, Send, Upload } from 'lucide-react';

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
  caption: string;
  song: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  commentList?: CommentItem[];
  hasProduct?: boolean;
  productName?: string;
  productPrice?: string;
}

const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: '1',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-the-grass-41586-large.mp4',
    username: '@doglover_th',
    caption: 'น้องหมาวิ่งเล่นในทุ่งหญ้าอย่างมีความสุข 🐶✨ #น้องหมา #สัตว์เลี้ยงน่ารัก',
    song: 'เสียงต้นฉบับ - Dog Lover',
    likes: 1250,
    comments: 48,
    shares: 12,
    hasProduct: true,
    productName: 'อาหารเมุน้องหมาพรีเมียม 1.5kg',
    productPrice: '฿390',
    commentList: [
      { id: 'c1', username: '@user_a', text: 'น่ารักมากๆ เลยครับซื้อจากไหนเนี่ย', time: '1 วันที่แล้ว' }
    ]
  }
];

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('toktak_fresh_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading localStorage', e);
    }
    return INITIAL_VIDEOS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'upload' | 'profile' | 'services'>('home');
  
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{name: string, price: string} | null>(null);

  // ฟอร์มเพิ่มวิดีโอ (อัปโหลดจากเครื่องแปลงเป็น Base64 ป้องกันรีเฟรชหาย)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [newCaption, setNewCaption] = useState('');
  const [newSong, setNewSong] = useState('');
  const [hasProd, setHasProd] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('toktak_fresh_v1', JSON.stringify(videos));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPreviewUrl) {
      alert('กรุณาเลือกไฟล์วิดีโอก่อนครับ');
      return;
    }

    const newItem: VideoItem = {
      id: Date.now().toString(),
      url: videoPreviewUrl,
      username: '@my_profile',
      caption: newCaption.trim() || 'วิดีโอใหม่ของฉัน 🚀',
      song: newSong.trim() || 'เสียงต้นฉบับ - Creator',
      likes: 1,
      comments: 0,
      shares: 0,
      hasProduct: hasProd,
      productName: prodName.trim() || 'สินค้าแนะนำ',
      productPrice: prodPrice.trim() || '฿199',
      commentList: []
    };

    setVideos([newItem, ...videos]);
    setVideoPreviewUrl('');
    setNewCaption('');
    setNewSong('');
    setHasProd(false);
    setProdName('');
    setProdPrice('');
    setActiveTab('home');
    setCurrentIndex(0);
  };

  return (
    <div className="flex justify-center items-center bg-zinc-950 h-[100dvh] w-screen overflow-hidden select-none">
      <div className="relative w-full max-w-md h-full bg-black flex flex-col overflow-hidden shadow-2xl border-x border-zinc-900">
        
        <div className="flex-1 relative overflow-hidden">
          
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
                    muted={false}
                  />

                  {!isPlaying && index === currentIndex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <Play className="w-16 h-16 text-white opacity-80 fill-white" />
                    </div>
                  )}

                  {video.hasProduct && (
                    <div className="absolute top-12 left-4 z-20">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct({ name: video.productName || 'สินค้า', price: video.productPrice || '฿0' });
                          setShowCartModal(true);
                        }}
                        className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md border border-red-500/50 text-white px-3 py-1.5 rounded-full shadow-lg"
                      >
                        <ShoppingBag className="w-4 h-4 text-red-500 animate-bounce" />
                        <span className="text-xs font-semibold truncate max-w-[150px]">{video.productName}</span>
                        <span className="text-xs bg-red-600 px-1.5 py-0.5 rounded text-white font-bold">{video.productPrice}</span>
                      </button>
                    </div>
                  )}

                  <div className="absolute bottom-16 left-4 right-20 text-white z-10 pointer-events-none">
                    <h3 className="font-bold text-base drop-shadow">{video.username}</h3>
                    <p className="text-sm mt-1 drop-shadow line-clamp-2">{video.caption}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-90">
                      <Music className="w-3.5 h-3.5 animate-spin" />
                      <span className="truncate">{video.song}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-20 right-3 flex flex-col items-center gap-4 text-white z-10">
                    <button className="flex flex-col items-center focus:outline-none" onClick={(e) => handleLike(video.id, e)}>
                      <div className="p-3 bg-black/40 rounded-full backdrop-blur-sm">
                        <Heart className={`w-7 h-7 ${video.isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                      </div>
                      <span className="text-xs mt-1 font-medium">{video.likes}</span>
                    </button>

                    <button className="flex flex-col items-center focus:outline-none" onClick={(e) => { e.stopPropagation(); setShowComments(true); }}>
                      <div className="p-3 bg-black/40 rounded-full backdrop-blur-sm">
                        <MessageCircle className="w-7 h-7 text-white fill-white/20" />
                      </div>
                      <span className="text-xs mt-1 font-medium">{video.comments}</span>
                    </button>

                    <button className="flex flex-col items-center focus:outline-none" onClick={(e) => e.stopPropagation()}>
                      <div className="p-3 bg-black/40 rounded-full backdrop-blur-sm">
                        <Share2 className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-xs mt-1 font-medium">{video.shares}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* แท็บอัปโหลดวิดีโอจากเครื่อง */}
          {activeTab === 'upload' && (
            <div className="h-full w-full bg-zinc-900 text-white flex flex-col p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-center mt-2">อัปโหลดวิดีโอจากเครื่อง</h2>
              <form onSubmit={handleAddVideo} className="flex flex-col gap-3 pb-12">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">เลือกไฟล์วิดีโอ (MP4)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-700 border-dashed rounded-xl cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                    <div className="flex flex-col items-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                      <p className="text-xs text-zinc-300 font-medium">คลิกเพื่อเลือกไฟล์วิดีโอ</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">รองรับไฟล์ MP4 จากคอมหรือมือถือ</p>
                    </div>
                    <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                {videoPreviewUrl && (
                  <div className="w-full h-32 bg-black rounded-lg overflow-hidden border border-zinc-700">
                    <video src={videoPreviewUrl} className="w-full h-full object-contain" controls />
                  </div>
                )}

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">คำอธิบาย (Caption)</label>
                  <textarea 
                    placeholder="เขียนแคปชันของคุณที่นี่..." 
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500 h-16 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">ชื่อเพลง / เสียงประกอบ</label>
                  <input 
                    type="text" 
                    placeholder="เสียงต้นฉบับ - Creator" 
                    value={newSong}
                    onChange={(e) => setNewSong(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-red-500" /> พ่วงตะกร้าสินค้า
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
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="ราคา เช่น ฿290" 
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-xs text-white"
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

          {/* แท็บหน้าบริการ */}
          {activeTab === 'services' && (
            <div className="h-full w-full bg-zinc-900 text-white flex flex-col p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-center mt-2">ศูนย์รวมบริการและสินค้า</h2>
              <div className="grid grid-cols-2 gap-3 pb-12">
                <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 flex flex-col justify-between">
                  <div>
                    <ShoppingBag className="w-8 h-8 text-red-500 mb-2" />
                    <h3 className="font-bold text-sm">ตะกร้าสินค้า</h3>
                    <p className="text-xs text-zinc-400 mt-1">จัดการสินค้าพ่วงในคลิป</p>
                  </div>
                  <span className="text-xs bg-red-600 text-white py-1 px-2 rounded mt-4 text-center font-bold">พร้อมใช้งาน</span>
                </div>
                <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 flex flex-col justify-between">
                  <div>
                    <Compass className="w-8 h-8 text-blue-500 mb-2" />
                    <h3 className="font-bold text-sm">สำรวจฟีด</h3>
                    <p className="text-xs text-zinc-400 mt-1">ดูวิดีโอทั้งหมด</p>
                  </div>
                  <button onClick={() => setActiveTab('home')} className="text-xs bg-blue-600 text-white py-1 px-2 rounded mt-4 text-center font-bold">ไปที่ฟีด</button>
                </div>
              </div>
            </div>
          )}

          {/* แท็บโปรไฟล์ */}
          {activeTab === 'profile' && (
            <div className="h-full w-full bg-zinc-900 text-white flex flex-col items-center pt-12 px-6 overflow-y-auto">
              <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-full flex items-center justify-center text-2xl font-bold mb-3 shadow-lg">
                TH
              </div>
              <h2 className="text-lg font-bold">@my_profile</h2>
              <p className="text-xs text-zinc-400 mt-1">ผู้สร้างคอนเทนต์วิดีโอสั้นตัวยง</p>
              
              <div className="flex gap-6 mt-6 text-center">
                <div>
                  <span className="block font-bold text-base">{videos.length}</span>
                  <span className="text-xs text-zinc-400">โพสต์</span>
                </div>
                <div>
                  <span className="block font-bold text-base">1.5M</span>
                  <span className="text-xs text-zinc-400">ผู้ติดตาม</span>
                </div>
                <div>
                  <span className="block font-bold text-base">3.2M</span>
                  <span className="text-xs text-zinc-400">ถูกใจ</span>
                </div>
              </div>

              <div className="w-full mt-8 border-t border-zinc-800 pt-4 pb-12">
                <h3 className="text-xs font-semibold text-zinc-400 mb-3">วิดีโอทั้งหมดของคุณ ({videos.length})</h3>
                <div className="grid grid-cols-3 gap-1">
                  {videos.map((v) => (
                    <div key={v.id} className="aspect-[9/16] bg-zinc-800 relative overflow-hidden rounded">
                      <video src={v.url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal คอมเมนต์ */}
          {showComments && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end">
              <div className="bg-zinc-900 w-full h-[60%] rounded-t-2xl flex flex-col text-white border-t border-zinc-800">
                <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                  <span className="text-sm font-bold">ความคิดเห็น ({videos[currentIndex]?.comments || 0})</span>
                  <button onClick={() => setShowComments(false)} className="text-zinc-400 font-bold px-2">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {videos[currentIndex]?.commentList?.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {c.username.substring(1, 3).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs text-zinc-400 font-semibold">{c.username}</span>
                        <p className="text-sm mt-0.5">{c.text}</p>
                        <span className="text-[10px] text-zinc-500 mt-1 block">{c.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="แสดงความคิดเห็น..." 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <button type="submit" className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Modal ตะกร้าสินค้า */}
          {showCartModal && selectedProduct && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xs rounded-2xl p-5 text-white shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold flex items-center gap-1.5 text-red-500">
                    <ShoppingBag className="w-4 h-4" /> ตะกร้าสินค้าช้อปปิ้ง
                  </span>
                  <button onClick={() => setShowCartModal(false)} className="text-zinc-400 font-bold">✕</button>
                </div>
                <div className="bg-zinc-800 p-3 rounded-xl mb-4">
                  <p className="font-semibold text-sm">{selectedProduct.name}</p>
                  <p className="text-red-500 font-bold text-base mt-1">{selectedProduct.price}</p>
                </div>
                <button 
                  onClick={() => { alert('สั่งซื้อสินค้าสำเร็จ!'); setShowCartModal(false); }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  ชำระเงินทันที
                </button>
              </div>
            </div>
          )}

        </div>

        {/* แถบเมนูด้านล่าง */}
        <div className="h-14 bg-black border-t border-zinc-900 flex items-center justify-around px-2 z-20 shrink-0">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'home' ? 'text-white' : 'text-zinc-500'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">หน้าหลัก</span>
          </button>

          <button onClick={() => setActiveTab('services')} className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'services' ? 'text-white' : 'text-zinc-500'}`}>
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">บริการ</span>
          </button>

          <button onClick={() => setActiveTab('upload')} className="flex items-center justify-center w-10 h-7 bg-white rounded-md text-black hover:bg-zinc-200 transition-colors shadow">
            <PlusSquare className="w-5 h-5 fill-white text-black" />
          </button>

          <button onClick={() => setActiveTab('home')} className="flex flex-col items-center justify-center w-12 h-full text-zinc-500">
            <Inbox className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">ข้อความ</span>
          </button>

          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'profile' ? 'text-white' : 'text-zinc-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">ฉัน</span>
          </button>
        </div>

      </div>
    </div>
  );
}
