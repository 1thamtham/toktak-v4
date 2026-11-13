import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  ShoppingBag,
  ShoppingCart,
  Settings,
  Share2,
  Play,
  Pause,
  CheckCircle2,
  Trash2,
  ArrowRight,
  LogOut,
  Edit3,
  ShieldCheck,
  Sparkles,
  Camera,
  X,
  Plus,
  Mail,
  UserCheck,
  Upload,
  Image as ImageIcon,
  Check,
  Wand2,
  Crown,
  ChevronRight,
  ChevronLeft,
  Download,
  Film,
  Heart,
  Music,
  Lock,
  Unlock,
  Grid,
  Eye,
  Volume2,
  VolumeX,
  Users,
  RefreshCw
} from 'lucide-react';
import { CartItem, ProductItem, VideoItem, UserProfile } from '../types';

export const GoogleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface ProfileViewProps {
  currentUser: UserProfile | null;
  onLoginWithGoogle: (email?: string, name?: string) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  cart: CartItem[];
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onOpenDesignStudio: () => void;
  onOpenCreateClip?: () => void;
  onOpenAdminBackend?: () => void;
  onOpenTokTakShop?: () => void;
  onPlayVideo?: (video: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
  onToggleVideoPrivacy?: (videoId: string) => void;
  myProducts: ProductItem[];
  myVideos: VideoItem[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onLoginWithGoogle,
  onLogout,
  onUpdateProfile,
  cart,
  onRemoveFromCart,
  onClearCart,
  onOpenDesignStudio,
  onOpenCreateClip,
  onOpenAdminBackend,
  onOpenTokTakShop,
  onPlayVideo,
  onDeleteVideo,
  onToggleVideoPrivacy,
  myProducts,
  myVideos
}) => {
  const isSuperadmin =
    currentUser?.email === 'goldenrivercity@gmail.com' ||
    currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';
  const isAuthorizedAdmin = Boolean(currentUser && (isSuperadmin || isAdmin) && onOpenAdminBackend);

  const [profileTab, setProfileTab] = useState<'my_clips' | 'liked_clips' | 'private_drafts' | 'products' | 'cart' | 'account'>('my_clips');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [switchCustomEmail, setSwitchCustomEmail] = useState('');
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [showCustomEmailBox, setShowCustomEmailBox] = useState(false);
  const [selectedVideoForPlay, setSelectedVideoForPlay] = useState<VideoItem | null>(null);
  const [isModalPlaying, setIsModalPlaying] = useState(true);
  const [isModalMuted, setIsModalMuted] = useState(true);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Edit form states
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editHandle, setEditHandle] = useState(currentUser?.handle || '');

  // Sync edit fields and close stale video player whenever account switches
  useEffect(() => {
    setEditName(currentUser?.name || '');
    setEditBio(currentUser?.bio || '');
    setEditHandle(currentUser?.handle || '');
    setSelectedVideoForPlay(null);
  }, [currentUser?.email, currentUser?.name, currentUser?.bio, currentUser?.handle]);

  // Force immediate autoplay whenever a clip opens in Fullscreen Video Player
  useEffect(() => {
    if (selectedVideoForPlay && modalVideoRef.current) {
      const el = modalVideoRef.current;
      el.muted = true;
      el.defaultMuted = true;
      el.playsInline = true;
      el.currentTime = 0;
      setIsModalMuted(true);
      const p = el.play();
      if (p !== undefined) {
        p.then(() => setIsModalPlaying(true)).catch(() => {
          el.muted = true;
          el.play().then(() => setIsModalPlaying(true)).catch(() => setIsModalPlaying(false));
        });
      }
    }
  }, [selectedVideoForPlay?.id, selectedVideoForPlay?.videoUrl]);

  const getSavedAccountsList = (): Array<{ email: string; name: string; avatar?: string; role?: string }> => {
    const defaults: Record<string, { email: string; name: string; avatar?: string; role?: string }> = {
      'goldenrivercity@gmail.com': {
        email: 'goldenrivercity@gmail.com',
        name: 'Golden River City',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95',
        role: 'superadmin'
      },
      'admin@tokdesign.com': {
        email: 'admin@tokdesign.com',
        name: 'Admin TokDesign',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=95',
        role: 'admin'
      },
      'customer@gmail.com': {
        email: 'customer@gmail.com',
        name: 'สมชาย ใจดี',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=95',
        role: 'user'
      }
    };
    try {
      const raw = localStorage.getItem('toktak_profiles_by_email');
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.keys(parsed).forEach((k) => {
          const p = parsed[k];
          if (p && p.email) {
            const norm = p.email.trim().toLowerCase();
            defaults[norm] = {
              email: norm,
              name: p.name || norm,
              avatar: p.avatar,
              role: p.role
            };
          }
        });
      }
    } catch {
      // ignore storage errors
    }
    return Object.values(defaults);
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    setIsCheckoutSuccess(true);
    setTimeout(() => {
      onClearCart();
      setIsCheckoutSuccess(false);
    }, 2200);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateProfile({ avatar: dataUrl });
        setShowAvatarModal(false);
      }
    };
    reader.readAsDataURL(file);
    // reset input
    e.target.value = '';
  };

  const handleSelectPresetAvatar = (url: string) => {
    onUpdateProfile({ avatar: url });
    setShowAvatarModal(false);
  };

  const handleCreateAIAvatar = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const palettes = [
        ['#3b82f6', '#8b5cf6', '#ec4899'],
        ['#f59e0b', '#ef4444', '#8b5cf6'],
        ['#10b981', '#06b6d4', '#3b82f6'],
        ['#6366f1', '#a855f7', '#ec4899'],
        ['#0f172a', '#334155', '#475569']
      ];
      const chosen = palettes[Math.floor(Math.random() * palettes.length)];
      const grad = ctx.createLinearGradient(0, 0, 400, 400);
      grad.addColorStop(0, chosen[0]);
      grad.addColorStop(0.5, chosen[1]);
      grad.addColorStop(1, chosen[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);

      // Circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(310, 90, 130, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(90, 310, 110, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(200, 200, 160, 0, Math.PI * 2);
      ctx.stroke();

      // Initial
      const name = currentUser?.name || 'Golden River';
      const initial = (name.charAt(0) || 'G').toUpperCase();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 150px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initial, 200, 195);

      // Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.roundRect(110, 310, 180, 42, 21);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText('✨ AI CREATOR', 200, 332);

      const generatedDataUrl = canvas.toDataURL('image/png');
      onUpdateProfile({ avatar: generatedDataUrl });
      setShowAvatarModal(false);
    }
  };

  const handleGoogleLoginClick = (email?: string, name?: string) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      onLoginWithGoogle(email, name);
      setIsLoggingIn(false);
    }, 700);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      onUpdateProfile({
        name: editName.trim() || currentUser.name,
        bio: editBio.trim() || currentUser.bio,
        handle: editHandle.startsWith('@') ? editHandle : `@${editHandle}`
      });
      setShowEditModal(false);
    }
  };

  // Helper to resolve an immediate, persistent image thumbnail for any clip
  const getClipThumbnail = (vid: VideoItem): string => {
    if (
      vid.posterUrl &&
      !vid.posterUrl.endsWith('.mp4') &&
      !vid.posterUrl.endsWith('.mov') &&
      !vid.posterUrl.endsWith('.webm') &&
      !vid.posterUrl.startsWith('data:video')
    ) {
      return vid.posterUrl;
    }
    if (vid.linkedProduct?.image) {
      return vid.linkedProduct.image;
    }
    if (vid.linkedProduct?.productType === 'phonecase') {
      return '/src/assets/images/phonecase_mockup_1794023818273.jpg';
    }
    if (vid.linkedProduct?.productType === 'totebag') {
      return '/src/assets/images/totebag_mockup_1794023818674.jpg';
    }
    return '/src/assets/images/tshirt_mockup_1794023817755.jpg';
  };

  // Helper to format clean video caption without unwanted "เสื้อยืด" label
  const getCleanCaption = (vid: VideoItem): string => {
    if (vid.caption) {
      const stripped = vid.caption
        .replace(/เสื้อยืดโอเวอร์ไซส์ สตรีทอาร์ต ลิมิเต็ด/g, '')
        .replace(/เสื้อยืดโอเวอร์ไซส์/g, '')
        .replace(/^เสื้อยืด\s*/, '')
        .trim();
      if (stripped) return stripped;
    }
    if (vid.linkedProduct?.name && !vid.linkedProduct.name.includes('เสื้อยืด')) {
      return vid.linkedProduct.name;
    }
    return 'คลิปวิดีโอ TokTak';
  };

  const getSafeVideoUrl = (url?: string) => {
    if (!url) return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    if (url.startsWith('blob:') || url.startsWith('data:') || url.includes('#')) {
      return url;
    }
    return `${url}#t=0.001`;
  };

  const currentEmail = (currentUser?.email || '').trim().toLowerCase();

  // Helper function checking ownership strictly by authorEmail, ownerEmail, or creatorEmail
  const isVideoOwnedByCurrent = (v: VideoItem): boolean => {
    if (!currentEmail) return false;
    const author = (v.authorEmail || v.ownerEmail || v.creatorEmail || '').trim().toLowerCase();
    if (author) {
      return author === currentEmail;
    }
    // Fallback for default goldenrivercity account
    if (currentEmail === 'goldenrivercity@gmail.com') {
      return (
        v.id.startsWith('clip-') ||
        v.creatorHandle === '@goldenrivercity' ||
        v.creatorName === 'Golden River City'
      );
    }
    return Boolean(
      (currentUser?.handle && v.creatorHandle === currentUser.handle) ||
      (currentUser?.name && v.creatorName === currentUser.name)
    );
  };

  // 1. คลิปของฉัน (My Clips): strictly videos where authorEmail matches currentUser.email, excluding private/draft
  const myClips = myVideos.filter(
    (v) => isVideoOwnedByCurrent(v) && !v.isPrivate && !v.isDraft
  );

  // 2. คลิปที่ถูกใจ (Liked Videos): videos that this user account has liked
  const likedClips = myVideos.filter((v) => {
    if (!currentEmail) return false;
    if (v.likedByEmails && v.likedByEmails.length > 0) {
      return v.likedByEmails.map((e) => e.toLowerCase()).includes(currentEmail);
    }
    if (currentEmail === 'goldenrivercity@gmail.com' && v.isLiked) {
      return true;
    }
    return Boolean(v.isLiked && isVideoOwnedByCurrent(v));
  });

  // 3. คลิปส่วนตัว / ร่าง (Private / Drafts): owned by this user and marked isPrivate or isDraft
  const privateDraftClips = myVideos.filter(
    (v) => isVideoOwnedByCurrent(v) && (v.isPrivate === true || v.isDraft === true)
  );

  // Backward compatibility alias for any existing reference
  const userClips = myClips;

  // -------------------------------------------------------------
  // 1. IF NOT LOGGED IN: SHOW GOOGLE LOGIN VIEW
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="w-full min-h-[calc(100vh-3.5rem)] pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 select-none flex flex-col items-center justify-between p-4">
        {/* Top brand header */}
        <div className="w-full text-center pt-3 pb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Google Identity Services</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            เข้าสู่ระบบด้วย Google
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            เชื่อมต่อบัญชี Google ของคุณเพื่อจัดการโปรไฟล์ส่วนตัว บันทึกงานออกแบบ และติดตามคำสั่งซื้อ
          </p>
        </div>

        {/* Center Illustration / Card */}
        <div className="w-full max-w-sm my-auto space-y-4">
          {/* Quick 1-Tap Google Login Card for current account */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 via-rose-50 to-transparent rounded-bl-full pointer-events-none opacity-60" />

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-blue-500 p-[2px] shadow-xs">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-slate-800 text-base">
                    G
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-xs border border-slate-100">
                  <GoogleIcon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate">Golden River City</h3>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-semibold border border-blue-100">
                    Google
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  goldenrivercity@gmail.com
                </p>
              </div>
            </div>

            <button
              onClick={() => handleGoogleLoginClick('goldenrivercity@gmail.com', 'Golden River City')}
              disabled={isLoggingIn}
              className="mt-3.5 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-75"
            >
              {isLoggingIn ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4" />
                  <span>ดำเนินการต่อด้วยบัญชีนี้</span>
                </>
              )}
            </button>
          </div>

          {/* Standard One-Click Google Button */}
          <div className="space-y-2">
            <button
              onClick={() => handleGoogleLoginClick('goldenrivercity@gmail.com', 'Golden River City')}
              disabled={isLoggingIn}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs flex items-center justify-center gap-3 transition active:scale-[0.98]"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>เข้าสู่ระบบด้วย Google (Sign in with Google)</span>
            </button>

            {/* Quick Role Switchers to easily test and verify permissions */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 text-center">
                เลือกโปรไฟล์เพื่อทดสอบสิทธิ์ (Role Switcher):
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  type="button"
                  onClick={() => handleGoogleLoginClick('goldenrivercity@gmail.com', 'Golden River City')}
                  className="p-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-slate-900 transition flex flex-col items-center justify-center active:scale-95"
                >
                  <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
                    👑 Superadmin
                  </span>
                  <span className="text-[8px] text-slate-500 truncate max-w-full">
                    goldenrivercity
                  </span>
                  <span className="text-[8px] text-emerald-600 font-bold mt-0.5">
                    ✓ มีปุ่มหลังบ้าน
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGoogleLoginClick('admin@tokdesign.com', 'Admin TokDesign')}
                  className="p-1.5 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-slate-900 transition flex flex-col items-center justify-center active:scale-95"
                >
                  <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-0.5">
                    🛡️ Admin
                  </span>
                  <span className="text-[8px] text-slate-500 truncate max-w-full">
                    admin@tokdesign
                  </span>
                  <span className="text-[8px] text-emerald-600 font-bold mt-0.5">
                    ✓ มีปุ่มหลังบ้าน
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGoogleLoginClick('customer@gmail.com', 'สมชาย ใจดี')}
                  className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition flex flex-col items-center justify-center active:scale-95"
                >
                  <span className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                    👤 บัญชีทั่วไป
                  </span>
                  <span className="text-[8px] text-slate-500 truncate max-w-full">
                    customer@gmail
                  </span>
                  <span className="text-[8px] text-rose-500 font-bold mt-0.5">
                    ✕ ไม่มีปุ่มหลังบ้าน
                  </span>
                </button>
              </div>
            </div>

            {/* Toggle custom google email */}
            {!showCustomEmailBox ? (
              <button
                onClick={() => setShowCustomEmailBox(true)}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 py-1 transition underline decoration-slate-300"
              >
                หรือใช้อีเมล Google บัญชีอื่น
              </button>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">ระบุอีเมล Google ของคุณ</span>
                  <button
                    onClick={() => setShowCustomEmailBox(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    placeholder="example@gmail.com"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-slate-900"
                  />
                  <button
                    onClick={() => {
                      if (customEmailInput.trim()) {
                        const email = customEmailInput.trim();
                        const derivedName = email.split('@')[0].replace('.', ' ');
                        handleGoogleLoginClick(email, derivedName);
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feature list benefits */}
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              สิทธิประโยชน์เมื่อเชื่อมต่อ Google
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-white/70 rounded-xl border border-slate-200/60 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-600 leading-tight">
                  บันทึกผลงานออกแบบคัสตอมในบัญชีคุณ
                </span>
              </div>
              <div className="p-2.5 bg-white/70 rounded-xl border border-slate-200/60 flex items-start gap-2">
                <Video className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-600 leading-tight">
                  โพสต์คลิปและจัดการคอนเทนต์ของฉัน
                </span>
              </div>
              <div className="p-2.5 bg-white/70 rounded-xl border border-slate-200/60 flex items-start gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-600 leading-tight">
                  ติดตามออเดอร์ในตะกร้าและสั่งซื้อ
                </span>
              </div>
              <div className="p-2.5 bg-white/70 rounded-xl border border-slate-200/60 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-600 leading-tight">
                  ปลอดภัย ป้องกันข้อมูลสูญหาย
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[10px] text-slate-400 text-center max-w-xs mt-3">
          การเข้าสู่ระบบถือว่ายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. IF LOGGED IN: SHOW REAL USER'S PROFILE
  // -------------------------------------------------------------
  return (
    <div className="w-full min-h-full pb-32 bg-slate-50 text-slate-900">
      {/* Top Profile Header */}
      <div className="pt-4 px-4 pb-3 border-b border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setShowSwitchAccountModal(true)}
            title="แตะเพื่อสลับบัญชี Gmail ทันที"
            className="flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-full hover:bg-slate-100 active:scale-95 transition"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{currentUser.handle}</span>
            <RefreshCw className="w-3 h-3 text-blue-600 shrink-0" />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowSwitchAccountModal(true)}
              title="สลับบัญชี Gmail"
              className="px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 text-[10px] font-bold text-blue-700 transition active:scale-95"
            >
              <Users className="w-3 h-3" />
              <span>สลับบัญชี</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `โปรไฟล์ของ ${currentUser.name}`,
                    url: window.location.href
                  }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {});
                  setCopiedProfileLink(true);
                  setTimeout(() => setCopiedProfileLink(false), 1800);
                }
              }}
              aria-label="แชร์โปรไฟล์"
              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900"
            >
              {copiedProfileLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              aria-label="แก้ไขโปรไฟล์"
              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
              className="px-2 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 flex items-center gap-1 text-[10px] font-medium text-slate-600 transition"
            >
              <LogOut className="w-3 h-3" />
              <span>ออก</span>
            </button>
          </div>
        </div>

        {/* Compact User Info */}
        <div className="flex flex-col items-center text-center">
          {/* Hidden file input for avatar upload */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />

          <div className="relative group">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                onClick={() => setShowAvatarModal(true)}
                title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์ หรืออัปโหลดรูปหน้าจริงของคุณ"
                className="w-16 h-16 rounded-full object-cover object-center border-2 border-blue-500 shadow-md ring-2 ring-blue-50 cursor-pointer hover:brightness-95 active:scale-95 transition"
              />
            ) : (
              <div
                onClick={() => setShowAvatarModal(true)}
                title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 via-rose-500 to-amber-500 p-[2px] shadow-md cursor-pointer active:scale-95 transition ring-2 ring-blue-50"
              >
                <div className="w-full h-full rounded-full bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Hover overlay indicator on image */}
            <div
              onClick={() => setShowAvatarModal(true)}
              className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-[8px] font-semibold pointer-events-none group-hover:pointer-events-auto"
            >
              <Camera className="w-4 h-4 mb-0.5" />
              <span>เปลี่ยนรูป</span>
            </div>

            {/* Camera badge button */}
            <button
              onClick={() => setShowAvatarModal(true)}
              title="เปลี่ยนรูปโปรไฟล์"
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 active:scale-90 transition ring-1 ring-white"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-1.5 flex flex-col items-center">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <span>{currentUser.name}</span>
              {isSuperadmin ? (
                <span className="inline-flex items-center gap-0.5 text-[8px] bg-amber-400 text-slate-950 border border-amber-300 px-1.5 py-0.2 rounded-full font-black shadow-xs">
                  <Crown className="w-2 h-2 fill-slate-950" />
                  SUPER
                </span>
              ) : isAdmin ? (
                <span className="inline-flex items-center gap-0.5 text-[8px] bg-indigo-600 text-white border border-indigo-500 px-1.5 py-0.2 rounded-full font-black shadow-xs">
                  <ShieldCheck className="w-2 h-2 text-white" />
                  ADMIN
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[8px] bg-blue-50 text-blue-600 border border-blue-200 px-1 py-0.2 rounded font-semibold">
                  <ShieldCheck className="w-2 h-2 text-blue-600" />
                  Verified
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 font-medium">
              <Mail className="w-2.5 h-2.5 text-slate-400" />
              <span>{currentUser.email}</span>
            </div>

            {/* Quick helper button to upload actual face photo */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[9px] font-semibold transition active:scale-95"
            >
              <Upload className="w-2.5 h-2.5" />
              <span>อัปโหลดรูปหน้าจริง (HD)</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-600 max-w-xs mt-1 px-2 line-clamp-1">
            {currentUser.bio || 'ยินดีต้อนรับสู่โปรไฟล์ของฉันใน TokDesign'}
          </p>

          {/* Followers / Following Stats */}
          <div className="flex items-center gap-5 mt-2 text-center">
            <div>
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {currentUser.followingCount}
              </span>
              <span className="text-[9px] text-slate-500 block">กำลังติดตาม</span>
            </div>
            <div className="w-[1px] h-2.5 bg-slate-200" />
            <div>
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {currentUser.followersCount}
              </span>
              <span className="text-[9px] text-slate-500 block">ผู้ติดตาม</span>
            </div>
            <div className="w-[1px] h-2.5 bg-slate-200" />
            <div>
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {currentUser.likesCount}
              </span>
              <span className="text-[9px] text-slate-500 block">ถูกใจ</span>
            </div>
          </div>

          {/* Action Buttons in Compact Single Row */}
          <div className="flex items-center gap-1.5 mt-2.5 w-full max-w-xs">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-medium rounded-lg transition active:scale-95 flex items-center justify-center gap-1 shrink-0"
            >
              <Edit3 className="w-3 h-3" />
              <span>แก้ไข</span>
            </button>
            <button
              onClick={onOpenDesignStudio}
              className="flex-1 py-1 px-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-bold rounded-lg shadow-2xs hover:brightness-105 transition active:scale-95 flex items-center justify-center gap-1 shrink-0"
            >
              <Sparkles className="w-3 h-3" />
              <span>ออกแบบ</span>
            </button>
            {isAuthorizedAdmin && (
              <button
                onClick={onOpenAdminBackend}
                className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/50 text-[11px] font-bold rounded-lg shadow-2xs active:scale-95 transition flex items-center justify-center gap-1 shrink-0"
                title="หลังบ้าน Admin"
              >
                <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>หลังบ้าน</span>
              </button>
            )}
            <button
              onClick={onOpenTokTakShop}
              className="py-1 px-2 bg-white hover:bg-slate-50 border border-slate-200 text-orange-600 text-[11px] font-bold rounded-lg shadow-2xs active:scale-95 transition flex items-center justify-center gap-1 shrink-0"
              title="ร้านครีเอเตอร์"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>ร้านค้า</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Clean horizontal scrollable tabs matching TikTok/Instagram */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth px-1">
          {/* Tab 1: คลิปของฉัน */}
          <button
            onClick={() => setProfileTab('my_clips')}
            className={`py-2 px-2.5 flex items-center justify-center gap-1 text-[11px] font-medium transition shrink-0 relative ${
              profileTab === 'my_clips' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>คลิป</span>
            <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
              {myClips.length}
            </span>
            {profileTab === 'my_clips' && (
              <span className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-rose-500 rounded-full" />
            )}
          </button>

          {/* Tab 2: คลิปที่ถูกใจ */}
          <button
            onClick={() => setProfileTab('liked_clips')}
            className={`py-2 px-2.5 flex items-center justify-center gap-1 text-[11px] font-medium transition shrink-0 relative ${
              profileTab === 'liked_clips' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>ถูกใจ</span>
            <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
              {likedClips.length}
            </span>
            {profileTab === 'liked_clips' && (
              <span className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-rose-500 rounded-full" />
            )}
          </button>

          {/* Tab 3: คลิปส่วนตัว / ร่าง */}
          <button
            onClick={() => setProfileTab('private_drafts')}
            className={`py-2 px-2.5 flex items-center justify-center gap-1 text-[11px] font-medium transition shrink-0 relative ${
              profileTab === 'private_drafts' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>ส่วนตัว</span>
            {privateDraftClips.length > 0 && (
              <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-100 text-amber-700 font-bold">
                {privateDraftClips.length}
              </span>
            )}
            {profileTab === 'private_drafts' && (
              <span className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-amber-500 rounded-full" />
            )}
          </button>

          {/* Tab 4: สินค้า */}
          <button
            onClick={() => setProfileTab('products')}
            className={`py-2 px-2.5 flex items-center justify-center gap-1 text-[11px] font-medium transition shrink-0 relative ${
              profileTab === 'products' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>สินค้า</span>
            <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
              {myProducts.length}
            </span>
            {profileTab === 'products' && (
              <span className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-rose-500 rounded-full" />
            )}
          </button>

          {/* Tab 5: ตะกร้า */}
          <button
            onClick={() => setProfileTab('cart')}
            className={`py-2 px-2.5 flex items-center justify-center gap-1 text-[11px] font-medium transition shrink-0 relative ${
              profileTab === 'cart' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>ตะกร้า</span>
            {cart.length > 0 && (
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center shadow-xs">
                {cart.length}
              </span>
            )}
            {profileTab === 'cart' && (
              <span className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-rose-500 rounded-full" />
            )}
          </button>

          {/* Tab 6: บัญชี */}
          <button
            onClick={() => setProfileTab('account')}
            className={`py-2 px-2.5 flex items-center justify-center gap-1 text-[11px] font-medium transition shrink-0 relative ${
              profileTab === 'account' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <GoogleIcon className="w-3 h-3" />
            <span>บัญชี</span>
            {profileTab === 'account' && (
              <span className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-blue-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-3">
        {/* 1. คลิปของฉัน (My Clips) - 3-Column Grid */}
        {profileTab === 'my_clips' && (
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 px-1">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Grid className="w-3.5 h-3.5 text-rose-500" />
                <span>คลิปของฉัน ({myClips.length})</span>
              </span>
              {onOpenCreateClip && (
                <button
                  onClick={onOpenCreateClip}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold transition active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>โพสต์คลิปใหม่</span>
                </button>
              )}
            </div>

            {myClips && myClips.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {myClips.map((vid, index) => {
                  const thumbUrl = getClipThumbnail(vid);
                  return (
                    <div
                      key={vid.id || index}
                      onClick={() => {
                        setSelectedVideoForPlay(vid);
                      }}
                      className="relative aspect-[9/16] bg-slate-900 rounded-xl overflow-hidden shadow-xs cursor-pointer hover:opacity-95 transition-all group"
                    >
                      {/* 1. Permanent Image Thumbnail: rendered eagerly so 0ms grey state */}
                      <img
                        src={thumbUrl}
                        alt={vid.caption || 'ตัวอย่างวิดีโอ'}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />

                      {/* 2. Interactive Video Element (Tap plays directly & opens Fullscreen Player) */}
                      <video
                        src={getSafeVideoUrl(vid.videoUrl)}
                        poster={thumbUrl}
                        preload="metadata"
                        playsInline
                        muted
                        loop
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = e.currentTarget;
                          el.muted = true;
                          el.playsInline = true;
                          el.play().catch(() => {});
                          setSelectedVideoForPlay(vid);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.muted = true;
                          e.currentTarget.play().catch(() => {});
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('ForBiggerBlazes.mp4')) {
                            target.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4#t=0.001';
                          }
                        }}
                      />

                      {/* Top badge */}
                      <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-white text-[9px] font-medium pointer-events-none">
                        <Play className="w-2 h-2 fill-white text-white" />
                        <span>คลิป</span>
                      </div>

                      {/* Corner Action Buttons: Permanently visible Delete & Lock buttons */}
                      <div className="absolute top-1.5 right-1.5 z-30 flex items-center gap-1 pointer-events-auto">
                        {onToggleVideoPrivacy && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onToggleVideoPrivacy(vid.id);
                            }}
                            title="ล็อกเป็นคลิปส่วนตัว"
                            aria-label="ล็อกเป็นส่วนตัว"
                            className="w-6 h-6 rounded-full bg-slate-900/80 hover:bg-slate-900 text-amber-300 flex items-center justify-center transition shadow-md active:scale-90"
                          >
                            <Lock className="w-3 h-3" />
                          </button>
                        )}
                        {onDeleteVideo && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onDeleteVideo(vid.id);
                            }}
                            title="ลบคลิปวิดีโอนี้"
                            aria-label="ลบคลิปวิดีโอ"
                            className="w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-700 active:scale-90 text-white flex items-center justify-center transition shadow-lg border border-white/30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}
                      </div>

                      {/* Bottom Caption & Stat Overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white pointer-events-none z-10">
                        <div className="flex items-center justify-between text-[10px] text-white/90 font-medium">
                          <span className="flex items-center gap-0.5 drop-shadow-xs font-bold">
                            <Play className="w-2 h-2 fill-white text-white" />
                            <span>{vid.likesCount > 0 ? vid.likesCount.toLocaleString() : '1'}</span>
                          </span>
                          {vid.linkedProduct && (
                            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                              <ShoppingBag className="w-2 h-2" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white font-medium line-clamp-1 drop-shadow-xs mt-0.5">
                          {getCleanCaption(vid)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Film className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">ยังไม่มีคลิปที่โพสต์ในบัญชีนี้</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  คลิปที่คุณโพสต์ด้วย Gmail {currentUser?.email} จะถูกแยกแสดงผลที่นี่โดยอัตโนมัติ
                </p>
                {onOpenCreateClip && (
                  <button
                    onClick={onOpenCreateClip}
                    className="mt-3.5 px-4 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-105 active:scale-95 text-white text-xs font-bold rounded-full shadow-xs inline-flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เริ่มโพสต์คลิปแรก</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. คลิปที่ถูกใจ (Liked Videos) - 3-Column Grid */}
        {profileTab === 'liked_clips' && (
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 px-1">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>คลิปที่ถูกใจ ({likedClips.length})</span>
              </span>
            </div>

            {likedClips && likedClips.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {likedClips.map((vid, index) => {
                  const thumbUrl = getClipThumbnail(vid);
                  return (
                    <div
                      key={vid.id || index}
                      onClick={() => {
                        setSelectedVideoForPlay(vid);
                      }}
                      className="relative aspect-[9/16] bg-slate-900 rounded-xl overflow-hidden shadow-xs cursor-pointer hover:opacity-95 transition-all group"
                    >
                      <img
                        src={thumbUrl}
                        alt={vid.caption || 'ตัวอย่างวิดีโอ'}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                      <video
                        src={getSafeVideoUrl(vid.videoUrl)}
                        poster={thumbUrl}
                        preload="metadata"
                        playsInline
                        muted
                        loop
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.muted = true;
                          e.currentTarget.play().catch(() => {});
                          setSelectedVideoForPlay(vid);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.muted = true;
                          e.currentTarget.play().catch(() => {});
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-0.5 bg-rose-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                        <Heart className="w-2.5 h-2.5 fill-white" />
                        <span>ถูกใจ</span>
                      </div>
                      {onDeleteVideo && (
                        <div className="absolute top-1.5 right-1.5 z-30 pointer-events-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onDeleteVideo(vid.id);
                            }}
                            title="ลบคลิปวิดีโอนี้"
                            aria-label="ลบคลิปวิดีโอ"
                            className="w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-700 active:scale-90 text-white flex items-center justify-center transition shadow-lg border border-white/30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white pointer-events-none z-10">
                        <div className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
                          <Play className="w-2 h-2 fill-white" />
                          <span>{vid.likesCount.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-white font-medium line-clamp-1 drop-shadow-xs mt-0.5">
                          {getCleanCaption(vid)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3 text-rose-500">
                  <Heart className="w-6 h-6 fill-rose-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">ยังไม่มีคลิปที่กดถูกใจ</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  เมื่อคุณกดหัวใจ ❤️ ในคลิปบนหน้าฟีด คลิปนั้นจะถูกจัดเก็บไว้ในแท็บนี้
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. คลิปส่วนตัว / ร่าง (Private / Drafts) - 3-Column Grid */}
        {profileTab === 'private_drafts' && (
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 px-1">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>คลิปส่วนตัว / ร่าง ({privateDraftClips.length})</span>
              </span>
              {onOpenCreateClip && (
                <button
                  onClick={onOpenCreateClip}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold transition active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>สร้างคลิปร่าง</span>
                </button>
              )}
            </div>

            {privateDraftClips && privateDraftClips.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {privateDraftClips.map((vid, index) => {
                  const thumbUrl = getClipThumbnail(vid);
                  return (
                    <div
                      key={vid.id || index}
                      onClick={() => {
                        setSelectedVideoForPlay(vid);
                      }}
                      className="relative aspect-[9/16] bg-slate-900 rounded-xl overflow-hidden shadow-xs cursor-pointer hover:opacity-95 transition-all group border border-amber-500/30"
                    >
                      <img
                        src={thumbUrl}
                        alt={vid.caption || 'ตัวอย่างวิดีโอ'}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                      <video
                        src={getSafeVideoUrl(vid.videoUrl)}
                        poster={thumbUrl}
                        preload="metadata"
                        playsInline
                        muted
                        loop
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.muted = true;
                          e.currentTarget.play().catch(() => {});
                          setSelectedVideoForPlay(vid);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.muted = true;
                          e.currentTarget.play().catch(() => {});
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-0.5 bg-amber-500/90 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{vid.isDraft ? 'ร่าง' : 'ส่วนตัว'}</span>
                      </div>

                      {/* Action buttons: Unlock and Delete */}
                      <div className="absolute top-1.5 right-1.5 z-30 flex items-center gap-1 pointer-events-auto">
                        {onToggleVideoPrivacy && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onToggleVideoPrivacy(vid.id);
                            }}
                            title="สลับเป็นคลิปสาธารณะ"
                            aria-label="เปลี่ยนเป็นสาธารณะ"
                            className="w-6 h-6 rounded-full bg-slate-900/80 hover:bg-slate-900 text-emerald-300 flex items-center justify-center transition shadow-md active:scale-90"
                          >
                            <Unlock className="w-3 h-3" />
                          </button>
                        )}
                        {onDeleteVideo && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onDeleteVideo(vid.id);
                            }}
                            title="ลบคลิปวิดีโอนี้"
                            aria-label="ลบคลิปวิดีโอ"
                            className="w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-700 active:scale-90 text-white flex items-center justify-center transition shadow-lg border border-white/30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}
                      </div>

                      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white pointer-events-none z-10">
                        <div className="text-[10px] text-amber-200 font-bold truncate">
                          {vid.isDraft ? 'ฉบับร่าง' : 'ล็อกส่วนตัว'}
                        </div>
                        <div className="text-[10px] text-white font-medium line-clamp-1 drop-shadow-xs mt-0.5">
                          {getCleanCaption(vid)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3 text-amber-500">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">ยังไม่มีคลิปส่วนตัวหรือร่าง</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  คุณสามารถบันทึกคลิปเป็นร่าง หรือกดล็อกคลิปให้มองเห็นเฉพาะคุณได้ที่นี่
                </p>
                {onOpenCreateClip && (
                  <button
                    onClick={onOpenCreateClip}
                    className="mt-3.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-full shadow-xs inline-flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>สร้างคลิปร่าง</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. My Products */}
        {profileTab === 'products' && (
          <div className="space-y-2.5">
            {myProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{prod.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-rose-600 tabular-nums">฿{prod.price}</span>
                    <span className="text-[10px] text-slate-500">ขายได้แล้ว {prod.salesCount} ชิ้น</span>
                  </div>
                </div>
                <button
                  onClick={onOpenDesignStudio}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-rose-600 border border-slate-200 text-[10px] font-semibold rounded-md shrink-0"
                >
                  แก้ไขลาย
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. Order Cart */}
        {profileTab === 'cart' && (
          <div>
            {isCheckoutSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mb-2 animate-bounce" />
                <h3 className="text-sm font-bold text-slate-900">สั่งซื้อสินค้าเรียบร้อย!</h3>
                <p className="text-xs text-slate-500 mt-1">ทีมช่างกำลังเตรียมพิมพ์ลายและจัดส่งตามที่อยู่</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <ShoppingCart className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-600">ยังไม่มีสินค้าในตะกร้า</p>
                <button
                  onClick={onOpenDesignStudio}
                  className="mt-3 px-4 py-1.5 bg-rose-500 text-white text-xs font-semibold rounded-full hover:bg-rose-600 transition shadow-xs"
                >
                  เริ่มออกแบบสินค้าชิ้นแรก
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-xs"
                    >
                      <img
                        src={item.previewImage}
                        alt={item.productName}
                        className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.productName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span>จำนวน: {item.quantity}</span>
                          {item.customText && (
                            <span className="truncate">ลาย: "{item.customText}"</span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-rose-600 tabular-nums mt-1 block">
                          ฿{item.price * item.quantity}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition border border-slate-200/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Summary & Checkout */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>ยอดรวมค่าสินค้า</span>
                    <span className="font-semibold text-slate-900 tabular-nums">฿{totalCartPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>ค่าจัดส่งด่วนพิเศษ</span>
                    <span className="text-emerald-600 font-medium">ฟรี</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>ยอดสุทธิ</span>
                    <span className="text-rose-600 tabular-nums">฿{totalCartPrice}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full mt-2 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-md hover:brightness-105 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                  >
                    <span>ยืนยันสั่งซื้อสินค้า (ชำระเงิน/COD)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Google Account Details */}
        {profileTab === 'account' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <GoogleIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">บัญชี Google ที่เชื่อมต่ออยู่</h4>
                <p className="text-[11px] text-slate-500">Google OAuth 2.0 Single Sign-On</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">อีเมล (Google ID)</span>
                <span className="font-semibold text-slate-900">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ชื่อที่แสดง</span>
                <span className="font-semibold text-slate-900">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">บทบาทในระบบ (Role)</span>
                {isSuperadmin ? (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                    <Crown className="w-3 h-3 fill-amber-500 text-amber-500" /> Superadmin (สูงสุด)
                  </span>
                ) : (
                  <span className="font-semibold text-slate-700">ผู้ใช้งานทั่วไป</span>
                )}
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">สถานะความปลอดภัย</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> ปลอดภัย (Verified)
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">วันที่เริ่มใช้งาน</span>
                <span className="text-slate-700">{currentUser.joinedDate}</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={onOpenTokTakShop}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 hover:from-amber-500/15 text-slate-900 border border-amber-300/80 text-xs font-bold rounded-xl transition flex items-center justify-between shadow-2xs active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-rose-500" />
                  <span>TokTak shop สำหรับครีเอเตอร์ (สมัครปักตะกร้า)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2.5]" />
              </button>
            </div>

            {isAuthorizedAdmin && (
              <div className="pt-1">
                <button
                  onClick={onOpenAdminBackend}
                  className="w-full py-2 bg-gradient-to-r from-slate-900 to-indigo-950 text-amber-300 border border-amber-400/40 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs active:scale-95"
                >
                  <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>เปิดคอนโซลหลังบ้าน (แก้ไขสินค้า/คลิป/ออเดอร์)</span>
                </button>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => setShowSwitchAccountModal(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                <Users className="w-3.5 h-3.5" />
                <span>สลับบัญชี Gmail ทันที (Switch Account)</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900">แก้ไขข้อมูลโปรไฟล์</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  ชื่อที่แสดง (Display Name)
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  ชื่อผู้ใช้ (Handle)
                </label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  คำแนะนำตัว (Bio)
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-slate-900 resize-none"
                  placeholder="เขียนอะไรเกี่ยวกับตัวคุณหรือสตูดิโอของคุณ..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">เปลี่ยนรูปโปรไฟล์</h3>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Current Avatar Preview */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="relative">
                  <img
                    src={currentUser.avatar || '/src/assets/images/creator_avatar_1794023819826.jpg'}
                    alt="Current"
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-500 block">รูปโปรไฟล์ปัจจุบัน</span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
                  <span className="text-[10px] text-blue-600 font-medium">{currentUser.handle}</span>
                </div>
              </div>

              {/* Action Buttons: Device Upload & AI Generation */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition active:scale-95"
                >
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold">อัปโหลดรูปภาพ</span>
                  <span className="text-[9px] text-blue-500">เลือกไฟล์จากอุปกรณ์</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateAIAvatar}
                  className="p-3 bg-gradient-to-tr from-amber-50 to-rose-50 hover:brightness-95 text-slate-800 border border-amber-200 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition active:scale-95"
                >
                  <Wand2 className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-bold">AI สร้างรูปโปรไฟล์</span>
                  <span className="text-[9px] text-amber-600">สไตล์ครีเอเตอร์สตูดิโอ</span>
                </button>
              </div>

              {/* Preset Avatars Selection */}
              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-2">
                  หรือเลือกภาพโปรไฟล์สำเร็จรูป
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      name: 'หน้าตรงคมชัด HD',
                      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95'
                    },
                    {
                      name: 'หนุ่มเอเชีย (Studio)',
                      url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=95'
                    },
                    {
                      name: 'ครีเอเตอร์สมาร์ท (HD)',
                      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=95'
                    },
                    {
                      name: 'สตรีทแวร์ดีไซเนอร์',
                      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=95'
                    },
                    {
                      name: 'นักธุรกิจมืออาชีพ',
                      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=95'
                    },
                    {
                      name: 'สตูดิโอ Official',
                      url: '/src/assets/images/creator_avatar_1794023819826.jpg'
                    }
                  ].map((preset, idx) => {
                    const isSelected = currentUser.avatar === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(preset.url)}
                        className={`group relative rounded-xl overflow-hidden border p-1 text-center transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden mx-auto border border-slate-100">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-600 font-medium truncate w-full">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Switch Account Modal (Zero blocking, real-time profile & clips update) */}
      {showSwitchAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GoogleIcon className="w-4 h-4" />
                <h3 className="text-xs font-bold text-slate-900">สลับบัญชี Gmail ทันที</h3>
              </div>
              <button
                onClick={() => setShowSwitchAccountModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                {getSavedAccountsList().map((acc) => {
                  const isCurrent = acc.email.toLowerCase() === currentEmail;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        onLoginWithGoogle(acc.email, acc.name);
                        setShowSwitchAccountModal(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition active:scale-[0.98] ${
                        isCurrent
                          ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <img
                        src={acc.avatar || '/src/assets/images/creator_avatar_1794023819826.jpg'}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">{acc.name}</span>
                          {acc.role === 'superadmin' && (
                            <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black">SUPER</span>
                          )}
                          {acc.role === 'admin' && (
                            <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-black">ADMIN</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 truncate block">{acc.email}</span>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                          ใช้งานอยู่
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          สลับ
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  หรือสลับไปยังบัญชี Gmail ใหม่
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={switchCustomEmail}
                    onChange={(e) => setSwitchCustomEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = switchCustomEmail.trim();
                      if (trimmed) {
                        const derivedName = trimmed.split('@')[0].replace(/[._]/g, ' ');
                        onLoginWithGoogle(trimmed, derivedName);
                        setSwitchCustomEmail('');
                        setShowSwitchAccountModal(false);
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shrink-0 active:scale-95 transition"
                  >
                    สลับเลย
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player & Downloader Modal (True Mobile Fullscreen) */}
      {selectedVideoForPlay && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none animate-in fade-in duration-200">
          {/* Modal Top Header with ‹ โปรไฟล์ Back Button & Sound Toggle */}
          <div className="absolute top-0 inset-x-0 z-30 p-3.5 flex items-center justify-between text-white bg-gradient-to-b from-black/85 via-black/40 to-transparent">
            <button
              onClick={() => setSelectedVideoForPlay(null)}
              className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center gap-1 text-xs font-bold border border-white/25 backdrop-blur-md active:scale-95 transition shadow-lg"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              <span>โปรไฟล์</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white drop-shadow-md truncate max-w-[130px]">
                {selectedVideoForPlay.creatorName || selectedVideoForPlay.creatorHandle}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (modalVideoRef.current) {
                    const nextMuted = !isModalMuted;
                    modalVideoRef.current.muted = nextMuted;
                    setIsModalMuted(nextMuted);
                  }
                }}
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition active:scale-95"
                title={isModalMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
              >
                {isModalMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setSelectedVideoForPlay(null)}
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Fullscreen Video Screen */}
          <div
            onClick={() => {
              if (!modalVideoRef.current) return;
              if (modalVideoRef.current.paused) {
                modalVideoRef.current.play().then(() => setIsModalPlaying(true)).catch(() => {});
              } else {
                modalVideoRef.current.pause();
                setIsModalPlaying(false);
              }
            }}
            className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
          >
            <video
              key={selectedVideoForPlay.id}
              ref={modalVideoRef}
              src={getSafeVideoUrl(selectedVideoForPlay.videoUrl)}
              poster={getClipThumbnail(selectedVideoForPlay)}
              autoPlay
              playsInline
              loop
              muted={isModalMuted}
              preload="auto"
              onCanPlay={(e) => {
                if (isModalPlaying) {
                  e.currentTarget.play().then(() => setIsModalPlaying(true)).catch(() => {});
                }
              }}
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.src.includes('ForBiggerBlazes.mp4')) {
                  el.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4#t=0.001';
                  el.load();
                  el.muted = true;
                  el.play().then(() => setIsModalPlaying(true)).catch(() => {});
                }
              }}
              className="w-full h-full object-cover"
            />
            {!isModalPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/25 shadow-xl">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Video Details & Actions Overlay */}
          <div className="absolute bottom-0 inset-x-0 z-30 p-3.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white space-y-2.5">
            <div>
              <p className="text-xs text-white font-medium line-clamp-2 drop-shadow-md">
                {selectedVideoForPlay.caption}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1">
                <Music className="w-3 h-3 text-orange-400 shrink-0" />
                <span className="truncate">{selectedVideoForPlay.musicTitle}</span>
              </div>
            </div>

            {/* Action Buttons: Download, View on Main Feed, Delete */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={selectedVideoForPlay.videoUrl}
                download={`tokdesign-${selectedVideoForPlay.id}.mp4`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:brightness-105 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition text-center"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>ดาวน์โหลด</span>
              </a>

              {onPlayVideo && (
                <button
                  onClick={() => {
                    onPlayVideo(selectedVideoForPlay);
                    setSelectedVideoForPlay(null);
                  }}
                  className="flex-1 py-2 px-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white rounded-xl text-xs font-bold active:scale-95 flex items-center justify-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-white shrink-0" />
                  <span>ดูในฟีดหลัก</span>
                </button>
              )}

              {onDeleteVideo && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteVideo(selectedVideoForPlay.id);
                    setSelectedVideoForPlay(null);
                  }}
                  className="w-9 h-9 rounded-xl bg-red-600/80 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center transition shrink-0 border border-white/20"
                  title="ลบคลิปวิดีโอนี้"
                >
                  <Trash2 className="w-4 h-4 stroke-[2]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
