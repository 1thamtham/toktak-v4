import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Eye,
  Heart,
  Send,
  ShoppingBag,
  Gift,
  Share2,
  Sparkles,
  Radio,
  Plus,
  Check,
  SwitchCamera,
  Sun,
  Mic,
  MicOff,
  Sliders,
  AlertCircle,
  RefreshCw,
  Crown
} from 'lucide-react';
import { ProductItem, LiveComment, UserProfile } from '../types';

interface LiveStreamViewProps {
  onClose: () => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenDesignStudio: (type: 'tshirt' | 'phonecase' | 'totebag') => void;
  pinnedProduct: ProductItem;
  currentUser?: UserProfile | null;
}

const INITIAL_LIVE_COMMENTS: LiveComment[] = [
  { id: '1', userName: 'น้องมายด์', text: 'สวัสดีค่า ลายเสื้อเท่มากเลย', badge: 'แฟนตัวยง' },
  { id: '2', userName: 'Art_BKK', text: 'เคสโทรศัพท์รุ่น 16 Pro Max มีไหมครับ?', badge: 'VIP' },
  { id: '3', userName: 'ช่างกราฟิก', text: 'สกรีนสดในไลฟ์เลยมั้ยครับ รอชม!', badge: 'ผู้ซื้อ' },
  { id: '4', userName: 'ploy.ch', text: 'กดสั่งเสื้อตัวสีดำไปแล้วค่า สกรีนชื่อ PLOY ให้ด้วยน้า' }
];

const GIFTS = [
  { id: 'rose', name: 'กุหลาบ', icon: '🌹', coins: 1 },
  { id: 'heart', name: 'หัวใจไฟ', icon: '💖', coins: 5 },
  { id: 'star', name: 'ดาวประกาย', icon: '⭐', coins: 10 },
  { id: 'crown', name: 'มงกุฎทอง', icon: '👑', coins: 99 }
];

const FILTERS = [
  { id: 'none', label: 'ธรรมชาติ', css: 'none' },
  { id: 'beauty', label: 'เนียนใส', css: 'brightness(1.08) contrast(1.02) saturate(1.05)' },
  { id: 'warm', label: 'วอร์มโกลว์', css: 'sepia(0.18) brightness(1.05) saturate(1.15)' },
  { id: 'vibrant', label: 'สดใสคมชัด', css: 'contrast(1.12) saturate(1.25)' },
  { id: 'mono', label: 'ขาวดำสตูดิโอ', css: 'grayscale(1) contrast(1.1)' }
];

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({
  onClose,
  onSelectProduct,
  onOpenDesignStudio,
  pinnedProduct,
  currentUser
}) => {
  // Current Live Host Information
  const hostName = currentUser?.name || 'Golden River City';
  const hostAvatar =
    currentUser?.avatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95';
  const isSuperadmin =
    currentUser?.email === 'goldenrivercity@gmail.com' ||
    currentUser?.email === 'goldenlivercity@gmail.com' ||
    currentUser?.role === 'superadmin';

  // Live camera states
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0);
  const [ringLightOn, setRingLightOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);

  // Social / Live states
  const [comments, setComments] = useState<LiveComment[]>(INITIAL_LIVE_COMMENTS);
  const [inputText, setInputText] = useState('');
  const [viewerCount, setViewerCount] = useState(1840);
  const [likesCount, setLikesCount] = useState(24300);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const [isPinnedProductMinimized, setIsPinnedProductMinimized] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize and switch Camera Feed
  const startCamera = async (mode: 'user' | 'environment') => {
    setIsSwitchingCamera(true);
    setCameraError(null);

    // Stop any existing stream tracks first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('เบราว์เซอร์นี้ไม่รองรับการเข้าถึงกล้อง');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
      setCameraActive(true);
      setCameraError(null);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'คุณไม่ได้อนุญาตการใช้กล้อง (กรุณากดอนุญาตในบราวเซอร์)'
          : 'ไม่พบอุปกรณ์กล้องหรือกำลังถูกใช้งานโดยแอปอื่น'
      );
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      // Clean up camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  const handleFlipCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    setToastMsg(nextMode === 'user' ? '📷 สลับเป็นกล้องหน้า' : '📷 สลับเป็นกล้องหลัง');
    setTimeout(() => setToastMsg(null), 1800);
  };

  const handleCycleFilter = () => {
    const nextIdx = (currentFilterIndex + 1) % FILTERS.length;
    setCurrentFilterIndex(nextIdx);
    setToastMsg(`✨ ฟิลเตอร์: ${FILTERS[nextIdx].label}`);
    setTimeout(() => setToastMsg(null), 1800);
  };

  // Auto increment viewers & likes slightly to feel live
  useEffect(() => {
    const timer = setInterval(() => {
      setViewerCount((v) => v + Math.floor(Math.random() * 5) - 2);
      setLikesCount((l) => l + Math.floor(Math.random() * 8));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Periodic incoming live comments
  useEffect(() => {
    const randomComments = [
      'ภาพจากกล้องคมชัดมากครับ!',
      'สลับกล้องหลังขอดูลายเสื้อชัดๆ หน่อยค่า',
      'งานสกรีนคมมากกกก',
      'ลดราคาเฉพาะในไลฟ์ใช่มั้ยคะ',
      'กระเป๋าผ้ารองรับน้ำหนักได้กี่โลครับ',
      'ปักหมุดลายเสื้อโอเวอร์ไซส์หน่อยค่า',
      'เคสมือถือกันกระแทกดีจริง ยืนยันอีกเสียง!'
    ];
    const randomUsers = ['Somchai', 'Fern_Official', 'Tee_Design', 'Noon_Studio', 'Boss_Creative'];

    const interval = setInterval(() => {
      const randomText = randomComments[Math.floor(Math.random() * randomComments.length)];
      const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
      const newComment: LiveComment = {
        id: String(Date.now()),
        userName: randomUser,
        text: randomText
      };
      setComments((prev) => [...prev.slice(-15), newComment]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment: LiveComment = {
      id: String(Date.now()),
      userName: hostName,
      text: inputText.trim(),
      badge: isSuperadmin ? '👑 Superadmin (โฮสต์)' : '👑 โฮสต์'
    };
    setComments((prev) => [...prev, newComment]);
    setInputText('');
  };

  const handleTapHeart = () => {
    setLikesCount((prev) => prev + 1);
    const newHeart = {
      id: Date.now(),
      left: Math.floor(Math.random() * 60) + 20
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1500);
  };

  const handleSendGift = (gift: typeof GIFTS[0]) => {
    setToastMsg(`คุณส่งของขวัญ ${gift.icon} ${gift.name} ให้กับผู้จัดไลฟ์แล้ว!`);
    setShowGiftModal(false);
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col max-w-md mx-auto select-none overflow-hidden animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-16 left-4 right-4 z-50 pointer-events-none flex justify-center animate-in fade-in slide-in-from-top-2">
          <div className="bg-white/95 text-slate-900 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-full shadow-xl backdrop-blur-md">
            {toastMsg}
          </div>
        </div>
      )}

      {/* Ring Light Screen Glow Effect */}
      {ringLightOn && (
        <div className="absolute inset-0 pointer-events-none z-20 border-[8px] border-amber-100/40 shadow-[inset_0_0_80px_rgba(255,255,255,0.4)] animate-pulse" />
      )}

      {/* Live Video / Real Web Camera Feed Layer */}
      <div
        className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden"
        onClick={handleTapHeart}
      >
        {/* Real Camera Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            filter: FILTERS[currentFilterIndex].css
          }}
          className={`w-full h-full object-cover transition-all duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Fallback Simulated Studio Video if Camera is blocked or unavailable */}
        {!cameraActive && (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-900">
            <video
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              poster="/src/assets/images/tshirt_mockup_1794023817755.jpg"
              loop
              autoPlay
              playsInline
              muted
              style={{ filter: FILTERS[currentFilterIndex].css }}
              className="w-full h-full object-cover opacity-80"
            />
            {cameraError && (
              <div className="absolute top-20 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center space-y-1.5 shadow-xl">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
                <p className="text-[10px] text-zinc-300">
                  กำลังใช้งานภาพจำลองสตูดิโอ หรือกดปุ่มด้านล่างเพื่อเปิดกล้องจริงของคุณ
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera(facingMode);
                  }}
                  className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-semibold inline-flex items-center gap-1 shadow-sm transition active:scale-95"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>ลองเปิดกล้องอีกครั้ง</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Camera Switching Indicator */}
        {isSwitchingCamera && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <SwitchCamera className="w-8 h-8 text-rose-500 animate-spin" />
              <span className="text-xs font-semibold text-white">กำลังสลับกล้อง...</span>
            </div>
          </div>
        )}

        {/* Ambient Dark Protection Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent via-50% to-black/80 pointer-events-none" />

        {/* Floating Hearts Container */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingHearts.map((heart) => (
            <div
              key={heart.id}
              style={{ left: `${heart.left}%`, bottom: '80px' }}
              className="absolute animate-in fade-in slide-out-to-top duration-1000 text-rose-500 drop-shadow-md"
            >
              <Heart className="w-8 h-8 fill-rose-500 text-rose-500 animate-ping" />
            </div>
          ))}
        </div>
      </div>

      {/* Top Header Overlay: Host Info & Live Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-2.5 pt-3 flex items-center justify-between pointer-events-auto">
        {/* Host Card - Displays Current User's Profile */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1 pr-2.5 rounded-full border border-white/20 shadow-lg">
          <div className="relative">
            <img
              src={hostAvatar}
              alt={hostName}
              className="w-8 h-8 rounded-full object-cover border-2 border-rose-500 shadow-xs"
            />
            {isSuperadmin && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-xs" title="Superadmin">
                <Crown className="w-2 h-2 fill-slate-900" />
              </div>
            )}
          </div>
          <div className="min-w-0 pr-1">
            <h4 className="text-[11px] font-bold text-white flex items-center gap-1 leading-none">
              <span className="truncate max-w-[90px]">{hostName}</span>
              <Radio className="w-2.5 h-2.5 text-rose-500 animate-pulse shrink-0" />
            </h4>
            <div className="flex items-center gap-1 text-[9px] text-zinc-300 mt-0.5">
              <Eye className="w-2.5 h-2.5 text-emerald-400" />
              <span className="tabular-nums">{viewerCount.toLocaleString()} คนดู</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white shadow-xs border border-rose-400/50 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>โฮสต์ LIVE</span>
          </span>
        </div>

        {/* Live Close Button */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/60 flex items-center justify-center border border-white/20 transition active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Comments Overlay (Roll-up) */}
      <div className="absolute left-3 bottom-26 right-16 z-20 max-h-48 overflow-y-auto no-scrollbar space-y-1.5 pointer-events-none">
        {comments.map((c) => (
          <div
            key={c.id}
            className="pointer-events-auto inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-md py-1 px-2.5 rounded-full border border-white/10 text-xs shadow-xs max-w-full"
          >
            {c.badge && (
              <span className="text-[9px] bg-rose-500/80 text-white font-bold px-1 rounded">
                {c.badge}
              </span>
            )}
            <span className="font-bold text-amber-300 text-[11px] shrink-0">
              {c.userName}:
            </span>
            <span className="text-white text-[11px] truncate">{c.text}</span>
          </div>
        ))}
        <div ref={commentsEndRef} />
      </div>

      {/* Compact Pinned Live Product Badge (ไม่บังคลิป/สินค้าในไลฟ์) */}
      <div className="absolute left-3 bottom-14 z-20 pointer-events-auto">
        {!isPinnedProductMinimized ? (
          <div
            onClick={() => onSelectProduct(pinnedProduct)}
            className="flex items-center gap-1.5 bg-white/95 hover:bg-white backdrop-blur-md pl-1 pr-1.5 py-1 rounded-full border border-slate-200/90 shadow-lg text-slate-900 cursor-pointer active:scale-95 transition max-w-[220px] group"
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              <img
                src={pinnedProduct.image}
                alt={pinnedProduct.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-slate-900 truncate max-w-[85px] leading-tight">
                {pinnedProduct.name}
              </div>
              <div className="text-[10px] font-extrabold text-rose-600 tabular-nums leading-none mt-0.5">
                ฿{pinnedProduct.price - 100 > 0 ? pinnedProduct.price - 100 : pinnedProduct.price}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(pinnedProduct);
              }}
              className="px-2 py-0.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-bold rounded-full shadow-2xs shrink-0 active:scale-90 transition hover:brightness-105"
            >
              สั่งซื้อ
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPinnedProductMinimized(true);
              }}
              title="ย่อขนาดป้ายสินค้า"
              className="w-4 h-4 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0 transition ml-0.5"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsPinnedProductMinimized(false)}
            title="แสดงป้ายสินค้าในไลฟ์"
            className="flex items-center gap-1.5 bg-white/95 hover:bg-white backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 shadow-md text-slate-900 active:scale-95 transition text-[10px] font-bold group"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="text-slate-800 font-medium">สินค้า</span>
            <span className="text-rose-600 font-extrabold tabular-nums">
              ฿{pinnedProduct.price - 100 > 0 ? pinnedProduct.price - 100 : pinnedProduct.price}
            </span>
          </button>
        )}
      </div>

      {/* Right Column: Live Camera Tools & Action Icons */}
      <div className="absolute right-2.5 top-16 z-30 flex flex-col items-center gap-2.5 pointer-events-auto">
        {/* Tool 1: Flip Camera (หน้า / หลัง) */}
        <button
          onClick={handleFlipCamera}
          title="สลับกล้องหน้า/กล้องหลัง"
          className="flex flex-col items-center group active:scale-90 transition"
        >
          <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md shadow-md border border-white/25 flex items-center justify-center text-white hover:bg-black/80 transition">
            <SwitchCamera className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-[9px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
            {facingMode === 'user' ? 'กล้องหน้า' : 'กล้องหลัง'}
          </span>
        </button>

        {/* Tool 2: Beauty & Studio Filter */}
        <button
          onClick={handleCycleFilter}
          title="เปลี่ยนฟิลเตอร์โทนสีกล้อง"
          className="flex flex-col items-center group active:scale-90 transition"
        >
          <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md shadow-md border border-white/25 flex items-center justify-center text-white hover:bg-black/80 transition">
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[9px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
            ฟิลเตอร์
          </span>
        </button>

        {/* Tool 3: Studio Ring Light */}
        <button
          onClick={() => {
            setRingLightOn(!ringLightOn);
            setToastMsg(!ringLightOn ? '💡 เปิดไฟสตูดิโอช่วยสว่าง' : 'ปิดไฟสตูดิโอ');
            setTimeout(() => setToastMsg(null), 1500);
          }}
          title="เปิด/ปิดไฟส่องสว่าง"
          className="flex flex-col items-center group active:scale-90 transition"
        >
          <div
            className={`w-9 h-9 rounded-full backdrop-blur-md shadow-md border flex items-center justify-center transition ${
              ringLightOn
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-black/60 text-white border-white/25 hover:bg-black/80'
            }`}
          >
            <Sun className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
            แสงไฟ
          </span>
        </button>

        {/* Tool 4: Mic indicator / toggle */}
        <button
          onClick={() => {
            setIsMicOn(!isMicOn);
            setToastMsg(!isMicOn ? '🎤 เปิดไมค์' : '🔇 ปิดไมค์');
            setTimeout(() => setToastMsg(null), 1500);
          }}
          title="เปิด/ปิดไมค์"
          className="flex flex-col items-center group active:scale-90 transition"
        >
          <div
            className={`w-9 h-9 rounded-full backdrop-blur-md shadow-md border flex items-center justify-center transition ${
              isMicOn
                ? 'bg-black/60 text-emerald-400 border-white/25'
                : 'bg-red-500/80 text-white border-red-400'
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </div>
          <span className="text-[9px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
            {isMicOn ? 'ไมค์' : 'ปิดเสียง'}
          </span>
        </button>

        <div className="w-6 h-[1px] bg-white/20 my-1" />

        {/* Heart / Like in Live */}
        <button
          onClick={handleTapHeart}
          className="flex flex-col items-center active:scale-90 transition group"
        >
          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-rose-500 hover:bg-white transition">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          </div>
          <span className="text-[9px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
            {(likesCount / 1000).toFixed(1)}k
          </span>
        </button>

        {/* Gift Button 🎁 */}
        <button
          onClick={() => setShowGiftModal(true)}
          className="flex flex-col items-center active:scale-90 transition group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 shadow-md flex items-center justify-center text-white hover:brightness-110 transition">
            <Gift className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
            ของขวัญ
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            setToastMsg('คัดลอกลิงก์ห้องไลฟ์สดแล้ว');
            setTimeout(() => setToastMsg(null), 2000);
          }}
          className="flex flex-col items-center active:scale-90 transition group"
        >
          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-white transition">
            <Share2 className="w-4 h-4 stroke-[2]" />
          </div>
          <span className="text-[9px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
            แชร์
          </span>
        </button>
      </div>

      {/* Bottom Live Bar: Chat Input & Shopping Basket */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-2.5 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center gap-2">
        {/* Shopping Basket Trigger */}
        <button
          onClick={() => onSelectProduct(pinnedProduct)}
          aria-label="ตะกร้าสินค้าในไลฟ์"
          className="relative w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shrink-0 active:scale-90 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-900 rounded-full text-[9px] font-bold flex items-center justify-center">
            1
          </span>
        </button>

        {/* Comment Form */}
        <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-1.5">
          <input
            type="text"
            placeholder="ส่งข้อความพูดคุยในไลฟ์..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-white/15 text-white placeholder:text-zinc-400 text-xs px-3.5 py-2 rounded-full border border-white/20 focus:outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-full bg-white text-slate-900 disabled:opacity-40 flex items-center justify-center shrink-0 active:scale-90 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Gift Selection Sheet */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-t-3xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">ส่งของขวัญในไลฟ์</span>
              <button
                onClick={() => setShowGiftModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5 py-4 text-center">
              {GIFTS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSendGift(g)}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition active:scale-95 group"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {g.icon}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-900">{g.name}</span>
                  <span className="text-[9px] text-amber-600 font-bold mt-0.5">
                    🪙 {g.coins} เหรียญ
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
