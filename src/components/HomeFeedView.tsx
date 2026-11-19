import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Music,
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Volume2,
  VolumeX,
  Upload,
  Play,
  Bookmark
} from 'lucide-react';
import { VideoItem, ProductItem } from '../types';
import { BUNDLED_ASSET_MAP } from '../data/mockData';

const DEFAULT_FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
const EMERGENCY_FALLBACK_VIDEO =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const configureInlineVideo = (el: HTMLVideoElement, muted: boolean) => {
  el.defaultMuted = true;
  el.muted = muted;
  el.playsInline = true;
  el.setAttribute('playsinline', 'true');
  el.setAttribute('webkit-playsinline', 'true');
  el.setAttribute('x5-playsinline', 'true');
  el.setAttribute('x5-video-player-type', 'h5');
  el.setAttribute('x5-video-orientation', 'portraint');
};

const safePlayVideo = async (
  el: HTMLVideoElement | null,
  preferredMuted: boolean,
  onForceMute?: () => void
): Promise<boolean> => {
  if (!el) return false;
  configureInlineVideo(el, preferredMuted);
  try {
    await el.play();
    return true;
  } catch {
    if (!el.muted) {
      el.muted = true;
      onForceMute?.();
      try {
        await el.play();
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

interface HomeFeedViewProps {
  videos: VideoItem[];
  feedType: 'following' | 'foryou';
  onLikeVideo: (videoId: string) => void;
  onSaveVideo?: (videoId: string) => void;
  onOpenComments: (video: VideoItem) => void;
  onOpenShare: (video: VideoItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenDesignStudioForProduct?: (productType: 'tshirt' | 'phonecase' | 'totebag') => void;
  onReplaceVideoFile?: (videoId: string, file: File) => void;
  initialVideoId?: string;
  onBackToProfile?: () => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  videos,
  feedType,
  onLikeVideo,
  onSaveVideo,
  onOpenComments,
  onOpenShare,
  onSelectProduct,
  onReplaceVideoFile,
  initialVideoId,
  onBackToProfile
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [heartBurstId, setHeartBurstId] = useState<string | null>(null);
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});
  
  // เก็บสถานะวิดีโอที่ผู้ใช้อัปโหลดเลือกจากเครื่องเข้ามาเล่นเอง
  const [localVideoMap, setLocalVideoMap] = useState<Record<string, string>>({});

  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tapTimerRef = useRef<number | null>(null);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      if (initialVideoId && v.id === initialVideoId) {
        return true;
      }
      if (feedType === 'following') {
        return v.feedType === 'following' || v.id.startsWith('clip-');
      }
      return true;
    });
  }, [videos, feedType, initialVideoId]);

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const targetCard = cardRefs.current[index];
    if (targetCard) {
      targetCard.scrollIntoView({ behavior, block: 'start' });
    }
  };

  const appliedInitialVideoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!initialVideoId) {
      appliedInitialVideoRef.current = null;
      setCurrentIndex(0);
      requestAnimationFrame(() => {
        scrollToIndex(0, 'auto');
      });
    }
  }, [initialVideoId, feedType]);

  useEffect(() => {
    if (!initialVideoId) return;
    if (appliedInitialVideoRef.current === initialVideoId) return;
    const idx = filteredVideos.findIndex((v) => v.id === initialVideoId);
    if (idx !== -1) {
      appliedInitialVideoRef.current = initialVideoId;
      setCurrentIndex(idx);
      requestAnimationFrame(() => {
        scrollToIndex(idx, 'auto');
      });
    }
  }, [initialVideoId, filteredVideos]);

  useEffect(() => {
    const root = feedContainerRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idxAttr = entry.target.getAttribute('data-video-index');
            if (idxAttr !== null) {
              const parsedIdx = Number(idxAttr);
              if (!Number.isNaN(parsedIdx)) {
                setCurrentIndex(parsedIdx);
              }
            }
          }
        });
      },
      { root, threshold: 0.6 }
    );

    Object.values(cardRefs.current).forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [filteredVideos]);

  useEffect(() => {
    const activeVid = filteredVideos[currentIndex];
    filteredVideos.forEach((vid, idx) => {
      const el = videoRefs.current[vid.id];
      if (!el) return;
      configureInlineVideo(el, idx === currentIndex ? isMuted : true);
      if (idx === currentIndex && activeVid?.id === vid.id) {
        void safePlayVideo(el, isMuted, () => setIsMuted(true));
      } else {
        el.pause();
      }
    });
  }, [currentIndex, isMuted, filteredVideos]);

  // ปลดล็อกการเล่นอัตโนมัติบน iOS/LINE WebView เมื่อผู้ใช้แตะหน้าจอครั้งแรกหรือกลับเข้าหน้าเว็บ
  useEffect(() => {
    const resumeActiveVideo = () => {
      const activeVid = filteredVideos[currentIndex];
      if (!activeVid) return;
      const el = videoRefs.current[activeVid.id];
      if (el && el.paused) {
        void safePlayVideo(el, isMuted, () => setIsMuted(true));
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        resumeActiveVideo();
      }
    };

    window.addEventListener('touchstart', resumeActiveVideo, { once: true, passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('touchstart', resumeActiveVideo);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentIndex, isMuted, filteredVideos]);

  const togglePlayPause = (vidId: string) => {
    const el = videoRefs.current[vidId];
    if (!el) return;
    if (el.paused) {
      if (el.readyState === 0) {
        el.load();
      }
      void safePlayVideo(el, isMuted, () => setIsMuted(true));
    } else {
      el.pause();
    }
  };

  const handleVideoTap = (e: React.MouseEvent, vid: VideoItem) => {
    e.stopPropagation();
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
      handleDoubleTap(e, vid);
      return;
    }
    tapTimerRef.current = window.setTimeout(() => {
      tapTimerRef.current = null;
      togglePlayPause(vid.id);
    }, 220);
  };

  const handleDoubleTap = (e: React.MouseEvent, vid: VideoItem) => {
    e.stopPropagation();
    if (!vid.isLiked) {
      onLikeVideo(vid.id);
    }
    setHeartBurstId(vid.id);
    setTimeout(() => setHeartBurstId((prev) => (prev === vid.id ? null : prev)), 750);
  };

  const handleNextVideo = () => {
    const next = currentIndex < filteredVideos.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(next);
    scrollToIndex(next, 'smooth');
  };

  const handlePrevVideo = () => {
    const prev = currentIndex > 0 ? currentIndex - 1 : filteredVideos.length - 1;
    setCurrentIndex(prev);
    scrollToIndex(prev, 'smooth');
  };

  // ฟังก์ชันเลือกไฟล์วิดีโอจากเครื่องมือถือหรือคอมพิวเตอร์
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, videoId?: string) => {
    const file = e.target.files?.[0];
    if (file && videoId) {
      const blobUrl = URL.createObjectURL(file);
      setLocalVideoMap((prev) => ({ ...prev, [videoId]: blobUrl }));
      if (onReplaceVideoFile) {
        onReplaceVideoFile(videoId, file);
      }
    }
    e.target.value = '';
  };

  const handleVideoError = (vidId: string) => {
    const el = videoRefs.current[vidId];
    if (el && el.src && !el.src.includes('flower.mp4') && !el.src.startsWith('blob:')) {
      el.src = EMERGENCY_FALLBACK_VIDEO;
      el.load();
      void safePlayVideo(el, true, () => setIsMuted(true));
      return;
    }
    setPlayingMap((prev) => ({ ...prev, [vidId]: false }));
  };

  if (filteredVideos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-300 text-xs bg-black px-6 text-center gap-2">
        <Upload className="w-8 h-8 text-rose-500/80" />
        <p className="font-bold text-sm text-white">ยังไม่มีคลิปวิดีโอในฟีด</p>
        <p className="text-[11px] text-slate-400">กดปุ่ม + ด้านล่างเพื่ออัปโหลดคลิปแรกของคุณ</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {onBackToProfile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBackToProfile();
          }}
          className="absolute top-3 left-3 z-40 px-3 py-1.5 bg-black/75 hover:bg-black/90 active:scale-95 text-white text-xs font-bold rounded-full border border-white/25 backdrop-blur-md flex items-center gap-1 shadow-2xl transition"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>โปรไฟล์</span>
        </button>
      )}

      {/* แถวควบคุมด้านบนขวา (จัดแนวนอนแถวเดียวเพื่อไม่ให้ลงมาชนปุ่มโปรไฟล์และปุ่มถูกใจด้านขวา) */}
      <div className="absolute top-14 right-3 z-30 flex items-center gap-1.5">
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileSelected(e, filteredVideos[currentIndex]?.id)}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="px-2.5 py-1.5 bg-rose-600/95 hover:bg-rose-700 active:scale-95 text-white text-[11px] font-bold rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md transition"
          title="อัปโหลดวิดีโอจากเครื่องของคุณ"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>เลือกคลิป</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted((prev) => !prev);
          }}
          className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white shadow-md border border-white/25 flex items-center justify-center hover:bg-black/80 transition active:scale-90"
          title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="flex items-center bg-black/60 backdrop-blur-md rounded-full border border-white/25 shadow-md p-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevVideo();
            }}
            className="w-6 h-6 rounded-full text-white flex items-center justify-center hover:bg-white/15 transition active:scale-90"
            title="คลิปก่อนหน้า"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <span className="px-1.5 text-white text-[10px] font-bold tabular-nums">
            {currentIndex + 1}/{filteredVideos.length}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNextVideo();
            }}
            className="w-6 h-6 rounded-full text-white flex items-center justify-center hover:bg-white/15 transition active:scale-90"
            title="คลิปถัดไป"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        id="videoFeed"
        ref={feedContainerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {filteredVideos.map((vid, idx) => {
          const rawPoster =
            vid.posterUrl && !vid.posterUrl.endsWith('.mp4') && !vid.posterUrl.startsWith('data:video')
              ? BUNDLED_ASSET_MAP[vid.posterUrl] || vid.posterUrl
              : vid.linkedProduct?.image
              ? BUNDLED_ASSET_MAP[vid.linkedProduct.image] || vid.linkedProduct.image
              : DEFAULT_FALLBACK_POSTER;
          const posterImg = rawPoster || DEFAULT_FALLBACK_POSTER;
          const rawSource = localVideoMap[vid.id] || vid.videoUrl;
          const isHydratingIdb = Boolean(rawSource && rawSource.startsWith('idb://'));
          const activeVideoSource = isHydratingIdb
            ? undefined
            : rawSource && rawSource.trim() !== ''
            ? rawSource
            : undefined;
          const isActiveSlide = idx === currentIndex;
          const isPlaying = Boolean(playingMap[vid.id]);

          return (
            <div
              key={vid.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              data-video-id={vid.id}
              data-video-index={idx}
              className="relative w-full h-full snap-start snap-always shrink-0 bg-black flex items-center justify-center overflow-hidden"
            >
              <div
                className="w-full h-full relative bg-black flex items-center justify-center"
                onClick={(e) => handleVideoTap(e, vid)}
              >
                {/* ภาพปกสำรองด้านหลัง ป้องกันอาการจอสีดำขณะโหลดหรือรอกดเล่นบนมือถือ */}
                <img
                  src={posterImg}
                  alt={vid.caption || 'ภาพปกวิดีโอ'}
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_FALLBACK_POSTER) {
                      e.currentTarget.src = DEFAULT_FALLBACK_POSTER;
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                />

                {/* ตัวเล่นวิดีโอเต็มจอ 100% รองรับทั้ง Auto-play และแตะเพื่อเล่น/หยุดบน iOS และ Android */}
                <video
                  key={`${vid.id}-${activeVideoSource || 'hydrating'}`}
                  ref={(el) => {
                    videoRefs.current[vid.id] = el;
                    if (el) {
                      configureInlineVideo(el, isMuted || !isActiveSlide);
                    }
                  }}
                  src={activeVideoSource}
                  poster={posterImg}
                  autoPlay={isActiveSlide}
                  playsInline
                  muted={isMuted || !isActiveSlide}
                  loop
                  preload="auto"
                  onLoadedData={(e) => {
                    if (isActiveSlide && e.currentTarget.paused) {
                      void safePlayVideo(e.currentTarget, isMuted, () => setIsMuted(true));
                    }
                  }}
                  onCanPlay={(e) => {
                    if (isActiveSlide && e.currentTarget.paused) {
                      void safePlayVideo(e.currentTarget, isMuted, () => setIsMuted(true));
                    }
                  }}
                  onPlaying={() => setPlayingMap((prev) => ({ ...prev, [vid.id]: true }))}
                  onPlay={() => setPlayingMap((prev) => ({ ...prev, [vid.id]: true }))}
                  onPause={() => setPlayingMap((prev) => ({ ...prev, [vid.id]: false }))}
                  onEnded={() => setPlayingMap((prev) => ({ ...prev, [vid.id]: false }))}
                  onError={() => handleVideoError(vid.id)}
                  className="absolute inset-0 w-full h-full object-cover z-10 cursor-pointer"
                />

                {!isPlaying && (
                  <button
                    type="button"
                    aria-label="เล่นวิดีโอ"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayPause(vid.id);
                    }}
                    className="relative z-20 w-16 h-16 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl active:scale-90 transition"
                  >
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </button>
                )}

                {heartBurstId === vid.id && (
                  <div className="absolute inset-0 z-35 flex items-center justify-center pointer-events-none animate-ping duration-700">
                    <Heart className="w-24 h-24 fill-rose-500 text-rose-500 opacity-90 drop-shadow-md" />
                  </div>
                )}
              </div>

              {/* Bottom Gradient Scrim for TikTok-style text legibility */}
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none z-20" />

              {/* Right Side Action Column (TikTok Style - เรียงแนวตั้งเป็นระเบียบ เว้นระยะขอบขวาและขอบล่างสวยงาม) */}
              <div className="absolute right-3 bottom-5 z-30 flex flex-col items-center gap-4">
                <div className="relative group mb-2 shrink-0">
                  <img
                    src={vid.creatorAvatar}
                    alt={vid.creatorName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md border border-white">
                    +
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeVideo(vid.id);
                  }}
                  className="flex flex-col items-center group active:scale-90 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md shadow-md border border-white/20 flex items-center justify-center transition hover:bg-black/65">
                    <Heart
                      className={`w-5 h-5 transition-transform ${
                        vid.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white stroke-[2.2]'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight mt-0.5 drop-shadow-[0_1.2px_2px_rgba(0,0,0,0.9)]">
                    {vid.likesCount.toLocaleString()}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenComments(vid);
                  }}
                  className="flex flex-col items-center group active:scale-90 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md shadow-md border border-white/20 flex items-center justify-center text-white hover:bg-black/65 transition">
                    <MessageCircle className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight mt-0.5 drop-shadow-[0_1.2px_2px_rgba(0,0,0,0.9)]">
                    {vid.commentsCount.toLocaleString()}
                  </span>
                </button>

                {onSaveVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveVideo(vid.id);
                    }}
                    className="flex flex-col items-center group active:scale-90 transition"
                    title="บันทึกคลิปโปรด"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md shadow-md border border-white/20 flex items-center justify-center transition hover:bg-black/65">
                      <Bookmark
                        className={`w-5 h-5 transition-transform ${
                          vid.isSaved ? 'fill-amber-400 text-amber-400 scale-110' : 'text-white stroke-[2.2]'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white tracking-tight mt-0.5 drop-shadow-[0_1.2px_2px_rgba(0,0,0,0.9)]">
                      {vid.isSaved ? 'บันทึกแล้ว' : 'บันทึก'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenShare(vid);
                  }}
                  className="flex flex-col items-center group active:scale-90 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md shadow-md border border-white/20 flex items-center justify-center text-white hover:bg-black/65 transition">
                    <Share2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight mt-0.5 drop-shadow-[0_1.2px_2px_rgba(0,0,0,0.9)]">
                    {vid.sharesCount.toLocaleString()}
                  </span>
                </button>

                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-900 via-zinc-700 to-zinc-900 border border-white/25 shadow-lg p-1.5 flex items-center justify-center animate-spin [animation-duration:4s]">
                  <img
                    src={vid.creatorAvatar}
                    alt={vid.creatorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Bottom Left Area */}
              <div className="absolute left-3.5 bottom-5 right-20 z-30 space-y-2 pointer-events-none">
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <span className="text-sm font-bold text-white tracking-tight drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                    {vid.creatorName || vid.creatorHandle}
                  </span>
                  <span className="text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-2 py-0.5 rounded shadow-sm">
                    ร้านค้าแนะนำ
                  </span>
                </div>

                <div className="text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                  <p className="text-xs sm:text-sm font-medium line-clamp-2 max-w-[280px]">
                    {vid.caption || 'สินค้าคุณภาพดี ดีไซน์ทันสมัย'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-[11px] font-medium">
                  <Music className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{vid.musicTitle}</span>
                </div>

                {vid.linkedProduct && (
                  <div className="pt-0.5 pointer-events-auto inline-block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (vid.linkedProduct) {
                          onSelectProduct(vid.linkedProduct);
                        }
                      }}
                      title={`สั่งซื้อ ${vid.linkedProduct.name}`}
                      className="bg-white hover:bg-gray-50 border border-gray-200/90 shadow-md px-2.5 py-1 rounded-full flex items-center space-x-1.5 active:scale-95 transition group"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-2xs shrink-0">
                        <ShoppingBag className="w-3 h-3 fill-white" />
                      </div>
                      <span className="text-xs font-bold text-black tracking-tight group-hover:text-orange-600 transition-colors">
                        สั่งซื้อ
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};