/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, ProductType, VideoItem, ProductItem, ServiceItem, CartItem, UserProfile, AdminOrder } from './types';
import { INITIAL_VIDEOS, INITIAL_PRODUCTS, INITIAL_SERVICES, INITIAL_CART, INITIAL_ADMIN_ORDERS } from './data/mockData';
import { TopBar } from './components/TopBar';
import { BottomTabBar } from './components/BottomTabBar';
import { HomeFeedView } from './components/HomeFeedView';
import { ShopView } from './components/ShopView';
import { ServicesView } from './components/ServicesView';
import { ProfileView } from './components/ProfileView';
import { DesignStudioView } from './components/DesignStudioView';
import { LiveStreamView } from './components/LiveStreamView';
import { CreateModal } from './components/CreateModal';
import { CommentModal } from './components/CommentModal';
import { ShareModal } from './components/ShareModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminBackendModal } from './components/AdminBackendModal';
import { TokTakCreatorShopModal } from './components/TokTakCreatorShopModal';
import { Crown } from 'lucide-react';

// Per-user profile storage keys (indexed by Gmail)
const PROFILES_STORAGE_KEY = 'toktak_profiles_by_email';
const ACTIVE_EMAIL_KEY = 'toktak_active_user_email';

// Pre-defined base profiles with distinct avatars and info for quick testing & roles
const DEFAULT_ACCOUNT_SEEDS: Record<string, Partial<UserProfile>> = {
  'goldenrivercity@gmail.com': {
    name: 'Golden River City',
    handle: '@goldenrivercity',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95',
    bio: '👑 Superadmin ผู้ดูแลระบบสูงสุด (จัดการหลังบ้านและสินค้า)',
    role: 'superadmin',
    followersCount: 1420,
    followingCount: 88,
    likesCount: 15400
  },
  'admin@tokdesign.com': {
    name: 'Admin TokDesign',
    handle: '@tokdesign_admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=95',
    bio: '🛡️ ผู้ดูแลร้านค้า TokDesign ประจำสาขากรุงเทพฯ',
    role: 'admin',
    followersCount: 680,
    followingCount: 42,
    likesCount: 4200
  },
  'customer@gmail.com': {
    name: 'สมชาย ใจดี',
    handle: '@somchai_bkk',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=95',
    bio: 'ผู้ใช้งานทั่วไป 🎨 ชื่นชอบสตรีทแวร์และงานดีไซน์ตามสั่ง',
    role: 'user',
    followersCount: 95,
    followingCount: 210,
    likesCount: 890
  }
};

const getStoredProfileForEmail = (email: string, name?: string): UserProfile => {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        const existingKey = Object.keys(parsed).find(
          (k) => k.trim().toLowerCase() === normalizedEmail
        );
        if (existingKey && parsed[existingKey]) {
          return { ...parsed[existingKey], email: normalizedEmail };
        }
      }
    }
  } catch (e) {
    console.warn(e);
  }

  // If not stored yet, initialize with seed or derived info
  const seed = DEFAULT_ACCOUNT_SEEDS[normalizedEmail] || {};
  const isSuper = normalizedEmail === 'goldenrivercity@gmail.com';
  const isAdmin = normalizedEmail.startsWith('admin') || normalizedEmail.includes('admin@');
  const role: 'superadmin' | 'admin' | 'creator' | 'user' = isSuper ? 'superadmin' : isAdmin ? 'admin' : (seed.role || 'user');

  const derivedName =
    name?.trim() ||
    seed.name ||
    (normalizedEmail === 'goldenrivercity@gmail.com'
      ? 'Golden River City'
      : normalizedEmail.split('@')[0].replace(/[._]/g, ' '));
  const derivedHandle =
    seed.handle || `@${normalizedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
  const derivedAvatar =
    seed.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=95';

  const newProfile: UserProfile = {
    id: `usr-${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
    email: normalizedEmail,
    name: derivedName,
    handle: derivedHandle,
    avatar: derivedAvatar,
    bio: seed.bio || 'ผู้ใช้งาน TokTak อย่างเป็นทางการ 🎨 ยินดีต้อนรับสู่โปรไฟล์ของฉัน',
    joinedDate: 'พ.ย. 2026',
    followersCount: seed.followersCount || 100,
    followingCount: seed.followingCount || 25,
    likesCount: seed.likesCount || 350,
    isGoogleVerified: true,
    role
  };

  saveStoredProfileForEmail(normalizedEmail, newProfile);
  return newProfile;
};

const saveStoredProfileForEmail = (email: string, profile: UserProfile) => {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[normalizedEmail] = { ...profile, email: normalizedEmail };
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(parsed));
    localStorage.setItem(ACTIVE_EMAIL_KEY, normalizedEmail);
    localStorage.setItem('tokdesign_current_user', JSON.stringify({ ...profile, email: normalizedEmail }));
  } catch (e) {
    console.warn(e);
  }
};

export default function App() {
  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [showDesignStudio, setShowDesignStudio] = useState<boolean>(false);
  const [showLiveStream, setShowLiveStream] = useState<boolean>(false);
  const [designStudioTemplate, setDesignStudioTemplate] = useState<ProductType>('tshirt');
  const [feedType, setFeedType] = useState<'following' | 'foryou' | 'live'>('foryou');

  // Authenticated User State (strictly keyed per Gmail in localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const activeEmail = localStorage.getItem(ACTIVE_EMAIL_KEY) || 'goldenrivercity@gmail.com';
      return getStoredProfileForEmail(activeEmail);
    } catch {
      return getStoredProfileForEmail('goldenrivercity@gmail.com');
    }
  });

  // High-reliability fallback video for broken/corrupt media files
  const FALLBACK_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  // App Data States (with validation and automatic cleanup for corrupted localStorage data)
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('tokdesign_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 1. Validation: Filter out corrupt objects (null, non-object, missing id)
          const validClips = parsed.filter((v: any) => (
            v &&
            typeof v === 'object' &&
            typeof v.id === 'string' &&
            v.id.trim().length > 0
          ));

          let hasCleanedCorruptData = validClips.length !== parsed.length;

          // 2. Sanitize and repair video URLs, poster images, and author metadata
          const sanitizedClips: VideoItem[] = validClips.map((v: VideoItem) => {
            let cleanVideoUrl = v.videoUrl;
            // Check if videoUrl is missing, empty, or an expired session blob URL
            if (!cleanVideoUrl || typeof cleanVideoUrl !== 'string' || cleanVideoUrl.trim() === '' || cleanVideoUrl.startsWith('blob:')) {
              cleanVideoUrl = FALLBACK_VIDEO_URL;
              hasCleanedCorruptData = true;
            }

            // Fix any invalid posterUrl (e.g. mp4, mov, webm, blob, or identical to videoUrl)
            let cleanPoster = v.posterUrl;
            const isInvalidPoster =
              !cleanPoster ||
              typeof cleanPoster !== 'string' ||
              cleanPoster.endsWith('.mp4') ||
              cleanPoster.endsWith('.mov') ||
              cleanPoster.endsWith('.webm') ||
              cleanPoster.startsWith('blob:') ||
              cleanPoster.startsWith('data:video') ||
              cleanPoster === cleanVideoUrl;

            if (isInvalidPoster) {
              cleanPoster =
                v.linkedProduct?.image ||
                (v.linkedProduct?.productType === 'phonecase'
                  ? '/src/assets/images/phonecase_mockup_1794023818273.jpg'
                  : v.linkedProduct?.productType === 'totebag'
                  ? '/src/assets/images/totebag_mockup_1794023818674.jpg'
                  : '/src/assets/images/tshirt_mockup_1794023817755.jpg');
              hasCleanedCorruptData = true;
            }

            const creatorEmail = (
              v.creatorEmail ||
              v.ownerEmail ||
              v.authorEmail ||
              (v.creatorHandle === '@goldenrivercity' || v.id === 'vid-1' || v.id.startsWith('clip-')
                ? 'goldenrivercity@gmail.com'
                : v.id === 'vid-2'
                ? 'waveform@toktak.com'
                : 'artisan@toktak.com')
            ).toLowerCase();

            const ownerEmail = (v.ownerEmail || creatorEmail).toLowerCase();
            const authorEmail = (v.authorEmail || creatorEmail).toLowerCase();
            const likedByEmails = Array.isArray(v.likedByEmails)
              ? v.likedByEmails
              : (v.isLiked ? ['goldenrivercity@gmail.com'] : []);

            return {
              ...v,
              videoUrl: cleanVideoUrl,
              posterUrl: cleanPoster,
              creatorEmail,
              ownerEmail,
              authorEmail,
              likedByEmails
            };
          });

          // 3. Auto-cleanup: If corrupted entries were filtered out or repaired, write clean data back
          if (hasCleanedCorruptData) {
            try {
              localStorage.setItem('tokdesign_videos', JSON.stringify(sanitizedClips));
            } catch {
              // ignore
            }
          }

          if (sanitizedClips.length > 0) {
            return sanitizedClips;
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage data corruption detected; resetting to pristine initial videos', e);
      try {
        localStorage.setItem('tokdesign_videos', JSON.stringify(INITIAL_VIDEOS));
      } catch {
        // ignore
      }
    }
    return INITIAL_VIDEOS;
  });
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ADMIN_ORDERS);

  // Sync videos to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('tokdesign_videos', JSON.stringify(videos));
    } catch (e) {
      console.error(e);
    }
  }, [videos]);

  // Modal & Focus States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminBackendOpen, setIsAdminBackendOpen] = useState(false);
  const [isTokTakShopOpen, setIsTokTakShopOpen] = useState(false);
  const [commentVideo, setCommentVideo] = useState<VideoItem | null>(null);
  const [shareVideo, setShareVideo] = useState<VideoItem | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [focusedVideoId, setFocusedVideoId] = useState<string | null>(null);

  // Global Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const isAuthorizedAdmin = Boolean(
    currentUser &&
      (currentUser.email === 'goldenrivercity@gmail.com' ||
        currentUser.role === 'superadmin' ||
        currentUser.role === 'admin')
  );

  // Video Actions
  const handleLikeVideo = (videoId: string) => {
    const currentEmail = currentUser?.email?.toLowerCase() || 'goldenrivercity@gmail.com';
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const list = v.likedByEmails || (v.isLiked ? ['goldenrivercity@gmail.com'] : []);
          const isCurrentlyLiked = list.some((e) => e.toLowerCase() === currentEmail);
          const nextLiked = !isCurrentlyLiked;
          const updatedLikes = nextLiked
            ? [...new Set([...list, currentEmail])]
            : list.filter((e) => e.toLowerCase() !== currentEmail);

          return {
            ...v,
            isLiked: nextLiked,
            likedByEmails: updatedLikes,
            likesCount: nextLiked ? v.likesCount + 1 : Math.max(0, v.likesCount - 1)
          };
        }
        return v;
      })
    );
  };

  const handleToggleVideoPrivacy = (videoId: string) => {
    setVideos((prev) => {
      const updated = prev.map((v) => {
        if (v.id === videoId) {
          const nextPrivate = !v.isPrivate;
          return {
            ...v,
            isPrivate: nextPrivate,
            isDraft: nextPrivate ? v.isDraft : false
          };
        }
        return v;
      });
      try {
        localStorage.setItem('tokdesign_videos', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
    showToast('🔒 อัปเดตสถานะความเป็นส่วนตัวของคลิปเรียบร้อยแล้ว');
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos((prev) => {
      const updated = prev.filter((v) => v.id !== videoId);
      try {
        localStorage.setItem('tokdesign_videos', JSON.stringify(updated));
        if (currentUser?.email) {
          const userClipsKey = `toktak_clips_${currentUser.email.toLowerCase()}`;
          const existingRaw = localStorage.getItem(userClipsKey);
          if (existingRaw) {
            const list = JSON.parse(existingRaw);
            const filtered = list.filter((v: VideoItem) => v.id !== videoId);
            localStorage.setItem(userClipsKey, JSON.stringify(filtered));
          }
        }
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
    showToast('🗑️ ลบคลิปวิดีโอเรียบร้อยแล้ว');
  };

  // Cart Actions
  const handleAddToCart = (product: ProductItem) => {
    const existingIndex = cart.findIndex((item) => item.productName === product.name);
    if (existingIndex > -1) {
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productName: product.name,
        productType: product.productType,
        price: product.price,
        quantity: 1,
        color: product.colors?.[0] || '#0f172a',
        previewImage: product.image,
        timestamp: Date.now()
      };
      setCart((prev) => [newItem, ...prev]);
    }
    showToast(`🛒 เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
  };

  const handleAddCustomToCart = (item: CartItem) => {
    setCart((prev) => [item, ...prev]);
    showToast(`✨ เพิ่มผลงานออกแบบ "${item.productName}" ลงตะกร้าแล้ว`);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast('ลบสินค้าออกจากตะกร้าแล้ว');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Google Authentication & Switch Account Handlers (strictly per-email isolated profile & clips)
  const handleLoginWithGoogle = (email?: string, name?: string) => {
    const chosenEmail = (email || 'goldenrivercity@gmail.com').trim().toLowerCase();
    const profile = getStoredProfileForEmail(chosenEmail, name);
    saveStoredProfileForEmail(chosenEmail, profile);
    setCurrentUser(profile);
    setFocusedVideoId(null);
    setVideos((prev) =>
      prev.map((v) => {
        const likedList = v.likedByEmails || [];
        return {
          ...v,
          isLiked: likedList.some((e) => e.toLowerCase() === chosenEmail)
        };
      })
    );
    showToast(`🎉 สลับเป็นบัญชี ${profile.name} (${profile.email}) เรียบร้อย`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setFocusedVideoId(null);
    try {
      localStorage.removeItem(ACTIVE_EMAIL_KEY);
      localStorage.removeItem('tokdesign_current_user');
    } catch {
      // storage unavailable
    }
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updated };
    const normalizedEmail = currentUser.email.trim().toLowerCase();
    setCurrentUser(updatedUser);
    saveStoredProfileForEmail(normalizedEmail, updatedUser);
    // Sync updated profile metadata (avatar, name, handle) across owned videos immediately
    setVideos((prev) =>
      prev.map((v) => {
        const owner = (v.authorEmail || v.ownerEmail || v.creatorEmail || '').trim().toLowerCase();
        if (owner === normalizedEmail) {
          return {
            ...v,
            creatorName: updatedUser.name,
            creatorHandle: updatedUser.handle,
            creatorAvatar: updatedUser.avatar
          };
        }
        return v;
      })
    );
    showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
  };

  // Modal Handlers
  const handleUploadClip = (data: {
    caption: string;
    music: string;
    videoUrl: string;
    posterUrl?: string;
    linkedProduct?: ProductItem;
    linkedProductType?: ProductType;
    authorEmail?: string;
    ownerEmail?: string;
    creatorEmail?: string;
  }) => {
    // Only link product if explicitly provided, do not force default tshirt
    const linked = data.linkedProduct
      ? data.linkedProduct
      : data.linkedProductType
      ? products.find((p) => p.productType === data.linkedProductType)
      : undefined;

    const defaultPoster =
      linked?.image ||
      (data.linkedProductType === 'phonecase'
        ? '/src/assets/images/phonecase_mockup_1794023818273.jpg'
        : data.linkedProductType === 'totebag'
        ? '/src/assets/images/totebag_mockup_1794023818674.jpg'
        : '/src/assets/images/tshirt_mockup_1794023817755.jpg');

    const cleanPoster =
      data.posterUrl &&
      !data.posterUrl.endsWith('.mp4') &&
      !data.posterUrl.endsWith('.mov') &&
      !data.posterUrl.endsWith('.webm') &&
      !data.posterUrl.startsWith('data:video')
        ? data.posterUrl
        : defaultPoster;

    const activeUserEmail = (data.authorEmail || data.ownerEmail || data.creatorEmail || currentUser?.email || 'goldenrivercity@gmail.com').toLowerCase();
    const newClipId = `clip-${Date.now()}`;
    const newVideo: VideoItem = {
      id: newClipId,
      videoUrl: data.videoUrl,
      posterUrl: cleanPoster,
      creatorName: currentUser ? currentUser.name : 'คุณ (ผู้ใช้)',
      creatorHandle: currentUser ? currentUser.handle : `@${activeUserEmail.split('@')[0]}`,
      creatorAvatar: currentUser
        ? currentUser.avatar
        : '/src/assets/images/creator_avatar_1794023819826.jpg',
      creatorEmail: activeUserEmail,
      ownerEmail: activeUserEmail,
      authorEmail: activeUserEmail,
      caption: data.caption,
      musicTitle: data.music,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      likedByEmails: [activeUserEmail],
      feedType: 'foryou',
      linkedProduct: linked
    };

    setVideos((prev) => {
      const updated = [newVideo, ...prev];
      try {
        // 1. Global videos list
        localStorage.setItem('tokdesign_videos', JSON.stringify(updated));

        // 2. Safe isolated storage per-account keyed by Gmail
        const userClipsKey = `toktak_clips_${activeUserEmail}`;
        const existingRaw = localStorage.getItem(userClipsKey);
        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
        const updatedUserList = [newVideo, ...existingList.filter((v: VideoItem) => v.id !== newClipId)];
        localStorage.setItem(userClipsKey, JSON.stringify(updatedUserList));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
    setFocusedVideoId(newClipId);
    setCurrentTab('home');
    setFeedType('foryou');
    showToast('🎉 โพสต์คลิปใหม่ของคุณขึ้นฟีดเรียบร้อยแล้ว');
  };

  const handleSellProduct = (data: {
    name: string;
    price: number;
    productType: ProductType;
    description: string;
    imageUrl?: string;
  }) => {
    const defaultImage =
      data.productType === 'phonecase'
        ? '/src/assets/images/phonecase_mockup_1794023818273.jpg'
        : data.productType === 'totebag'
        ? '/src/assets/images/totebag_mockup_1794023818674.jpg'
        : '/src/assets/images/tshirt_mockup_1794023817755.jpg';

    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      name: data.name,
      price: data.price,
      image: data.imageUrl || defaultImage,
      productType: data.productType,
      creatorName: 'คุณ (ผู้ใช้)',
      creatorAvatar: '/src/assets/images/creator_avatar_1794023819826.jpg',
      salesCount: 0,
      rating: 5.0,
      isCustomizable: true,
      description: data.description
    };
    setProducts((prev) => [newProd, ...prev]);
    setCurrentTab('shop');
    showToast('🛍️ ลงขายสินค้าเข้าสู่หน้าร้านค้าเรียบร้อยแล้ว');
  };

  const handlePostService = (data: {
    title: string;
    category: any;
    startingPrice: number;
    description: string;
  }) => {
    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      title: data.title,
      category: data.category,
      categoryLabel:
        data.category === 'graphic'
          ? 'ออกแบบกราฟิก'
          : data.category === 'video'
          ? 'ถ่ายรูป/วิดีโอ'
          : data.category === 'screen'
          ? 'งานสกรีน/ผลิต'
          : 'วาดภาพประกอบ',
      creatorName: 'คุณ (ผู้ใช้)',
      creatorHandle: '@artisan.bkk',
      creatorAvatar: '/src/assets/images/creator_avatar_1794023819826.jpg',
      rating: 5.0,
      reviewCount: 1,
      startingPrice: data.startingPrice,
      turnaroundDays: 2,
      description: data.description,
      tags: ['CustomWork', 'DirectOrder'],
      coverImage: '/src/assets/images/tshirt_mockup_1794023817755.jpg'
    };
    setServices([newService, ...services]);
    setCurrentTab('services');
    showToast('💼 ลงประกาศงานบริการในตลาดฟรีแลนซ์เรียบร้อย');
  };

  const openDesignStudioWithTemplate = (template: ProductType = 'tshirt') => {
    setDesignStudioTemplate(template);
    setShowDesignStudio(true);
  };

  return (
    <div className="min-h-screen bg-slate-200/70 flex justify-center items-center font-sans antialiased p-0 sm:py-6">
      {/* Mobile-First Frame */}
      <main className="w-full max-w-md h-screen max-h-[100dvh] sm:h-[844px] sm:max-h-[844px] sm:rounded-3xl bg-white text-slate-900 relative flex flex-col overflow-hidden shadow-2xl border border-slate-300/80">
        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="absolute top-14 left-4 right-4 z-50 pointer-events-none flex justify-center animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-slate-900/95 text-white border border-slate-700 text-xs font-semibold px-4 py-2 rounded-full shadow-xl backdrop-blur-md">
              {toastMessage}
            </div>
          </div>
        )}

        {/* 1. Top Bar (Displayed on Home Tab) with LIVE menu & cleanly aligned actions */}
        {currentTab === 'home' && !showDesignStudio && !showLiveStream && !focusedVideoId && (
          <TopBar
            feedType={feedType}
            onFeedTypeChange={setFeedType}
            onOpenLive={() => setShowLiveStream(true)}
            onOpenDesignStudio={() => openDesignStudioWithTemplate('tshirt')}
            onOpenSearch={() => setCurrentTab('shop')}
            isSuperadmin={isAuthorizedAdmin}
            onOpenAdminBackend={isAuthorizedAdmin ? () => setIsAdminBackendOpen(true) : undefined}
          />
        )}

        {/* Floating Admin Quick Button: Strictly visible to Superadmin and Admin only */}
        {isAuthorizedAdmin &&
          (currentTab === 'shop' || currentTab === 'services') &&
          !showDesignStudio &&
          !showLiveStream && (
            <button
              onClick={() => setIsAdminBackendOpen(true)}
              title="เปิดระบบจัดการหลังบ้าน (Admin Console)"
              className="fixed sm:absolute bottom-18 right-3.5 z-40 px-3 py-1.5 bg-slate-900/95 hover:bg-slate-800 text-amber-300 border border-amber-400/60 rounded-full text-[11px] font-bold shadow-xl backdrop-blur-md flex items-center gap-1.5 active:scale-90 transition group animate-in fade-in"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:rotate-12 transition-transform" />
              <span>หลังบ้าน</span>
            </button>
          )}

        {/* Main Content Area based on currentTab */}
        <div
          className={`flex-1 relative ${
            currentTab === 'home'
              ? 'w-full h-full overflow-hidden bg-black'
              : 'overflow-y-auto overscroll-y-contain bg-slate-50'
          }`}
          style={currentTab === 'home' ? undefined : { WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {currentTab === 'home' && (
            <HomeFeedView
              videos={videos}
              feedType={feedType === 'live' ? 'foryou' : feedType}
              onLikeVideo={handleLikeVideo}
              onOpenComments={(video) => setCommentVideo(video)}
              onOpenShare={(video) => setShareVideo(video)}
              onSelectProduct={(product) => setDetailProduct(product)}
              onOpenDesignStudioForProduct={(template) => openDesignStudioWithTemplate(template)}
              initialVideoId={focusedVideoId || undefined}
              onBackToProfile={
                focusedVideoId
                  ? () => {
                      setFocusedVideoId(null);
                      setCurrentTab('profile');
                    }
                  : undefined
              }
            />
          )}

          {currentTab === 'shop' && (
            <ShopView
              products={products}
              onOpenDesignStudio={(template) => openDesignStudioWithTemplate(template || 'tshirt')}
              onAddToCart={handleAddToCart}
              onSelectProduct={(product) => setDetailProduct(product)}
            />
          )}

          {currentTab === 'services' && (
            <ServicesView
              services={services}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenTokTakShop={() => setIsTokTakShopOpen(true)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              onLoginWithGoogle={handleLoginWithGoogle}
              onLogout={handleLogout}
              onUpdateProfile={handleUpdateProfile}
              cart={cart}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onOpenDesignStudio={() => openDesignStudioWithTemplate('tshirt')}
              onOpenCreateClip={() => setIsCreateModalOpen(true)}
              onOpenAdminBackend={isAuthorizedAdmin ? () => setIsAdminBackendOpen(true) : undefined}
              onOpenTokTakShop={() => setIsTokTakShopOpen(true)}
              onPlayVideo={(v) => {
                setFocusedVideoId(v.id);
                setCurrentTab('home');
                setFeedType('foryou');
              }}
              onDeleteVideo={handleDeleteVideo}
              onToggleVideoPrivacy={handleToggleVideoPrivacy}
              myProducts={products}
              myVideos={videos}
            />
          )}
        </div>

        {/* 2. Bottom Tab Bar (5 compact buttons) */}
        {!showDesignStudio && !showLiveStream && (
          <BottomTabBar
            currentTab={currentTab}
            onTabChange={(tab) => setCurrentTab(tab)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            cartCount={cart.length}
            currentUser={currentUser}
          />
        )}

        {/* 3. Live Stream View (Interactive TikTok Live Experience) */}
        {showLiveStream && (
          <LiveStreamView
            onClose={() => setShowLiveStream(false)}
            onSelectProduct={(product) => setDetailProduct(product)}
            onOpenDesignStudio={(template) => openDesignStudioWithTemplate(template)}
            pinnedProduct={products[0]}
            currentUser={currentUser}
          />
        )}

        {/* 4. Design Studio View (Sub-view overlay) */}
        {showDesignStudio && (
          <DesignStudioView
            initialProductType={designStudioTemplate}
            onClose={() => setShowDesignStudio(false)}
            onAddToCart={handleAddCustomToCart}
          />
        )}

        {/* Modals */}
        <CreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUser={currentUser}
          products={products}
          onUploadClip={handleUploadClip}
          onSellProduct={handleSellProduct}
          onPostService={handlePostService}
          onGoLive={() => setShowLiveStream(true)}
        />

        <CommentModal
          isOpen={!!commentVideo}
          onClose={() => setCommentVideo(null)}
          videoCaption={commentVideo?.caption || ''}
        />

        <ShareModal
          isOpen={!!shareVideo}
          onClose={() => setShareVideo(null)}
          title={shareVideo?.caption || 'แชร์คอนเทนต์ TokDesign'}
          videoUrl={shareVideo?.videoUrl}
        />

        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenDesignStudio={(type) => openDesignStudioWithTemplate(type)}
        />

        {/* Admin Backend Management Modal: Strictly restricted to Superadmin and Admin only */}
        {isAuthorizedAdmin && (
          <AdminBackendModal
            isOpen={isAdminBackendOpen}
            onClose={() => setIsAdminBackendOpen(false)}
            products={products}
            onUpdateProducts={(updated) => {
              setProducts(updated);
              showToast('✅ อัปเดตรายการสินค้าหน้าร้านเรียบร้อยแล้ว');
            }}
            videos={videos}
            onUpdateVideos={(updated) => {
              setVideos(updated);
              showToast('✅ อัปเดตคอนเทนต์และคลิปวิดีโอเรียบร้อยแล้ว');
            }}
            orders={orders}
            onUpdateOrders={(updated) => {
              setOrders(updated);
              showToast('✅ อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว');
            }}
            superadminEmail="goldenrivercity@gmail.com"
          />
        )}

        {/* TokTak Shop Creator Center & Basket Pinning Registration Modal */}
        <TokTakCreatorShopModal
          isOpen={isTokTakShopOpen}
          onClose={() => setIsTokTakShopOpen(false)}
          products={products}
          currentUserEmail={currentUser?.email}
          currentUserName={currentUser?.name}
          onPinProductToClip={(product) => {
            showToast(`🛒 ปักตะกร้า "${product.name}" ในคลิปถัดไปเรียบร้อยแล้ว`);
          }}
        />
      </main>
    </div>
  );
}
