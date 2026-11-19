import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  Play,
  Pause,
  Trash2,
  Sparkles,
  Film,
  Music,
  Smile,
  Sliders,
  Volume2,
  VolumeX,
  Hash,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  ShoppingBag,
  Zap,
  RotateCcw,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { ProductType, ProductItem, UserProfile } from '../types';
import { BUNDLED_ASSET_MAP } from '../data/mockData';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  products?: ProductItem[];
  onUploadClip: (clipData: {
    caption: string;
    music: string;
    videoUrl: string;
    videoFile?: File | null;
    posterUrl?: string;
    linkedProduct?: ProductItem;
    linkedProductType?: ProductType;
    authorEmail?: string;
    ownerEmail?: string;
    creatorEmail?: string;
  }) => void;
  onSellProduct?: (productData: {
    name: string;
    price: number;
    productType: ProductType;
    description: string;
    imageUrl?: string;
  }) => void;
  onPostService?: (serviceData: {
    title: string;
    category: any;
    startingPrice: number;
    description: string;
  }) => void;
  onGoLive?: () => void;
}

// Curated Ready-to-use TokTak Creator Video Clips (1080p high quality)
const SAMPLE_GALLERY_VIDEOS = [
  {
    id: 'sample-streetwear',
    name: 'สตรีทแวร์แฟชั่นคัสตอม',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: BUNDLED_ASSET_MAP['/src/assets/images/tshirt_mockup_1794023817755.jpg'],
    defaultCaption: 'คอลเลกชันใหม่ สไตล์สตรีท ลิมิเต็ดอิดิชัน 🔥 สั่งทำพิเศษได้เลย!',
    music: 'ethereal! (Sped Up) - TikTok Sound',
    type: 'tshirt' as ProductType
  },
  {
    id: 'sample-techcase',
    name: 'รีวิวเคสมือถือกันกระแทก',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    poster: BUNDLED_ASSET_MAP['/src/assets/images/phonecase_mockup_1794023818273.jpg'],
    defaultCaption: 'ทดสอบความทนทาน ลายคลื่นไซเคเดลิก 📱 สีคมชัดไม่ลอก!',
    music: 'Bangkok City Neon Vibes',
    type: 'phonecase' as ProductType
  },
  {
    id: 'sample-totebag',
    name: 'กระเป๋าผ้าแคนวาส มินิมอล',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    poster: BUNDLED_ASSET_MAP['/src/assets/images/totebag_mockup_1794023818674.jpg'],
    defaultCaption: 'กระเป๋าผ้าแคนวาสจุของได้เยอะ แมตช์ง่ายกับทุกลุค 👜',
    music: 'Lo-Fi Sunset Café Chill',
    type: 'totebag' as ProductType
  },
  {
    id: 'sample-artisan',
    name: 'เบื้องหลังงานผลิตสตูดิโอ',
    url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    poster: BUNDLED_ASSET_MAP['/src/assets/images/creator_avatar_1794023819826.jpg'],
    defaultCaption: 'เบื้องหลังการพิมพ์ลายคัสตอม ใส่ใจทุกชิ้นงาน ✨ #TokTak',
    music: 'Acoustic Morning Beat',
    type: 'tshirt' as ProductType
  }
];

// Music Playlist
const MUSIC_TRACKS = [
  '🎵 ethereal! (Sped Up) - TikTok Sound',
  '🎵 TokTak Viral Beat (128 BPM)',
  '🎵 Lo-Fi Sunset Café Chill',
  '🎵 Bangkok City Neon Vibes',
  '🎵 Acoustic Morning Beat'
];

// Video Filters
const VIDEO_FILTERS = [
  { id: 'normal', name: 'ปกติ', css: 'none' },
  { id: 'vibrant', name: 'สดใส', css: 'contrast(1.15) saturate(1.4)' },
  { id: 'vintage', name: 'วินเทจ', css: 'sepia(0.35) contrast(1.1) brightness(1.05)' },
  { id: 'cyber', name: 'ไซเบอร์', css: 'hue-rotate(290deg) saturate(1.5) contrast(1.15)' },
  { id: 'mono', name: 'ขาวดำ', css: 'grayscale(1) contrast(1.2)' }
];

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  products = [],
  onUploadClip,
  onGoLive
}) => {
  // Screens: 'studio' (Main Video Creator matching user HTML) | 'publish' (Publish & Basket Screen)
  const [activeScreen, setActiveScreen] = useState<'studio' | 'publish'>('studio');

  // Video Media States
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [hasLoadedMedia, setHasLoadedMedia] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

  // Video Editor States
  const [selectedDuration, setSelectedDuration] = useState<'10m' | '60s' | '15s' | 'photo'>('15s');
  const [selectedMusic, setSelectedMusic] = useState<string>('🎵 ethereal! (Sped Up) - TikTok Sound');
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1);
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [overlayText, setOverlayText] = useState<string>('ของดีบอกต่อ! ✨');
  const [activeStickers, setActiveStickers] = useState<string[]>(['🔥 HOT']);

  // Floating Overlay Panels
  const [showMusicPicker, setShowMusicPicker] = useState<boolean>(false);
  const [showSpeedPicker, setShowSpeedPicker] = useState<boolean>(false);
  const [showFilterPicker, setShowFilterPicker] = useState<boolean>(false);
  const [showTextPicker, setShowTextPicker] = useState<boolean>(false);
  const [showTemplatesPicker, setShowTemplatesPicker] = useState<boolean>(false);

  // Bottom Mode Tab
  const [bottomMode, setBottomMode] = useState<'camera' | 'templates' | 'live'>('camera');

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(0);

  // Publish Screen States
  const [caption, setCaption] = useState<string>('รีวิวของดีใน TokTak สั่งได้ในคลิปเลย! 🔥');
  const [pinnedProduct, setPinnedProduct] = useState<ProductItem | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);

  // References
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const recordIntervalRef = useRef<number | null>(null);

  // Check draft on open
  useEffect(() => {
    if (isOpen) {
      try {
        const savedDraft = localStorage.getItem('toktak_video_draft');
        if (savedDraft) {
          setHasDraft(true);
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  // Clean camera stream on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setActiveScreen('studio');
      setHasLoadedMedia(false);
      setVideoSrc('');
      setSelectedFile(null);
    }
  }, [isOpen]);

  // Adjust playback rate when speed changes
  useEffect(() => {
    if (videoPreviewRef.current) {
      videoPreviewRef.current.playbackRate = selectedSpeed;
    }
  }, [selectedSpeed, videoSrc]);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecording(false);
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
  };

  // Open real camera or fallback to interactive studio camera
  const handleOpenCamera = async () => {
    stopCamera();
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing },
          audio: true
        });
        cameraStreamRef.current = stream;
        setIsCameraActive(true);
        setHasLoadedMedia(true);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play().catch(() => {});
        }
        showToast('📷 เปิดระบบกล้องถ่ายสดเรียบร้อย');
      } else {
        fallbackToStudioCamera();
      }
    } catch {
      fallbackToStudioCamera();
    }
  };

  const fallbackToStudioCamera = () => {
    setIsCameraActive(true);
    setHasLoadedMedia(true);
    // Use first high-res sample video in camera mode
    const defaultSample = SAMPLE_GALLERY_VIDEOS[0];
    setVideoSrc(defaultSample.url);
    setPosterUrl(defaultSample.poster);
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
      videoPreviewRef.current.src = defaultSample.url;
      videoPreviewRef.current.play().catch(() => {});
    }
    showToast('📷 เปิดกล้องถ่ายสด TokTak Studio เรียบร้อย');
  };

  // Flip Camera
  const handleFlipCamera = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      setTimeout(() => handleOpenCamera(), 100);
    } else {
      showToast('สลับกล้องหน้า/หลัง');
    }
  };

  // Handle User File Selection (Video / Image)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      setSelectedFile(file);
      const blobUrl = URL.createObjectURL(file);
      setVideoSrc(blobUrl);
      setHasLoadedMedia(true);
      extractThumbnailFromVideo(blobUrl);
      setCaption(file.name.replace(/\.[^/.]+$/, ''));
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
        videoPreviewRef.current.src = blobUrl;
        videoPreviewRef.current.play().catch(() => {});
      }
      showToast('📁 โหลดวิดีโอจากแกลเลอรีสำเร็จ');
    }
    e.target.value = '';
  };

  // Extract thumbnail snapshot using offscreen canvas (compressed for safe localStorage persistence)
  const extractThumbnailFromVideo = (videoUrl: string) => {
    try {
      const v = document.createElement('video');
      v.crossOrigin = 'anonymous';
      v.muted = true;
      v.playsInline = true;
      v.src = videoUrl;
      v.currentTime = 0.1;
      v.onloadeddata = () => {
        try {
          const maxW = 360;
          const rawW = v.videoWidth || 360;
          const rawH = v.videoHeight || 640;
          const scale = Math.min(1, maxW / rawW);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(rawW * scale));
          canvas.height = Math.max(1, Math.round(rawH * scale));
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL('image/jpeg', 0.72);
            setPosterUrl(thumb);
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }
  };

  // Select Sample Template
  const handleSelectTemplate = (sample: typeof SAMPLE_GALLERY_VIDEOS[0]) => {
    stopCamera();
    setSelectedFile(null);
    setVideoSrc(sample.url);
    setPosterUrl(sample.poster);
    setHasLoadedMedia(true);
    setCaption(sample.defaultCaption);
    setSelectedMusic(`🎵 ${sample.music}`);
    setShowTemplatesPicker(false);
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
      videoPreviewRef.current.src = sample.url;
      videoPreviewRef.current.play().catch(() => {});
    }
    showToast(`✨ โหลดเทมเพลต "${sample.name}" สำเร็จ`);
  };

  // Shutter Button Action (Record / Stop)
  const handleShutterClick = () => {
    if (!hasLoadedMedia) {
      handleOpenCamera();
      return;
    }

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
      showToast('บันทึกคลิปเสร็จสมบูรณ์! กด "ถัดไป ➔" เพื่อปักตะกร้า');
    } else {
      // Start recording
      setIsRecording(true);
      setRecordedSeconds(0);
      recordIntervalRef.current = window.setInterval(() => {
        setRecordedSeconds((prev) => prev + 1);
      }, 1000);
      showToast('🔴 กำลังบันทึกวิดีโอ...');
    }
  };

  // Go to Publish Screen
  const handleGoToPublish = () => {
    if (!hasLoadedMedia) {
      // Auto-load default template if user clicks next directly
      const defaultSample = SAMPLE_GALLERY_VIDEOS[0];
      setVideoSrc(defaultSample.url);
      setPosterUrl(defaultSample.poster);
      setHasLoadedMedia(true);
    }
    stopCamera();
    setActiveScreen('publish');
  };

  // Add Hashtag
  const handleAddHashtag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  // Save as Draft
  const handleSaveDraft = () => {
    try {
      const draftData = {
        videoSrc: videoSrc || SAMPLE_GALLERY_VIDEOS[0].url,
        posterUrl: posterUrl || SAMPLE_GALLERY_VIDEOS[0].poster,
        caption,
        music: selectedMusic,
        speed: selectedSpeed,
        filter: selectedFilter,
        stickers: activeStickers,
        overlayText,
        pinnedProductId: pinnedProduct?.id || null,
        timestamp: Date.now()
      };
      localStorage.setItem('toktak_video_draft', JSON.stringify(draftData));
      setHasDraft(true);
      showToast('💾 บันทึกวิดีโอเป็นฉบับร่าง (Draft) เรียบร้อยแล้ว!');
    } catch {
      showToast('บันทึกฉบับร่างสำเร็จ');
    }
  };

  // Restore Draft
  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem('toktak_video_draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.videoSrc) {
          setVideoSrc(parsed.videoSrc);
          setHasLoadedMedia(true);
          if (videoPreviewRef.current) {
            videoPreviewRef.current.src = parsed.videoSrc;
            videoPreviewRef.current.play().catch(() => {});
          }
        }
        if (parsed.posterUrl) setPosterUrl(parsed.posterUrl);
        if (parsed.caption) setCaption(parsed.caption);
        if (parsed.music) setSelectedMusic(parsed.music);
        if (parsed.filter) setSelectedFilter(parsed.filter);
        if (parsed.stickers) setActiveStickers(parsed.stickers);
        if (parsed.overlayText) setOverlayText(parsed.overlayText);
        if (parsed.pinnedProductId) {
          const matchProd = products.find((p) => p.id === parsed.pinnedProductId);
          if (matchProd) setPinnedProduct(matchProd);
        }
        showToast('📂 กู้คืนฉบับร่างเรียบร้อยแล้ว');
      }
    } catch {
      // ignore
    }
  };

  // Final Publish Clip
  const handleFinalPost = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalVideoUrl = videoSrc || SAMPLE_GALLERY_VIDEOS[0].url;
    const finalPoster =
      posterUrl && !posterUrl.endsWith('.mp4')
        ? posterUrl
        : pinnedProduct?.image || SAMPLE_GALLERY_VIDEOS[0].poster;

    const userEmail = currentUser?.email || 'goldenrivercity@gmail.com';

    onUploadClip({
      caption: caption.trim() || 'คลิปใหม่สร้างสรรค์จาก TokTak 🔥 #TokTak',
      music: selectedMusic,
      videoUrl: finalVideoUrl,
      videoFile: selectedFile,
      posterUrl: finalPoster,
      linkedProduct: pinnedProduct || undefined,
      linkedProductType: pinnedProduct ? pinnedProduct.productType : undefined,
      authorEmail: userEmail,
      ownerEmail: userEmail,
      creatorEmail: userEmail
    });

    // Clean drafts
    try {
      localStorage.removeItem('toktak_video_draft');
      setHasDraft(false);
    } catch {
      // ignore
    }

    showToast('🚀 เผยแพร่คลิปวิดีโอของคุณสู่ TokTak สำเร็จ!');
    setTimeout(() => {
      onClose();
      setActiveScreen('studio');
      setHasLoadedMedia(false);
      setVideoSrc('');
      setSelectedFile(null);
    }, 1200);
  };

  if (!isOpen) return null;

  const currentFilterCss = VIDEO_FILTERS.find((f) => f.id === selectedFilter)?.css || 'none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastNotice && (
        <div className="absolute top-4 inset-x-6 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/95 border border-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="video/*,image/*,.mp4,.mov,.webm"
        onChange={handleFileSelect}
      />

      {/* Main Container matching user reference structure: max-w-md bg-black text-white rounded-3xl h-[850px] */}
      <div className="w-full max-w-md mx-auto bg-black text-white sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative h-full sm:h-[850px] max-h-[100vh] sm:max-h-[92vh] flex flex-col justify-between">
        {/* ========================================================================= */}
        {/* VIEW 1: STUDIO SCREEN (Camera Record & Editor matching user structure)    */}
        {/* ========================================================================= */}
        {activeScreen === 'studio' && (
          <>
            {/* ส่วนบน: หน้าจอพรีวิววิดีโอหลัก + เครื่องมือลอยด้านขวา (สไตล์ TikTok) */}
            <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
              {/* จำลองวิดีโอหลักที่กำลังถ่ายหรือเลือกมา */}
              <video
                id="toktakPreview"
                ref={videoPreviewRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                src={videoSrc}
                style={{
                  filter: currentFilterCss,
                  transform: isCameraActive && cameraFacing === 'user' ? 'scaleX(-1)' : 'none'
                }}
              />

              {/* ข้อความแนะนำหากยังไม่ได้เลือกไฟล์ */}
              {!hasLoadedMedia && (
                <div
                  id="uploadPlaceholder"
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center z-10"
                >
                  <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mb-3 shadow-lg animate-pulse">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold mb-1">สร้างวิดีโอ TokTak ของคุณ</p>
                  <p className="text-xs text-slate-400 mb-4">
                    ถ่ายสดจากกล้อง หรือเลือกไฟล์จากแกลเลอรีทันที
                  </p>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleOpenCamera}
                      className="bg-pink-600 hover:bg-pink-700 text-xs px-4 py-2.5 rounded-xl font-medium transition shadow-md active:scale-95 cursor-pointer"
                    >
                      เปิดกล้องถ่ายสด
                    </button>
                    <label
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-xs px-4 py-2.5 rounded-xl font-medium transition border border-slate-700 shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <span>📁 เลือกจากแกลเลอรี</span>
                    </label>
                  </div>

                  {/* Quick Draft Resume Button */}
                  {hasDraft && (
                    <button
                      type="button"
                      onClick={handleRestoreDraft}
                      className="mt-4 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition"
                    >
                      <Clock className="w-3 h-3" />
                      <span>กู้คืนฉบับร่างที่บันทึกไว้</span>
                    </button>
                  )}
                </div>
              )}

              {/* Close Button at top left */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 left-4 z-30 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center transition border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Overlaid Custom Text */}
              {hasLoadedMedia && overlayText && (
                <div className="absolute top-24 inset-x-4 flex justify-center z-20 pointer-events-none">
                  <div className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-xs font-black text-xs text-white text-center shadow-lg border border-white/20 animate-bounce [animation-duration:3s]">
                    {overlayText}
                  </div>
                </div>
              )}

              {/* Overlaid Stickers */}
              {hasLoadedMedia && activeStickers.length > 0 && (
                <div className="absolute bottom-6 inset-x-3 flex flex-wrap gap-1.5 justify-center z-20 pointer-events-none">
                  {activeStickers.map((stk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-pink-600/90 text-white font-black text-[10px] shadow-lg border border-white/30 backdrop-blur-xs"
                    >
                      {stk}
                    </span>
                  ))}
                </div>
              )}

              {/* แถบเครื่องมือลอยด้านขวา (ทับบนวิดีโอแบบ TikTok ของแท้) */}
              <div className="absolute right-3 top-16 flex flex-col items-center space-y-4 z-20">
                {/* 1. สลับกล้อง */}
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="bg-black/40 backdrop-blur-md p-2.5 rounded-full hover:bg-black/60 text-white transition active:scale-90 border border-white/10"
                  title="สลับกล้อง"
                >
                  🔄
                </button>

                {/* 2. ปรับความเร็ว */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSpeedPicker((prev) => !prev);
                    setShowFilterPicker(false);
                    setShowTextPicker(false);
                    setShowMusicPicker(false);
                  }}
                  className={`bg-black/40 backdrop-blur-md p-2.5 rounded-full hover:bg-black/60 text-white transition active:scale-90 border border-white/10 ${
                    selectedSpeed !== 1 ? 'ring-2 ring-pink-500 bg-pink-600/40' : ''
                  }`}
                  title="ความเร็ว"
                >
                  ⚡
                </button>

                {/* 3. เลือกฟิลเตอร์สี */}
                <button
                  type="button"
                  onClick={() => {
                    setShowFilterPicker((prev) => !prev);
                    setShowSpeedPicker(false);
                    setShowTextPicker(false);
                    setShowMusicPicker(false);
                  }}
                  className={`bg-black/40 backdrop-blur-md p-2.5 rounded-full hover:bg-black/60 text-white transition active:scale-90 border border-white/10 ${
                    selectedFilter !== 'normal' ? 'ring-2 ring-pink-500 bg-pink-600/40' : ''
                  }`}
                  title="ฟิลเตอร์"
                >
                  ✨
                </button>

                {/* 4. เพิ่มข้อความ/สติกเกอร์ */}
                <button
                  type="button"
                  onClick={() => {
                    setShowTextPicker((prev) => !prev);
                    setShowSpeedPicker(false);
                    setShowFilterPicker(false);
                    setShowMusicPicker(false);
                  }}
                  className={`bg-black/40 backdrop-blur-md p-2.5 rounded-full hover:bg-black/60 text-white transition active:scale-90 border border-white/10 ${
                    overlayText || activeStickers.length > 0
                      ? 'ring-2 ring-pink-500 bg-pink-600/40'
                      : ''
                  }`}
                  title="ข้อความ"
                >
                  Aa
                </button>
              </div>

              {/* Speed Popover Sheet */}
              {showSpeedPicker && (
                <div className="absolute right-14 top-28 bg-black/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700 flex flex-col gap-1 z-30 animate-in fade-in duration-150">
                  {[0.5, 1, 2, 3].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => {
                        setSelectedSpeed(speed);
                        setShowSpeedPicker(false);
                        showToast(`ปรับความเร็วเป็น ${speed}x`);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        selectedSpeed === speed ? 'bg-pink-600 text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}

              {/* Filter Popover Sheet */}
              {showFilterPicker && (
                <div className="absolute right-14 top-40 bg-black/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700 flex flex-col gap-1 z-30 animate-in fade-in duration-150">
                  {VIDEO_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(f.id);
                        setShowFilterPicker(false);
                        showToast(`ฟิลเตอร์: ${f.name}`);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold text-left transition ${
                        selectedFilter === f.id ? 'bg-pink-600 text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Text & Sticker Popover Sheet */}
              {showTextPicker && (
                <div className="absolute inset-x-4 top-24 bg-black/85 backdrop-blur-md p-3 rounded-2xl border border-slate-700 space-y-2 z-30 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>ใส่ข้อความ & สติกเกอร์บนคลิป</span>
                    <button
                      type="button"
                      onClick={() => setShowTextPicker(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="พิมพ์ข้อความบนคลิป..."
                    className="w-full bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 outline-none focus:border-pink-500"
                  />
                  {/* Sticker chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['🔥 HOT', '⚡ FLASH SALE', '🛒 ปักตะกร้า', '✨ NEW', '🏷️ ลด 50%', '💯 ของแท้'].map(
                      (stk) => {
                        const isSelected = activeStickers.includes(stk);
                        return (
                          <button
                            key={stk}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setActiveStickers((prev) => prev.filter((s) => s !== stk));
                              } else {
                                setActiveStickers((prev) => [...prev, stk]);
                              }
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                              isSelected
                                ? 'bg-pink-600 border-pink-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            {stk} {isSelected && '✓'}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Music Playlist Popover Sheet */}
              {showMusicPicker && (
                <div className="absolute inset-x-4 top-20 bg-black/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700 space-y-1.5 z-30 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 pb-1 border-b border-slate-800">
                    <span>เลือกเพลงประกอบ (TikTok Sound Library)</span>
                    <button
                      type="button"
                      onClick={() => setShowMusicPicker(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1 pt-1">
                    {MUSIC_TRACKS.map((track) => (
                      <button
                        key={track}
                        type="button"
                        onClick={() => {
                          setSelectedMusic(track);
                          setShowMusicPicker(false);
                          showToast(`เลือกเพลง: ${track}`);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          selectedMusic === track
                            ? 'bg-pink-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                      >
                        {track}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Templates Popover Sheet */}
              {showTemplatesPicker && (
                <div className="absolute inset-x-4 bottom-24 bg-black/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700 space-y-2 z-30 animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>เทมเพลตวิดีโอคุณภาพ HD พร้อมใช้:</span>
                    <button
                      type="button"
                      onClick={() => setShowTemplatesPicker(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_GALLERY_VIDEOS.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectTemplate(sample)}
                        className="group relative aspect-[9/10] rounded-xl overflow-hidden border border-slate-700 hover:border-pink-500 cursor-pointer shadow-md bg-slate-900"
                      >
                        <img
                          src={sample.poster}
                          alt={sample.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2">
                          <span className="text-[11px] font-bold text-white line-clamp-1">{sample.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* แถบเลือกความยาววิดีโอด้านบน */}
              <div className="absolute top-4 inset-x-0 flex justify-center space-x-5 text-xs font-semibold z-20">
                <span
                  onClick={() => setSelectedDuration('10m')}
                  className={`cursor-pointer transition drop-shadow ${
                    selectedDuration === '10m'
                      ? 'text-pink-400 border-b-2 border-pink-500 pb-0.5'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  10 นาที
                </span>
                <span
                  onClick={() => setSelectedDuration('60s')}
                  className={`cursor-pointer transition drop-shadow ${
                    selectedDuration === '60s'
                      ? 'text-pink-400 border-b-2 border-pink-500 pb-0.5'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  60 วินาที
                </span>
                <span
                  onClick={() => setSelectedDuration('15s')}
                  className={`cursor-pointer transition drop-shadow ${
                    selectedDuration === '15s'
                      ? 'text-pink-400 border-b-2 border-pink-500 pb-0.5'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  15 วินาที
                </span>
                <span
                  onClick={() => setSelectedDuration('photo')}
                  className={`cursor-pointer transition drop-shadow ${
                    selectedDuration === 'photo'
                      ? 'text-pink-400 border-b-2 border-pink-500 pb-0.5'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ภาพถ่าย
                </span>
              </div>

              {/* แถบเพลงประกอบด้านบนสุดใต้เวลา */}
              <div className="absolute top-12 inset-x-4 flex justify-center z-20">
                <button
                  type="button"
                  onClick={() => setShowMusicPicker((prev) => !prev)}
                  className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-slate-200 flex items-center space-x-1 border border-white/10 hover:bg-black/70 transition cursor-pointer"
                >
                  <span>{selectedMusic}</span>
                </button>
              </div>

              {/* Live recording timer indicator */}
              {isRecording && (
                <div className="absolute top-20 left-4 z-20 flex items-center gap-1.5 bg-red-600/90 text-white px-2 py-0.5 rounded-full text-[10px] font-mono animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>
                    REC {String(Math.floor(recordedSeconds / 60)).padStart(2, '0')}:
                    {String(recordedSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* ส่วนล่าง: ปุ่มกดชัตเตอร์ / ปุ่มถัดไปเพื่อใส่ตะกร้าสินค้า */}
            <div className="p-5 bg-black/90 backdrop-blur-md border-t border-slate-800 flex flex-col space-y-4 z-30">
              {/* แถบเลือกโหมด (กล้อง / สร้างสรรค์ / ไลฟ์) */}
              <div className="flex justify-around text-xs font-medium text-slate-400">
                <span
                  onClick={() => {
                    setBottomMode('camera');
                    handleOpenCamera();
                  }}
                  className={`cursor-pointer pb-1 transition ${
                    bottomMode === 'camera'
                      ? 'text-white font-bold border-b-2 border-white'
                      : 'hover:text-white'
                  }`}
                >
                  กล้อง
                </span>
                <span
                  onClick={() => {
                    setBottomMode('templates');
                    setShowTemplatesPicker((prev) => !prev);
                  }}
                  className={`cursor-pointer pb-1 transition ${
                    bottomMode === 'templates' || showTemplatesPicker
                      ? 'text-white font-bold border-b-2 border-white'
                      : 'hover:text-white'
                  }`}
                >
                  สร้างสรรค์ (Templates)
                </span>
                <span
                  onClick={() => {
                    setBottomMode('live');
                    if (onGoLive) {
                      onClose();
                      onGoLive();
                    } else {
                      showToast('เปิดระบบ TokTak LIVE');
                    }
                  }}
                  className="hover:text-white cursor-pointer"
                >
                  LIVE
                </span>
              </div>

              {/* ปุ่มชัตเตอร์และแกลเลอรีพรีวิวซ้ายล่าง */}
              <div className="flex items-center justify-between px-6">
                {/* พรีวิวไฟล์ล่าสุดมุมซ้ายล่าง */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center hover:border-slate-500 transition active:scale-95 cursor-pointer relative"
                  title="เลือกจากแกลเลอรี"
                >
                  {posterUrl ? (
                    <img src={posterUrl} alt="Recent" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500">📁</span>
                  )}
                </button>

                {/* ปุ่มชัตเตอร์วงกลมใหญ่ตรงกลาง */}
                <button
                  type="button"
                  onClick={handleShutterClick}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 focus:scale-95 transition cursor-pointer shadow-lg active:scale-90"
                  title="กดบันทึกวิดีโอ / ถ่ายภาพ"
                >
                  <div
                    className={`transition-all duration-200 ${
                      isRecording ? 'w-6 h-6 bg-red-600 rounded-md animate-pulse' : 'w-12 h-12 bg-rose-500 rounded-full'
                    }`}
                  />
                </button>

                {/* ปุ่ม "ถัดไป" สำหรับไปหน้าใส่แคปชัน/ปักตะกร้าสินค้า */}
                <button
                  type="button"
                  onClick={handleGoToPublish}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg hover:opacity-90 transition active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <span>ถัดไป</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PUBLISH SCREEN (Caption, Hashtags, Pin Product Basket, Draft/Post) */}
        {/* ========================================================================= */}
        {activeScreen === 'publish' && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar bg-slate-950 p-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setActiveScreen('studio')}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>กลับไปแต่งคลิป</span>
              </button>
              <h3 className="text-xs font-bold text-white">เผยแพร่วิดีโอ TokTak</h3>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFinalPost} className="my-auto space-y-4 py-2">
              {/* Video Preview Card + Caption Area */}
              <div className="flex gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3">
                {/* 9:16 Mini Thumbnail */}
                <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-700 shadow-md">
                  <img
                    src={posterUrl || SAMPLE_GALLERY_VIDEOS[0].poster}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                    style={{ filter: currentFilterCss }}
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white text-white drop-shadow-md" />
                  </div>
                  <div className="absolute bottom-1 inset-x-1 bg-black/60 rounded px-1 text-[8px] text-white truncate text-center">
                    {selectedMusic.split(' ')[1] || 'Music'}
                  </div>
                </div>

                {/* Caption Input */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      คำบรรยายคลิป (Caption)
                    </label>
                    <textarea
                      rows={3}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="เขียนแคปชันให้น่าสนใจ... เล่าเรื่องราวหรือปักตะกร้าสินค้าในคลิปนี้"
                      className="w-full bg-slate-950 text-white text-xs p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-pink-500 resize-none"
                    />
                  </div>
                  <div className="text-right text-[10px] text-slate-500">
                    {caption.length} / 250 ตัวอักษร
                  </div>
                </div>
              </div>

              {/* Hashtag Quick Chips */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-pink-400" />
                  <span>แตะเพื่อใส่แฮชแท็ก (#):</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '#TokTak',
                    '#รีวิวสินค้า',
                    '#ปักตะกร้า',
                    '#แฟชั่น',
                    '#คัสตอม',
                    '#สินค้าขายดี',
                    '#TikTokMadeMeBuyIt'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddHashtag(tag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-medium text-slate-300 hover:text-white transition active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pin Product / TokTak Basket Selection */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>ระบบเลือกปักหมุดสินค้า / ตะกร้าสินค้า</span>
                  </div>
                  {pinnedProduct && (
                    <button
                      type="button"
                      onClick={() => setPinnedProduct(null)}
                      className="text-[10px] text-pink-400 hover:underline"
                    >
                      ยกเลิกปักหมุด
                    </button>
                  )}
                </div>

                {/* Selected Pinned Product Card */}
                {pinnedProduct ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <img
                      src={pinnedProduct.image}
                      alt={pinnedProduct.name}
                      className="w-10 h-10 rounded-lg object-cover bg-black shrink-0 border border-amber-500/40"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-sm inline-block">
                        🛒 ปักตะกร้าในคลิปแล้ว
                      </span>
                      <h4 className="text-xs font-bold text-white truncate mt-0.5">{pinnedProduct.name}</h4>
                      <span className="text-[11px] font-black text-amber-400 tabular-nums">฿{pinnedProduct.price}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    เลือกสินค้าด้านล่างเพื่อแสดงปุ่ม "สั่งซื้อ" ในคลิปของคุณ:
                  </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1 max-h-36 overflow-y-auto no-scrollbar">
                  {/* Option: No Product */}
                  <button
                    type="button"
                    onClick={() => setPinnedProduct(null)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                      pinnedProduct === null
                        ? 'bg-slate-800 border-slate-600 text-white font-bold'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      ✕
                    </div>
                    <span className="text-[11px] leading-tight">ไม่ปักหมุดสินค้า (วิดีโอทั่วไป)</span>
                  </button>

                  {/* Available Products */}
                  {products.map((prod) => {
                    const isSelected = pinnedProduct?.id === prod.id;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => setPinnedProduct(prod)}
                        className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-8 h-8 rounded-lg object-cover bg-black shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-semibold truncate block">{prod.name}</span>
                          <span className="text-[9px] text-amber-400 font-bold block">฿{prod.price}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Draft & Post */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>บันทึกเป็นร่าง (Draft)</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:brightness-105 active:scale-95 text-white text-xs font-black rounded-xl shadow-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>โพสต์ (Post)</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
