import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Music,
  ShoppingBag,
  Play,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Volume2,
  VolumeX
} from 'lucide-react';
import { VideoItem, ProductItem } from '../types';

interface HomeFeedViewProps {
  videos: VideoItem[];
  feedType: 'following' | 'foryou';
  onLikeVideo: (videoId: string) => void;
  onOpenComments: (video: VideoItem) => void;
  onOpenShare: (video: VideoItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenDesignStudioForProduct?: (productType: 'tshirt' | 'phonecase' | 'totebag') => void;
  initialVideoId?: string;
  onBackToProfile?: () => void;
}

const FALLBACK_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  videos,
  feedType,
  onLikeVideo,
  onOpenComments,
  onOpenShare,
  onSelectProduct,
  initialVideoId,
  onBackToProfile
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pausedMap, setPausedMap] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [heartBurstId, setHeartBurstId] = useState<string | null>(null);

  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const getVideoSrc = (url?: string) => {
    if (!url) return FALLBACK_VIDEO_URL;
    if (url.startsWith('blob:') || url.startsWith('data:') || url.includes('#')) {
      return url;
    }
    return `${url}#t=0.001`;
  };

  const getSafePoster = (vid: VideoItem) => {
    if (
      vid.posterUrl &&
      !vid.posterUrl.endsWith('.mp4') &&
      !vid.posterUrl.endsWith('.mov') &&
      !vid.posterUrl.endsWith('.webm') &&
      !vid.posterUrl.startsWith('data:video')
    ) {
      return vid.posterUrl;
    }
    return vid.linkedProduct?.image || '/src/assets/images/tshirt_mockup_1794023817755.jpg';
  };

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

  // Scroll immediately to requested video when navigating from Profile
  useEffect(() => {
    if (initialVideoId) {
      const idx = filteredVideos.findIndex((v) => v.id === initialVideoId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        requestAnimationFrame(() => {
          scrollToIndex(idx, 'auto');
        });
      }
    } else {
      setCurrentIndex(0);
      requestAnimationFrame(() => {
        scrollToIndex(0, 'auto');
      });
    }
  }, [initialVideoId, feedType]);

  // IntersectionObserver (threshold: 0.7) for true TikTok-style scroll-snap autoplay
  useEffect(() => {
    const rootEl = feedContainerRef.current;
    if (!rootEl || filteredVideos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardEl = entry.target as HTMLDivElement;
          const vidId = cardEl.dataset.videoId;
          const idxStr = cardEl.dataset.videoIndex;
          if (!vidId) return;
          const videoEl = videoRefs.current[vidId];
          if (!videoEl) return;

          if (entry.isIntersecting) {
            if (idxStr !== undefined) {
              setCurrentIndex(Number(idxStr));
            }
            videoEl.muted = isMuted;
            videoEl.playsInline = true;
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setPausedMap((prev) => ({ ...prev, [vidId]: false }));
                })
                .catch(() => {
                  // Browser blocked unmuted autoplay -> fallback to muted autoplay
                  videoEl.muted = true;
                  setIsMuted(true);
                  videoEl
                    .play()
                    .then(() => setPausedMap((prev) => ({ ...prev, [vidId]: false })))
                    .catch(() => setPausedMap((prev) => ({ ...prev, [vidId]: true })));
                });
            }
          } else {
            videoEl.pause();
          }
        });
      },
      {
        root: rootEl,
        threshold: 0.7
      }
    );

    Object.values(cardRefs.current).forEach((cardEl) => {
      if (cardEl) observer.observe(cardEl);
    });

    return () => {
      observer.disconnect();
    };
  }, [filteredVideos, isMuted]);

  // Sync mute state across active video element
  useEffect(() => {
    const activeVid = filteredVideos[currentIndex];
    if (!activeVid) return;
    const videoEl = videoRefs.current[activeVid.id];
    if (videoEl) {
      videoEl.muted = isMuted;
    }
  }, [isMuted, currentIndex, filteredVideos]);

  const togglePlayPause = (vidId: string) => {
    const videoEl = videoRefs.current[vidId];
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play().then(() => {
        setPausedMap((prev) => ({ ...prev, [vidId]: false }));
      }).catch(() => {});
    } else {
      videoEl.pause();
      setPausedMap((prev) => ({ ...prev, [vidId]: true }));
    }
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
    scrollToIndex(next, 'smooth');
  };

  const handlePrevVideo = () => {
    const prev = currentIndex > 0 ? currentIndex - 1 : filteredVideos.length - 1;
    scrollToIndex(prev, 'smooth');
  };

  // Keyboard navigation (Up/Down/Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextVideo();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevVideo();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const activeVid = filteredVideos[currentIndex];
        if (activeVid) togglePlayPause(activeVid.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredVideos]);

  if (filteredVideos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-xs bg-black">
        ไม่มีคลิปในหมวดนี้
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Floating Back to Profile button when viewed from profile */}
      {onBackToProfile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBackToProfile();
          }}
          className="absolute top-3 left-3 z-40 px-3 py-1.5 bg-black/70 hover:bg-black/90 active:scale-95 text-white text-xs font-bold rounded-full border border-white/25 backdrop-blur-md flex items-center gap-1 shadow-2xl transition"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>โปรไฟล์</span>
        </button>
      )}

      {/* Up/Down Quick Navigation Chevrons + Mute Toggle + Counter */}
      <div className="absolute top-16 right-3 flex flex-col items-center gap-1.5 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted((prev) => !prev);
          }}
          className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white shadow-md border border-white/20 flex items-center justify-center hover:bg-black/80 transition active:scale-90"
          title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevVideo();
          }}
          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center hover:bg-white transition active:scale-90"
          title="คลิปก่อนหน้า"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold shadow-xs">
          {currentIndex + 1}/{filteredVideos.length}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextVideo();
          }}
          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center hover:bg-white transition active:scale-90"
          title="คลิปถัดไป"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll-Snap Vertical Video Feed */}
      <div
        id="videoFeed"
        ref={feedContainerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {filteredVideos.map((vid, idx) => {
          const safePoster = getSafePoster(vid);
          const isPaused = Boolean(pausedMap[vid.id]);
          const isNearActive = Math.abs(idx - currentIndex) <= 1;

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
              {/* Video / Visual Layer */}
              <div
                className="w-full h-full relative cursor-pointer bg-black flex items-center justify-center"
                onClick={() => togglePlayPause(vid.id)}
                onDoubleClick={(e) => handleDoubleTap(e, vid)}
              >
                {/* Instant Poster Layer */}
                <img
                  src={safePoster}
                  alt={vid.caption || 'TokTak วิดีโอ'}
                  loading={isNearActive ? 'eager' : 'lazy'}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                <video
                  ref={(el) => {
                    videoRefs.current[vid.id] = el;
                  }}
                  src={getVideoSrc(vid.videoUrl)}
                  poster={safePoster}
                  loop
                  playsInline
                  autoPlay={idx === 0 || vid.id === initialVideoId}
                  muted={isMuted}
                  preload={isNearActive ? 'auto' : 'metadata'}
                  className="relative z-10 w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (!el.src.includes('ForBiggerBlazes.mp4')) {
                      el.src = FALLBACK_VIDEO_URL;
                      el.load();
                      el.muted = true;
                      el.play().catch(() => {});
                    }
                  }}
                />

                {/* Pause Indicator Overlay */}
                {isPaused && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-slate-800 shadow-lg border border-slate-200">
                      <Play className="w-8 h-8 fill-slate-800 ml-1" />
                    </div>
                  </div>
                )}

                {/* Double-tap Heart Burst Animation */}
                {heartBurstId === vid.id && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-ping duration-700">
                    <Heart className="w-24 h-24 fill-rose-500 text-rose-500 opacity-90 drop-shadow-md" />
                  </div>
                )}
              </div>

              {/* Right Side Action Column */}
              <div className="absolute right-2.5 bottom-18 z-20 flex flex-col items-center gap-3">
                {/* Creator Avatar with follow plus */}
                <div className="relative group">
                  <img
                    src={vid.creatorAvatar}
                    alt={vid.creatorName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                    +
                  </div>
                </div>

                {/* Heart / Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeVideo(vid.id);
                  }}
                  className="flex flex-col items-center group active:scale-90 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center transition hover:bg-white">
                    <Heart
                      className={`w-5 h-5 transition-transform ${
                        vid.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-800 stroke-[2]'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
                    {vid.likesCount.toLocaleString()}
                  </span>
                </button>

                {/* Comments Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenComments(vid);
                  }}
                  className="flex flex-col items-center group active:scale-90 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-800 hover:bg-white transition">
                    <MessageCircle className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
                    {vid.commentsCount.toLocaleString()}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenShare(vid);
                  }}
                  className="flex flex-col items-center group active:scale-90 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-800 hover:bg-white transition">
                    <Share2 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight mt-0.5 drop-shadow-md">
                    {vid.sharesCount.toLocaleString()}
                  </span>
                </button>

                {/* Spinning Vinyl Record */}
                <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white shadow-md p-1 flex items-center justify-center animate-spin [animation-duration:4s]">
                  <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* Bottom Left Area: Creator info, Caption, Sound, AND Compact Buy Button */}
              <div className="absolute left-3 bottom-16 right-16 z-20 space-y-2 pointer-events-none">
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
                    {vid.caption?.replace(/เสื้อยืดโอเวอร์ไซส์ สตรีทอาร์ต ลิมิเต็ด/g, '').replace(/^เสื้อยืด\s*/, '').trim() ||
                      vid.caption ||
                      'สินค้าคุณภาพดี ดีไซน์ทันสมัย'}
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
