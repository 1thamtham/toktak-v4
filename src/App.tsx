import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Music, Home, Compass, PlusSquare, Inbox, User, Play, Pause } from 'lucide-react';

interface VideoItem {
  id: string;
  url: string;
  username: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
}

// วิดีโอตัวอย่างตั้งต้น (ใช้ลิงก์ที่เสถียรและเล่นได้จริง)
const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: '1',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-in-the-grass-41586-large.mp4',
    username: '@doglover_th',
    caption: 'น้องหมาวิ่งเล่นในทุ่งหญ้าอย่างมีความสุข 🐶✨ #น้องหมา #สัตว์เลี้ยงน่ารัก',
    song: 'เสียงต้นฉบับ - Dog Lover',
    likes: 1250,
    comments: 48,
  },
  {
    id: '2',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-cute-dog-head-tilt-41585-large.mp4',
    username: '@pet_world',
    caption: 'เอียงคอสงสัยอะไรอยู่นะเจ้าตัวเล็ก 🐾❤️ #หมาน่ารัก #tiktokpets',
    song: 'เสียงต้นฉบับ - Pet World',
    likes: 3420,
    comments: 120,
  },
];

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('toktak_videos_v1');
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
  const [activeTab, setActiveTab] = useState<'home' | 'upload' | 'profile'>('home');
  const [isUploading, setIsUploading] = useState(false);

  // ฟอร์มสำหรับจำลองการอัปโหลด
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // บันทึกลง localStorage ทุกครั้งที่ videos เปลี่ยน
  useEffect(() => {
    try {
      localStorage.setItem('toktak_videos_v1', JSON.stringify(videos));
    } catch (e) {
      console.error('Error saving localStorage', e);
    }
  }, [videos]);

  // จัดการการเล่นวิดีโออัตโนมัติเมื่อเลื่อนฟีด
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentIndex) {
        video.currentTime = 0;
        video.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      } else {
        video.pause();
      }
    });
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

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    const newItem: VideoItem = {
      id: Date.now().toString(),
      url: newVideoUrl.trim(),
      username: '@my_profile',
      caption: newCaption.trim() || 'วิดีโอใหม่ของฉัน 🚀 #toktak',
      song: 'เสียงต้นฉบับ - Creator',
      likes: 1,
      comments: 0,
    };

    const updated = [newItem, ...videos];
    setVideos(updated);
    setNewVideoUrl('');
    setNewCaption('');
    setActiveTab('home');
    setCurrentIndex(0);
  };

  return (
    <div className="flex justify-center items-center bg-black h-[100dvh] w-screen overflow-hidden select-none">
      {/* Container มือถือ */}
      <div className="relative w-full max-w-md h-full bg-zinc-950 flex flex-col overflow-hidden shadow-2xl">
        
        {/* ส่วนเนื้อหาหลัก */}
        <div className="flex-1 relative overflow-hidden">
          
          {/* แท็บ Home: ฟีดวิดีโอเลื่อนขึ้น-ลง */}
          {activeTab === 'home' && (
            <div 
              className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
              onScroll={handleScroll}
            >
              {videos.map((video, index) => (
                <div 
                  key={video.id} 
                  className="relative w-full h-full snap-start flex items-center justify-center bg-black"
                  onClick={() => togglePlay(index)}
                >
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={video.url}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    muted={false}
                  />

                  {/* ปุ่มกด Play/Pause ชั่วคราวถ้าหยุด */}
                  {!isPlaying && index === currentIndex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <Play className="w-16 h-16 text-white opacity-80 fill-white" />
                    </div>
                  )}

                  {/* รายละเอียดด้านซ้าย (Caption & Sound) */}
                  <div className="absolute bottom-16 left-4 right-20 text-white z-10 pointer-events-none">
                    <h3 className="font-bold text-base drop-shadow">{video.username}</h3>
                    <p className="text-sm mt-1 drop-shadow line-clamp-2">{video.caption}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-90">
                      <Music className="w-3.5 h-3.5 animate-spin" />
                      <span className="truncate">{video.song}</span>
                    </div>
                  </div>

                  {/* ปุ่มกดด้านขวา (Like, Comment, Share) */}
                  <div className="absolute bottom-20 right-3 flex flex-col items-center gap-4 text-white z-10">
                    <button className="flex flex-col items-center focus:outline-none" onClick={(e) => { e.stopPropagation(); }}>
                      <div className="p-3 bg-black/40 rounded-full backdrop-blur-sm active:scale-125 transition-transform">
                        <Heart className="w-7 h-7 text-white fill-red-500" />
                      </div>
                      <span className="text-xs mt-1 font-medium">{video.likes}</span>
                    </button>

                    <button className="flex flex-col items-center focus:outline-none" onClick={(e) => { e.stopPropagation(); }}>
                      <div className="p-3 bg-black/40 rounded-full backdrop-blur-sm">
                        <MessageCircle className="w-7 h-7 text-white fill-white/20" />
                      </div>
                      <span className="text-xs mt-1 font-medium">{video.comments}</span>
                    </button>

                    <button className="flex flex-col items-center focus:outline-none" onClick={(e) => { e.stopPropagation(); }}>
                      <div className="p-3 bg-black/40 rounded-full backdrop-blur-sm">
                        <Share2 className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-xs mt-1 font-medium">แชร์</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* แท็บ Upload: หน้าเพิ่มวิดีโอ */}
          {activeTab === 'upload' && (
            <div className="h-full w-full bg-zinc-900 text-white flex flex-col p-6 justify-center">
              <h2 className="text-xl font-bold mb-6 text-center">อัปโหลดวิดีโอใหม่</h2>
              <form onSubmit={handleAddVideo} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">ลิงก์วิดีโอ (MP4 URL)</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/video.mp4" 
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">คำอธิบาย (Caption)</label>
                  <textarea 
                    placeholder="เขียนแคปชันของคุณที่นี่..." 
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-500 h-24 resize-none"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                >
                  โพสต์วิดีโอ
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('home')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
              </form>
            </div>
          )}

          {/* แท็บ Profile: หน้าโปรไฟล์ */}
          {activeTab === 'profile' && (
            <div className="h-full w-full bg-zinc-900 text-white flex flex-col items-center pt-12 px-6 overflow-y-auto">
              <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-full flex items-center justify-center text-2xl font-bold mb-3 shadow-lg">
                TH
              </div>
              <h2 className="text-lg font-bold">@my_profile</h2>
              <p className="text-xs text-zinc-400 mt-1">ผู้สร้างคอนเทนต์วิดีโอสั้น</p>
              
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

              <div className="w-full mt-8 border-t border-zinc-800 pt-4">
                <h3 className="text-xs font-semibold text-zinc-400 mb-3">วิดีโอของคุณ ({videos.length})</h3>
                <div className="grid grid-cols-3 gap-1">
                  {videos.map((v, i) => (
                    <div key={v.id} className="aspect-[9/16] bg-zinc-800 relative overflow-hidden rounded">
                      <video src={v.url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* แถบเมนูด้านล่างสุด (Bottom Navigation) ตรึงถาวร */}
        <div className="h-14 bg-black border-t border-zinc-900 flex items-center justify-around px-2 z-20 shrink-0">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'home' ? 'text-white' : 'text-zinc-500'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">หน้าหลัก</span>
          </button>

          <button 
            onClick={() => setActiveTab('home')} 
            className="flex flex-col items-center justify-center w-12 h-full text-zinc-500"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">สำรวจ</span>
          </button>

          {/* ปุ่มบวกตรงกลาง */}
          <button 
            onClick={() => setActiveTab('upload')} 
            className="flex items-center justify-center w-10 h-7 bg-white rounded-md text-black hover:bg-zinc-200 transition-colors shadow"
          >
            <PlusSquare className="w-5 h-5 fill-white text-black" />
          </button>

          <button 
            onClick={() => setActiveTab('home')} 
            className="flex flex-col items-center justify-center w-12 h-full text-zinc-500"
          >
            <Inbox className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">กล่องข้อความ</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex flex-col items-center justify-center w-12 h-full ${activeTab === 'profile' ? 'text-white' : 'text-zinc-500'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">ฉัน</span>
          </button>
        </div>

      </div>
    </div>
  );
}

            

    
     
  
