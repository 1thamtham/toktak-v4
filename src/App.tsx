import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Music,
  Home,
  ShoppingBag,
  Plus,
  Briefcase,
  User,
  Play,
  Volume2,
  VolumeX,
  Upload,
  Trash2,
  Bookmark,
  Download,
  Loader2,
  Search,
  ShoppingCart,
  Check,
  X,
  Star,
  Sparkles,
  Film,
  Send,
  CheckCircle2,
  Edit3,
  Copy,
  Camera,
  LogIn,
  LogOut
} from 'lucide-react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import {
  addCloudVideoComment,
  createCloudVideoDocument,
  deleteCloudVideoDocument,
  ensureUserDocuments,
  fetchPublicVideosOnce,
  fetchUserLikedVideoIds,
  setCloudCartItemQuantity,
  signInWithGoogle,
  signOutFirebaseUser,
  submitCloudServiceBooking,
  submitCloudShopOrder,
  subscribePublicVideos,
  subscribeSavedVideos,
  subscribeUserCart,
  subscribeUserProfile,
  subscribeVideoComments,
  toggleCloudSavedVideo,
  toggleCloudVideoLike,
  updateCloudProfile,
  uploadAvatarBlobToCloudStorage,
  uploadPosterDataUrlToCloudStorage,
  uploadVideoToCloudStorage,
  type CloudCommentRecord,
  type CloudVideoRecord
} from './services/firebaseService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type TabType = 'home' | 'shop' | 'upload' | 'services' | 'profile';

interface CommentItem {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface VideoItem {
  id: string;
  url: string; // HTTPS URL, data: URL, หรือ idb://<id> สำหรับวิดีโอที่เก็บใน IndexedDB
  posterUrl?: string;
  authorId?: string;
  storagePath?: string;
  posterStoragePath?: string;
  avatarUrl?: string;
  username: string;
  displayName: string;
  avatarColor: string;
  caption: string;
  song: string;
  likes: number;
  commentsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments: CommentItem[];
  feedCategory: 'foryou' | 'following';
  linkedProductId?: string;
  isUserCreated?: boolean;
  isCloudSynced?: boolean;
  createdAt: number;
}

interface ProductItem {
  id: string;
  name: string;
  category: 'แฟชั่น' | 'แก็ดเจ็ต' | 'ของแต่งบ้าน' | 'บิวตี้';
  price: number;
  originalPrice?: number;
  rating: number;
  soldCount: number;
  image: string;
  badge?: string;
  description: string;
}

interface CartItem {
  product: ProductItem;
  quantity: number;
}

interface ServiceItem {
  id: string;
  title: string;
  category: 'ตัดต่อคลิป' | 'รีวิวสินค้า' | 'กราฟิก' | 'ยิงแอด';
  providerName: string;
  providerHandle: string;
  rating: number;
  reviewsCount: number;
  price: number;
  turnaround: string;
  description: string;
  highlightTag: string;
}

interface ProfileInfo {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl?: string;
}

interface DownloadFallbackState {
  video: VideoItem;
  resolvedUrl: string;
  filename: string;
  isLocalBlob: boolean;
  shareFile?: File;
}

// ============================================================================
// STORAGE CONSTANTS & SELF-CONTAINED INDEXEDDB + LOCALSTORAGE HELPERS
// ============================================================================

const STORAGE_VIDEOS_KEY = 'toktak_light_videos_v1';
const STORAGE_PROFILE_KEY = 'toktak_light_profile_v1';
const STORAGE_CART_KEY = 'toktak_light_cart_v1';
const IDB_NAME = 'toktak_standalone_db';
const IDB_VERSION = 1;
const IDB_BLOBS_STORE = 'video_blobs';
const IDB_META_STORE = 'video_metadata';
const IDB_META_KEY = 'videos_snapshot';

const RELIABLE_STARTER_VIDEO_URLS: Record<string, { url: string; posterUrl: string }> = {
  'starter-1': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80'
  },
  'starter-2': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80'
  }
};

function migrateLegacyStarterVideos(list: VideoItem[]): VideoItem[] {
  return list.map((v) => {
    const replacement = RELIABLE_STARTER_VIDEO_URLS[v.id];
    if (
      replacement &&
      (!v.url || v.url.includes('interactive-examples.mdn.mozilla.net'))
    ) {
      return {
        ...v,
        url: replacement.url,
        posterUrl: v.posterUrl || replacement.posterUrl
      };
    }
    return v;
  });
}

function openTokTakDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }
    const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_BLOBS_STORE)) {
        db.createObjectStore(IDB_BLOBS_STORE);
      }
      if (!db.objectStoreNames.contains(IDB_META_STORE)) {
        db.createObjectStore(IDB_META_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * บันทึกไฟล์วิดีโอจริงลง IndexedDB โดยอ่าน ArrayBuffer ออกมาก่อนเปิด Transaction
 * เพื่อป้องกันปัญหา File reference หมดอายุหลังรีเฟรชหน้าจอบน iOS Safari / Chrome iOS / LINE
 */
async function saveVideoBlobToIDB(videoId: string, fileOrBlob: Blob): Promise<boolean> {
  try {
    const buffer = await fileOrBlob.arrayBuffer();
    const materializedBlob = new Blob([buffer], { type: fileOrBlob.type || 'video/mp4' });
    const db = await openTokTakDB();
    return await new Promise<boolean>((resolve) => {
      const tx = db.transaction(IDB_BLOBS_STORE, 'readwrite');
      const store = tx.objectStore(IDB_BLOBS_STORE);
      const req = store.put(materializedBlob, videoId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch {
    return false;
  }
}

async function getVideoBlobFromIDB(videoId: string): Promise<Blob | null> {
  try {
    const db = await openTokTakDB();
    return await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(IDB_BLOBS_STORE, 'readonly');
      const store = tx.objectStore(IDB_BLOBS_STORE);
      const req = store.get(videoId);
      req.onsuccess = () => {
        resolve(req.result instanceof Blob ? req.result : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function getAllVideoBlobsFromIDB(): Promise<Record<string, Blob>> {
  try {
    const db = await openTokTakDB();
    return await new Promise<Record<string, Blob>>((resolve) => {
      const map: Record<string, Blob> = {};
      const tx = db.transaction(IDB_BLOBS_STORE, 'readonly');
      const store = tx.objectStore(IDB_BLOBS_STORE);
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          if (typeof cursor.key === 'string' && cursor.value instanceof Blob) {
            map[cursor.key] = cursor.value;
          }
          cursor.continue();
        } else {
          resolve(map);
        }
      };
      req.onerror = () => resolve(map);
    });
  } catch {
    return {};
  }
}

async function deleteVideoBlobFromIDB(videoId: string): Promise<void> {
  try {
    const db = await openTokTakDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_BLOBS_STORE, 'readwrite');
      const store = tx.objectStore(IDB_BLOBS_STORE);
      const req = store.delete(videoId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore cleanup errors
  }
}

async function saveVideosMetadataToIDB(list: VideoItem[]): Promise<boolean> {
  try {
    const db = await openTokTakDB();
    return await new Promise<boolean>((resolve) => {
      const tx = db.transaction(IDB_META_STORE, 'readwrite');
      const store = tx.objectStore(IDB_META_STORE);
      const req = store.put(list, IDB_META_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch {
    return false;
  }
}

async function loadVideosMetadataFromIDB(): Promise<VideoItem[] | null> {
  try {
    const db = await openTokTakDB();
    return await new Promise<VideoItem[] | null>((resolve) => {
      const tx = db.transaction(IDB_META_STORE, 'readonly');
      const store = tx.objectStore(IDB_META_STORE);
      const req = store.get(IDB_META_KEY);
      req.onsuccess = () => {
        resolve(Array.isArray(req.result) ? (req.result as VideoItem[]) : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

function readBlobAsDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      resolve(typeof ev.target?.result === 'string' ? ev.target.result : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

function captureFrameFromVideoElement(video: HTMLVideoElement): string | undefined {
  try {
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return undefined;
    }
    const maxW = 360;
    const scale = Math.min(1, maxW / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // ตรวจสอบว่าเฟรมที่ดึงมาไม่ว่างเปล่า (ป้องกัน iOS WebKit วาดภาพโปร่งใส)
    const sample = ctx.getImageData(
      Math.floor(canvas.width / 2),
      Math.floor(canvas.height / 2),
      1,
      1
    ).data;
    if (sample[3] === 0) {
      return undefined;
    }
    return canvas.toDataURL('image/jpeg', 0.72);
  } catch {
    return undefined;
  }
}

/**
 * ดึงภาพเฟรมแรกของวิดีโอให้ติดจริงบน iOS Safari / Chrome iOS / LINE WebView
 * โดยฝังแท็ก <video> ชั่วคราวลงใน DOM แบบมองไม่เห็นเพื่อให้ WebKit ยอมถอดรหัสเฟรมภาพ
 */
function extractVideoPosterThumbnail(videoSrc: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || !videoSrc) {
      resolve(undefined);
      return;
    }

    let settled = false;
    const video = document.createElement('video');

    const cleanup = () => {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
      } catch {
        // ignore cleanup errors
      }
    };

    const finish = (val: string | undefined) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(hardTimer);
      cleanup();
      resolve(val);
    };

    const hardTimer = window.setTimeout(() => {
      finish(captureFrameFromVideoElement(video));
    }, 4500);

    try {
      const isLocalSrc = videoSrc.startsWith('blob:') || videoSrc.startsWith('data:');
      if (!isLocalSrc) {
        video.crossOrigin = 'anonymous';
      }
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      video.preload = 'auto';
      video.style.cssText =
        'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1;';
      document.body.appendChild(video);

      const tryCapture = () => {
        const frame = captureFrameFromVideoElement(video);
        if (frame) {
          finish(frame);
        }
      };

      video.onloadeddata = () => {
        tryCapture();
        if (!settled) {
          try {
            const targetTime = Math.min(0.25, (video.duration || 1) * 0.1);
            if (targetTime > 0.02) {
              video.currentTime = targetTime;
            }
          } catch {
            // ignore seek error
          }
          void video.play().catch(() => {});
        }
      };

      video.oncanplay = tryCapture;
      video.onseeked = tryCapture;
      video.ontimeupdate = tryCapture;
      video.onerror = () => finish(undefined);

      video.src = videoSrc;
      video.load();
      void video.play().catch(() => {});
    } catch {
      finish(undefined);
    }
  });
}

function persistVideosSafely(list: VideoItem[]) {
  // ป้องกันไม่ให้ blob: ชั่วคราวหลุดลง storage โดยคง idb://<id> ไว้เสมอ
  const safeList = list.map((v) => ({
    ...v,
    url: v.url.startsWith('blob:') ? `idb://${v.id}` : v.url
  }));

  // 1) บันทึกลง IndexedDB แบบเต็มรูปแบบ (ไม่จำกัด 5MB)
  void saveVideosMetadataToIDB(safeList);

  // 2) บันทึกลง localStorage (บีบอัด poster base64 อัตโนมัติหากเกินโควต้า 5MB)
  try {
    localStorage.setItem(STORAGE_VIDEOS_KEY, JSON.stringify(safeList));
  } catch {
    try {
      const compacted = safeList.map((v) => ({
        ...v,
        posterUrl: v.posterUrl && v.posterUrl.length > 20000 ? undefined : v.posterUrl,
        url: v.url.startsWith('data:video') ? `idb://${v.id}` : v.url
      }));
      localStorage.setItem(STORAGE_VIDEOS_KEY, JSON.stringify(compacted));
    } catch {
      // IndexedDB metadata fallback already saved above
    }
  }
}

function triggerAnchorDownload(href: string, filename: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getExtensionFromMime(mimeType?: string, url?: string): string {
  if (mimeType) {
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('quicktime') || mimeType.includes('mov')) return 'mov';
    if (mimeType.includes('ogg')) return 'ogv';
  }
  if (url) {
    const clean = url.split('?')[0].toLowerCase();
    if (clean.endsWith('.webm')) return 'webm';
    if (clean.endsWith('.mov')) return 'mov';
  }
  return 'mp4';
}

function getPlaybackSrc(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.includes('#') ? url : `${url}#t=0.001`;
  }
  return url;
}

/**
 * ย่อขนาดและตัดภาพโปรไฟล์ให้อยู่ในสัดส่วน 1:1 (256x256) เป็น JPEG
 * เพื่อบันทึกลง localStorage ได้อย่างถาวรโดยไม่เกินโควต้าหน่วยความจำ
 */
function compressAvatarImage(file: File): Promise<{ dataUrl: string; blob: Blob } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const size = 256;
        const minSide = Math.min(img.width || size, img.height || size);
        const sx = Math.max(0, Math.floor(((img.width || size) - minSide) / 2));
        const sy = Math.max(0, Math.floor(((img.height || size) - minSide) / 2));
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
          return;
        }
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              resolve({ dataUrl, blob });
            } else {
              resolve({ dataUrl, blob: file });
            }
          },
          'image/jpeg',
          0.84
        );
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      void readBlobAsDataUrl(file).then((dataUrl) =>
        resolve(dataUrl ? { dataUrl, blob: file } : null)
      );
    };
    img.src = objectUrl;
  });
}

// ============================================================================
// INITIAL DATA (CLEAN STARTER VIDEOS, RECOMMENDED SHOP PRODUCTS, SERVICES)
// ============================================================================

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'เสื้อยืด Oversize Cotton 100% มินิมอล',
    category: 'แฟชั่น',
    price: 299,
    originalPrice: 450,
    rating: 4.9,
    soldCount: 1420,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80',
    badge: 'ขายดีอันดับ 1',
    description: 'ผ้าฝ้ายแท้ทอละเอียด ใส่สบายไม่ร้อน ทรงสวยแมตช์ง่ายกับทุกลุคประจำวัน'
  },
  {
    id: 'prod-2',
    name: 'หูฟังไร้สาย ANC Studio White',
    category: 'แก็ดเจ็ต',
    price: 890,
    originalPrice: 1490,
    rating: 4.8,
    soldCount: 860,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    badge: 'ลด 40%',
    description: 'ตัดเสียงรบกวนรอบข้างได้ดีเยี่ยม แบตเตอรี่ใช้งานต่อเนื่องสูงสุด 30 ชั่วโมง'
  },
  {
    id: 'prod-3',
    name: 'โคมไฟตั้งโต๊ะมินิมอลไร้สาย LED',
    category: 'ของแต่งบ้าน',
    price: 459,
    originalPrice: 690,
    rating: 4.9,
    soldCount: 615,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    badge: 'สินค้าแนะนำ',
    description: 'ปรับความสว่างได้ 3 ระดับ แสงอุ่นถนอมสายตา ชาร์จผ่าน USB-C ได้สะดวก'
  },
  {
    id: 'prod-4',
    name: 'เซรั่มวิตามินซี Bright & Glow 30ml',
    category: 'บิวตี้',
    price: 390,
    originalPrice: 590,
    rating: 4.7,
    soldCount: 2150,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    badge: 'รีวิวแน่น',
    description: 'เนื้อบางเบาซึมไว ช่วยปรับผิวให้ดูกระจ่างใสเรียบเนียนอย่างเป็นธรรมชาติ'
  }
];

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'ตัดต่อคลิปสั้นสไตล์ไวรัล + ใส่ซับเด้ง',
    category: 'ตัดต่อคลิป',
    providerName: 'Studio Cut Pro',
    providerHandle: '@studiocut.th',
    rating: 4.9,
    reviewsCount: 184,
    price: 490,
    turnaround: 'ส่งงานภายใน 24 ชม.',
    description: 'ตัดต่อคลิปแนวตั้ง 15-60 วินาที พร้อมจังหวะเพลง ซาวด์เอฟเฟกต์ และซับไตเติลอ่านง่าย',
    highlightTag: 'ยอดนิยม'
  },
  {
    id: 'srv-2',
    title: 'ถ่ายคลิปรีวิวสินค้าปักตะกร้า (UGC Creator)',
    category: 'รีวิวสินค้า',
    providerName: 'มินนี่ รีวิวของดี',
    providerHandle: '@minnie.review',
    rating: 5.0,
    reviewsCount: 92,
    price: 950,
    turnaround: 'ส่งงาน 2-3 วัน',
    description: 'ถ่ายทำรีวิวจริงด้วยกล้อง 4K แสงธรรมชาติ พร้อมพากย์เสียงและสคริปต์ปิดการขาย',
    highlightTag: 'การันตีคุณภาพ'
  },
  {
    id: 'srv-3',
    title: 'ออกแบบปกคลิป & ภาพแบนเนอร์หน้าร้าน',
    category: 'กราฟิก',
    providerName: 'Minimal Craft Design',
    providerHandle: '@minimal.craft',
    rating: 4.8,
    reviewsCount: 127,
    price: 350,
    turnaround: 'ส่งงานภายใน 1 วัน',
    description: 'ดีไซน์ภาพปกวิดีโอและแบนเนอร์สินค้าโทนสว่างสะอาดตา ดึงดูดสายตาให้คนหยุดดู',
    highlightTag: 'คุ้มค่า'
  },
  {
    id: 'srv-4',
    title: 'วางแผนแคมเปญ & ยิงแอดร้านค้าวิดีโอสั้น',
    category: 'ยิงแอด',
    providerName: 'Growth Media Lab',
    providerHandle: '@growth.medialab',
    rating: 4.9,
    reviewsCount: 68,
    price: 1990,
    turnaround: 'ดูแลตลอด 14 วัน',
    description: 'วิเคราะห์กลุ่มเป้าหมาย ตั้งค่าโฆษณา และวัดผล ROAS รายวันเพื่อให้ยอดขายเติบโตจริง',
    highlightTag: 'สำหรับร้านค้า'
  }
];

const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'starter-1',
    url: RELIABLE_STARTER_VIDEO_URLS['starter-1'].url,
    posterUrl: RELIABLE_STARTER_VIDEO_URLS['starter-1'].posterUrl,
    username: '@minimal_bloom',
    displayName: 'Minimal Bloom',
    avatarColor: 'from-rose-400 to-orange-400',
    caption: 'เช้าวันใหม่สดใสกับโทนสว่างคลีนๆ 🌼✨ แวะดูสินค้าแนะนำในร้านค้าได้เลย',
    song: 'Morning Breeze (Acoustic) - Studio Sound',
    likes: 1280,
    isLiked: false,
    isSaved: false,
    comments: [
      { id: 'c1', author: '@ploy_studio', text: 'ภาพสีสวยละมุนมากเลยค่ะ 🌸', createdAt: '2 ชม.' }
    ],
    feedCategory: 'foryou',
    linkedProductId: 'prod-3',
    createdAt: 1700000002000
  },
  {
    id: 'starter-2',
    url: RELIABLE_STARTER_VIDEO_URLS['starter-2'].url,
    posterUrl: RELIABLE_STARTER_VIDEO_URLS['starter-2'].posterUrl,
    username: '@daily_lifestyle',
    displayName: 'Daily Lifestyle',
    avatarColor: 'from-sky-400 to-indigo-500',
    caption: 'ไอเทมเรียบง่ายที่ใส่ได้ทุกวัน 👕 กดที่ปุ่มสินค้าเพื่อสั่งซื้อได้เลย!',
    song: 'Lo-Fi Café Chill Beat',
    likes: 3420,
    isLiked: false,
    isSaved: false,
    comments: [
      { id: 'c2', author: '@ton_bkk', text: 'สั่งเสื้อไปเมื่อวาน ผ้านุ่มมากครับ', createdAt: '5 ชม.' }
    ],
    feedCategory: 'following',
    linkedProductId: 'prod-1',
    createdAt: 1700000001000
  }
];

const DEFAULT_PROFILE: ProfileInfo = {
  displayName: 'TokTak Creator',
  username: '@my_profile',
  bio: 'สร้างสรรค์คอนเทนต์วิดีโอสั้น & รีวิวของดีโทนมินิมอล ✨'
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VIDEOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return migrateLegacyStarterVideos(parsed);
        }
      }
    } catch {
      // Fallback to IndexedDB hydration in useEffect
    }
    return INITIAL_VIDEOS;
  });

  const [profile, setProfile] = useState<ProfileInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.username === 'string') {
          return { ...DEFAULT_PROFILE, ...parsed };
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // แมพเก็บ Blob Object URLs ที่คืนค่ามาจาก IndexedDB สำหรับวิดีโอที่ขึ้นต้นด้วย idb://
  const [hydratedBlobUrls, setHydratedBlobUrls] = useState<Record<string, string>>({});
  // ติดตามสถานะเฟรมวิดีโอที่พร้อมแสดงผลจริง เพื่อป้องกันภาพสีเทาระหว่างโหลดหรือใน LINE/Chrome iOS
  const [readyVideoIds, setReadyVideoIds] = useState<Record<string, boolean>>({});
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(null);
  const [downloadFallback, setDownloadFallback] = useState<DownloadFallbackState | null>(null);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [feedFilter, setFeedFilter] = useState<'foryou' | 'following'>('foryou');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [commentModalVideoId, setCommentModalVideoId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [serviceNote, setServiceNote] = useState('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileInfo>(profile);

  // Shop & Services Filter States
  const [shopQuery, setShopQuery] = useState('');
  const [shopCategory, setShopCategory] = useState<'ทั้งหมด' | ProductItem['category']>('ทั้งหมด');
  const [serviceCategory, setServiceCategory] = useState<'ทั้งหมด' | ServiceItem['category']>('ทั้งหมด');
  const [profileTab, setProfileTab] = useState<'mine' | 'liked' | 'saved'>('mine');

  // Firebase Auth & Cloud States
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [cloudVideos, setCloudVideos] = useState<CloudVideoRecord[]>([]);
  const [likedCloudIds, setLikedCloudIds] = useState<Set<string>>(new Set());
  const [savedCloudIds, setSavedCloudIds] = useState<Set<string>>(new Set());
  const [cloudCommentsMap, setCloudCommentsMap] = useState<Record<string, CommentItem[]>>({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Upload Form States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewPosterUrl, setPreviewPosterUrl] = useState<string>('');
  const [isPreviewReady, setIsPreviewReady] = useState<boolean>(false);
  const [uploadExternalUrl, setUploadExternalUrl] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [uploadSong, setUploadSong] = useState<string>('เสียงต้นฉบับ - TokTak Creator');
  const [uploadProductId, setUploadProductId] = useState<string>('');
  const [isSavingUpload, setIsSavingUpload] = useState<boolean>(false);

  const feedScrollRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const videosRef = useRef<VideoItem[]>(videos);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2800);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSigningIn(true);
    try {
      const user = await signInWithGoogle();
      showToast(`เข้าสู่ระบบสำเร็จ: ${user.displayName || user.email || 'ผู้ใช้ Google'}`);
      return user;
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-blocked') {
        showToast('เบราว์เซอร์บล็อกหน้าต่างล็อกอิน กรุณาเปิดลิงก์ใน Safari หรือ Chrome');
      } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        showToast('ไม่สามารถเข้าสู่ระบบ Google ได้ กรุณาลองใหม่อีกครั้ง');
      }
      return null;
    } finally {
      setIsSigningIn(false);
    }
  }, [showToast]);

  const handleGoogleSignOut = useCallback(async () => {
    try {
      await signOutFirebaseUser();
      setLikedCloudIds(new Set());
      setSavedCloudIds(new Set());
      showToast('ออกจากระบบเรียบร้อยแล้ว');
    } catch {
      showToast('ไม่สามารถออกจากระบบได้');
    }
  }, [showToast]);

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'draft' = 'profile') => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WebP)');
        return;
      }
      const compressed = await compressAvatarImage(file);
      if (!compressed) {
        showToast('ไม่สามารถอ่านไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
        return;
      }

      let finalAvatarUrl = compressed.dataUrl;
      if (firebaseUser) {
        const cloudAvatarUrl = await uploadAvatarBlobToCloudStorage(
          firebaseUser.uid,
          compressed.blob
        );
        if (cloudAvatarUrl) {
          finalAvatarUrl = cloudAvatarUrl;
        }
      }

      if (target === 'draft') {
        setProfileDraft((prev) => ({ ...prev, avatarUrl: finalAvatarUrl }));
      } else {
        setProfile((prev) => {
          const next = { ...prev, avatarUrl: finalAvatarUrl };
          if (firebaseUser) {
            void updateCloudProfile(firebaseUser.uid, next).catch(() => {});
          }
          return next;
        });
        setProfileDraft((prev) => ({ ...prev, avatarUrl: finalAvatarUrl }));
        showToast(
          firebaseUser
            ? 'อัปเดตและบันทึกรูปโปรไฟล์ขึ้นคลาวด์ Firebase แล้ว'
            : 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว'
        );
      }
    },
    [firebaseUser, showToast]
  );

  // ซิงค์รายการวิดีโอลง localStorage + IndexedDB ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    videosRef.current = videos;
    persistVideosSafely(videos);
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // กู้คืนข้อมูลจาก IndexedDB ทันทีเมื่อเปิดแอป/รีเฟรชหน้าจอ (รวมถึงทั้ง Metadata และไฟล์ Blob)
  useEffect(() => {
    let active = true;

    const hydrateFromIndexedDB = async () => {
      const [blobsMap, idbMetaList] = await Promise.all([
        getAllVideoBlobsFromIDB(),
        loadVideosMetadataFromIDB()
      ]);

      if (!active) return;

      const objectUrlMap: Record<string, string> = {};
      Object.entries(blobsMap).forEach(([clipId, blob]) => {
        objectUrlMap[clipId] = URL.createObjectURL(blob);
      });
      setHydratedBlobUrls((prev) => ({ ...prev, ...objectUrlMap }));

      if (idbMetaList && idbMetaList.length > 0) {
        const normalizedIdbMeta = migrateLegacyStarterVideos(idbMetaList);
        setVideos((prev) => {
          const prevIds = new Set(prev.map((v) => v.id));
          const missingInLocalStorage = normalizedIdbMeta.filter((v) => !prevIds.has(v.id));
          const updatedExisting = prev.map((v) => {
            const match = normalizedIdbMeta.find((m) => m.id === v.id);
            if (!v.posterUrl && match?.posterUrl) {
              return { ...v, posterUrl: match.posterUrl };
            }
            return v;
          });

          if (missingInLocalStorage.length === 0) {
            return updatedExisting;
          }

          return [...missingInLocalStorage, ...updatedExisting].sort(
            (a, b) => b.createdAt - a.createdAt
          );
        });
      }
    };

    void hydrateFromIndexedDB();

    const handleFlushOnHide = () => {
      persistVideosSafely(videosRef.current);
    };

    window.addEventListener('pagehide', handleFlushOnHide);
    window.addEventListener('beforeunload', handleFlushOnHide);
    return () => {
      active = false;
      window.removeEventListener('pagehide', handleFlushOnHide);
      window.removeEventListener('beforeunload', handleFlushOnHide);
    };
  }, []);

  // ติดตามสถานะ Firebase Auth & ซิงค์ข้อมูลผู้ใช้แบบเรียลไทม์
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!firebaseUser) {
      let active = true;
      void fetchPublicVideosOnce()
        .then((items) => {
          if (active) setCloudVideos(items);
        })
        .catch(() => {
          // Fallback silently to local/starter videos when offline
        });
      return () => {
        active = false;
      };
    }

    let cancelled = false;
    void ensureUserDocuments(firebaseUser)
      .then((cloudProf) => {
        if (cancelled) return;
        const nextProf: ProfileInfo = {
          displayName: cloudProf.displayName,
          username: cloudProf.username,
          bio: cloudProf.bio,
          avatarUrl: cloudProf.avatarUrl || undefined
        };
        setProfile(nextProf);
        setProfileDraft(nextProf);
      })
      .catch(() => {});

    const unsubProfile = subscribeUserProfile(firebaseUser.uid, (cloudProf) => {
      const nextProf: ProfileInfo = {
        displayName: cloudProf.displayName,
        username: cloudProf.username,
        bio: cloudProf.bio,
        avatarUrl: cloudProf.avatarUrl || undefined
      };
      setProfile(nextProf);
      setProfileDraft(nextProf);
    });

    const unsubVideos = subscribePublicVideos((items) => {
      setCloudVideos(items);
    });

    const unsubSaved = subscribeSavedVideos(firebaseUser.uid, (ids) => {
      setSavedCloudIds(ids);
    });

    const unsubCart = subscribeUserCart(firebaseUser.uid, (entries) => {
      const mapped: CartItem[] = [];
      for (const entry of entries) {
        const product = INITIAL_PRODUCTS.find((p) => p.id === entry.productId);
        if (product) {
          mapped.push({ product, quantity: entry.quantity });
        }
      }
      setCart(mapped);
    });

    return () => {
      cancelled = true;
      unsubProfile();
      unsubVideos();
      unsubSaved();
      unsubCart();
    };
  }, [authReady, firebaseUser]);

  // ซิงค์สถานะการกดถูกใจของผู้ใช้สำหรับวิดีโอบนคลาวด์
  useEffect(() => {
    if (!firebaseUser || cloudVideos.length === 0) return;
    let active = true;
    void fetchUserLikedVideoIds(
      firebaseUser.uid,
      cloudVideos.map((v) => v.id)
    ).then((likedSet) => {
      if (active) setLikedCloudIds(likedSet);
    });
    return () => {
      active = false;
    };
  }, [firebaseUser, cloudVideos]);

  // ซิงค์ความคิดเห็นจาก Firestore เมื่อเปิดหน้าต่างความคิดเห็นของคลิปคลาวด์
  useEffect(() => {
    if (!commentModalVideoId) return;
    const targetCloud = cloudVideos.find((v) => v.id === commentModalVideoId);
    if (!targetCloud) return;

    const unsub = subscribeVideoComments(commentModalVideoId, (records: CloudCommentRecord[]) => {
      const formatted: CommentItem[] = records.map((r) => ({
        id: r.id,
        author: r.author,
        text: r.text,
        createdAt: new Date(r.createdAtMs).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
      setCloudCommentsMap((prev) => ({ ...prev, [commentModalVideoId]: formatted }));
    });

    return () => unsub();
  }, [commentModalVideoId, cloudVideos]);

  // รวมรายการวิดีโอจาก Firebase Cloud กับวิดีโอในเครื่อง/เริ่มต้น (ไม่มีวันหายแม้เปิดจากเครื่องอื่นหรือ LINE)
  const resolvedVideos = useMemo<VideoItem[]>(() => {
    const cloudMapped: VideoItem[] = cloudVideos.map((cv) => ({
      id: cv.id,
      url: cv.url,
      posterUrl: cv.posterUrl,
      authorId: cv.authorId,
      storagePath: cv.storagePath,
      posterStoragePath: cv.posterStoragePath,
      avatarUrl: cv.avatarUrl,
      username: cv.username,
      displayName: cv.displayName,
      avatarColor: cv.avatarColor,
      caption: cv.caption,
      song: cv.song,
      likes: cv.likes,
      commentsCount: cv.commentsCount,
      isLiked: likedCloudIds.has(cv.id),
      isSaved: savedCloudIds.has(cv.id),
      comments: cloudCommentsMap[cv.id] || [],
      feedCategory: cv.feedCategory,
      linkedProductId: cv.linkedProductId,
      isUserCreated: Boolean(firebaseUser && cv.authorId === firebaseUser.uid),
      isCloudSynced: true,
      createdAt: cv.createdAtMs
    }));

    const cloudIds = new Set(cloudMapped.map((v) => v.id));
    const localResolved = videos
      .filter((v) => !cloudIds.has(v.id))
      .map((v) => {
        if (v.url.startsWith('idb://')) {
          const clipId = v.url.replace('idb://', '');
          const hydrated = hydratedBlobUrls[clipId];
          return {
            ...v,
            url: hydrated || v.url
          };
        }
        return v;
      });

    return [...cloudMapped, ...localResolved].sort((a, b) => b.createdAt - a.createdAt);
  }, [cloudVideos, videos, hydratedBlobUrls, likedCloudIds, savedCloudIds, cloudCommentsMap, firebaseUser]);

  // สร้างภาพปกพรีวิวอัตโนมัติสำหรับวิดีโอในเครื่องที่ยังไม่มี posterUrl (เช่น หลัง compaction หรือบน iOS)
  useEffect(() => {
    let cancelled = false;
    const missingPosters = resolvedVideos.filter(
      (v) =>
        !v.posterUrl &&
        !v.url.startsWith('idb://') &&
        (v.url.startsWith('blob:') || v.url.startsWith('data:'))
    );
    if (missingPosters.length === 0) return;

    const fillMissingPosters = async () => {
      for (const vid of missingPosters) {
        if (cancelled) return;
        const thumb = await extractVideoPosterThumbnail(vid.url);
        if (thumb && !cancelled) {
          setVideos((prev) =>
            prev.map((item) =>
              item.id === vid.id && !item.posterUrl ? { ...item, posterUrl: thumb } : item
            )
          );
        }
      }
    };

    void fillMissingPosters();
    return () => {
      cancelled = true;
    };
  }, [resolvedVideos]);

  // บันทึกภาพปกจากแท็ก <video> ที่กำลังถอดรหัสภาพอยู่จริงลง posterUrl เพื่อให้โปรไฟล์แสดงภาพชัดไม่เทา
  const handleSyncVideoPoster = useCallback((videoId: string, el: HTMLVideoElement | null) => {
    if (!el) return;
    setReadyVideoIds((prev) => (prev[videoId] ? prev : { ...prev, [videoId]: true }));
    const existing = videosRef.current.find((v) => v.id === videoId);
    if (existing && !existing.posterUrl) {
      const captured = captureFrameFromVideoElement(el);
      if (captured) {
        setVideos((prev) =>
          prev.map((item) =>
            item.id === videoId && !item.posterUrl ? { ...item, posterUrl: captured } : item
          )
        );
      }
    }
  }, []);

  const feedVideos = useMemo<VideoItem[]>(() => {
    if (feedFilter === 'following') {
      const followingOnly = resolvedVideos.filter(
        (v) => v.feedCategory === 'following' || v.isUserCreated
      );
      return followingOnly.length > 0 ? followingOnly : resolvedVideos;
    }
    return resolvedVideos;
  }, [resolvedVideos, feedFilter]);

  // รักษา currentIndex ให้อยู่ในช่วงเสมอเมื่อสลับฟิลเตอร์หรือลบคลิป
  useEffect(() => {
    if (feedVideos.length > 0 && currentIndex >= feedVideos.length) {
      setCurrentIndex(0);
    }
  }, [feedVideos.length, currentIndex]);

  // ควบคุมการเล่นวิดีโออัตโนมัติเฉพาะคลิปที่กำลังดูอยู่ในหน้าหลัก (รองรับ LINE & Chrome iOS/Android)
  useEffect(() => {
    if (activeTab !== 'home') {
      Object.values(videoRefs.current).forEach((el) => el?.pause());
      return;
    }

    const activeVideo = feedVideos[currentIndex] || feedVideos[0];
    feedVideos.forEach((vid, idx) => {
      const el = videoRefs.current[vid.id];
      if (!el) return;
      el.muted = idx === currentIndex ? isMuted : true;

      if (idx === currentIndex && activeVideo?.id === vid.id && !vid.url.startsWith('idb://')) {
        if (el.readyState === 0) {
          try {
            el.load();
          } catch {
            // ignore reload errors
          }
        }
        el.play()
          .then(() => {
            setIsPlaying(true);
            handleSyncVideoPoster(vid.id, el);
          })
          .catch(() => {
            if (!el.muted) {
              el.muted = true;
              setIsMuted(true);
              el.play()
                .then(() => {
                  setIsPlaying(true);
                  handleSyncVideoPoster(vid.id, el);
                })
                .catch(() => setIsPlaying(false));
            } else {
              setIsPlaying(false);
            }
          });
      } else {
        el.pause();
      }
    });
  }, [activeTab, currentIndex, feedVideos, isMuted, handleSyncVideoPoster]);

  const handleFeedScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (!container.clientHeight) return;
    const nextIdx = Math.round(container.scrollTop / container.clientHeight);
    if (nextIdx !== currentIndex && nextIdx >= 0 && nextIdx < feedVideos.length) {
      setCurrentIndex(nextIdx);
    }
  };

  const togglePlayVideo = (videoId: string) => {
    const el = videoRefs.current[videoId];
    if (!el) return;
    if (el.paused) {
      el.play()
        .then(() => {
          setIsPlaying(true);
          handleSyncVideoPoster(videoId, el);
        })
        .catch(() => setIsPlaying(false));
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleLike = async (videoId: string) => {
    const cloudTarget = cloudVideos.find((v) => v.id === videoId);
    if (cloudTarget) {
      if (!firebaseUser) {
        showToast('กรุณาเข้าสู่ระบบด้วย Google เพื่อกดถูกใจคลิป');
        return;
      }
      const currentlyLiked = likedCloudIds.has(videoId);
      setLikedCloudIds((prev) => {
        const next = new Set(prev);
        if (currentlyLiked) next.delete(videoId);
        else next.add(videoId);
        return next;
      });
      try {
        await toggleCloudVideoLike(firebaseUser.uid, videoId, currentlyLiked);
      } catch {
        setLikedCloudIds((prev) => {
          const rollback = new Set(prev);
          if (currentlyLiked) rollback.add(videoId);
          else rollback.delete(videoId);
          return rollback;
        });
        showToast('ไม่สามารถอัปเดตสถานะถูกใจได้');
      }
      return;
    }

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        const nextLiked = !v.isLiked;
        return {
          ...v,
          isLiked: nextLiked,
          likes: nextLiked ? v.likes + 1 : Math.max(0, v.likes - 1)
        };
      })
    );
  };

  const handleToggleBookmark = async (videoId: string) => {
    const cloudTarget = cloudVideos.find((v) => v.id === videoId);
    if (cloudTarget) {
      if (!firebaseUser) {
        showToast('กรุณาเข้าสู่ระบบด้วย Google เพื่อบันทึกรายการโปรด');
        return;
      }
      const currentlySaved = savedCloudIds.has(videoId);
      setSavedCloudIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.delete(videoId);
        else next.add(videoId);
        return next;
      });
      try {
        await toggleCloudSavedVideo(firebaseUser.uid, videoId, currentlySaved);
        showToast(!currentlySaved ? 'บันทึกลงรายการโปรดบนคลาวด์แล้ว' : 'นำออกจากรายการโปรดแล้ว');
      } catch {
        showToast('ไม่สามารถบันทึกรายการโปรดได้');
      }
      return;
    }

    const target = videos.find((v) => v.id === videoId);
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isSaved: !v.isSaved } : v))
    );
    if (target) {
      showToast(!target.isSaved ? 'บันทึกลงรายการโปรดของฉันแล้ว' : 'นำออกจากรายการโปรดแล้ว');
    }
  };

  /**
   * ฟังก์ชันบันทึก/ส่งออก/ดาวน์โหลดวิดีโอลงเครื่อง (ใช้ได้ทั้งบนฟีดหลักและใต้โปรไฟล์)
   * ดึงไฟล์จริงจาก IndexedDB (idb://), Blob URL, Data URL หรือ External MP4 Link
   * รองรับการเปิดใน Chrome iOS, Safari, LINE และ Android เพื่อนำไปเปิดที่ไหนก็ได้
   */
  const handleDownloadVideo = async (videoArg?: VideoItem) => {
    const targetVideo =
      videoArg ||
      feedVideos[currentIndex] ||
      feedVideos[0] ||
      resolvedVideos[currentIndex] ||
      resolvedVideos[0];

    if (!targetVideo) {
      showToast('กรุณารอสักครู่ วิดีโอกำลังเตรียมพร้อม');
      return;
    }

    setDownloadingVideoId(targetVideo.id);

    // บันทึกลงแท็บ "ที่บันทึก" ในหน้าโปรไฟล์ควบคู่ไปด้วยทันที
    setVideos((prev) =>
      prev.map((v) => (v.id === targetVideo.id ? { ...v, isSaved: true } : v))
    );

    const safeNameSlug = targetVideo.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isLineInApp = /Line\//i.test(ua);
    const isIOSDevice = /iPhone|iPad|iPod/i.test(ua);

    try {
      const videoEl = videoRefs.current[targetVideo.id];
      const domSrc = videoEl?.currentSrc || videoEl?.src || '';
      const rawUrl = targetVideo.url.startsWith('idb://')
        ? hydratedBlobUrls[targetVideo.id] || domSrc || targetVideo.url
        : targetVideo.url || domSrc;

      let videoBlob: Blob | null = null;

      // 1) ดึงไฟล์ Blob จาก IndexedDB โดยตรงหากเป็นคลิปที่เก็บในเครื่อง
      if (targetVideo.url.startsWith('idb://') || hydratedBlobUrls[targetVideo.id]) {
        videoBlob = await getVideoBlobFromIDB(targetVideo.id);
      }

      // 2) หากยังไม่ได้ Blob ให้ fetch จาก URL (รองรับ blob:, data:, และ https: ที่เปิด CORS)
      const cleanFetchUrl = rawUrl.split('#')[0];
      if (!videoBlob && cleanFetchUrl && !cleanFetchUrl.startsWith('idb://')) {
        try {
          const response = await fetch(cleanFetchUrl, { mode: 'cors' });
          if (response.ok) {
            const fetched = await response.blob();
            if (fetched.size > 0) {
              videoBlob = fetched;
            }
          }
        } catch {
          // หากเว็บปลายทางจำกัด CORS จะสลับไปใช้ Direct Link Fallback ด้านล่าง
        }
      }

      if (videoBlob && videoBlob.size > 0) {
        const ext = getExtensionFromMime(videoBlob.type, cleanFetchUrl);
        const filename = `TokTak-${safeNameSlug}.${ext}`;
        const shareFile = new File([videoBlob], filename, {
          type: videoBlob.type || 'video/mp4'
        });

        const navWithShare = navigator as Navigator & {
          canShare?: (data?: ShareData) => boolean;
        };

        // บน iPhone (Chrome iOS / Safari / LINE) ใช้ Native Share Sheet เพื่อ "บันทึกวิดีโอลงเครื่อง / เปิดในแอปอื่น" ได้ทันที
        if (
          (isIOSDevice || isLineInApp) &&
          typeof navWithShare.share === 'function' &&
          typeof navWithShare.canShare === 'function' &&
          navWithShare.canShare({ files: [shareFile] })
        ) {
          try {
            await navWithShare.share({
              files: [shareFile],
              title: `คลิปจาก ${targetVideo.displayName}`,
              text: targetVideo.caption
            });
            showToast('เปิดเมนูบันทึก/ส่งออกคลิปเรียบร้อยแล้ว');
            return;
          } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
              return;
            }
          }
        }

        const blobUrl = URL.createObjectURL(videoBlob);
        triggerAnchorDownload(blobUrl, filename);
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
        showToast('บันทึก/ดาวน์โหลดวิดีโอลงเครื่องเรียบร้อยแล้ว');

        if (isLineInApp || isIOSDevice) {
          setDownloadFallback({
            video: targetVideo,
            resolvedUrl: cleanFetchUrl.startsWith('http') ? cleanFetchUrl : blobUrl,
            filename,
            isLocalBlob: !cleanFetchUrl.startsWith('http'),
            shareFile
          });
        }
        return;
      }

      // 3) Fallback สำหรับลิงก์ MP4 ภายนอกที่จำกัด CORS
      if (cleanFetchUrl && !cleanFetchUrl.startsWith('idb://')) {
        const ext = getExtensionFromMime(undefined, cleanFetchUrl);
        const filename = `TokTak-${safeNameSlug}.${ext}`;
        triggerAnchorDownload(cleanFetchUrl, filename);
        setDownloadFallback({
          video: targetVideo,
          resolvedUrl: cleanFetchUrl,
          filename,
          isLocalBlob: false
        });
        showToast('กำลังดาวน์โหลดวิดีโอจากลิงก์ต้นฉบับ...');
        return;
      }

      showToast('กำลังเตรียมไฟล์วิดีโอ กรุณาลองกดอีกครั้งใน 1 วินาที');
    } finally {
      setDownloadingVideoId(null);
    }
  };

  const handleShareVideo = async (video: VideoItem) => {
    const shareText = `${video.displayName}: ${video.caption}`;
    const shareUrl = video.url.startsWith('http') ? video.url.split('#')[0] : window.location.href;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: `TokTak - ${video.displayName}`,
          text: shareText,
          url: shareUrl
        });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      }
      showToast('คัดลอกลิงก์/คำอธิบายคลิปเรียบร้อยแล้ว');
    } catch {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
        }
      } catch {
        // ignore
      }
      showToast('พร้อมแชร์คลิปนี้แล้ว');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentModalVideoId || !commentDraft.trim()) return;
    const text = commentDraft.trim();

    const cloudTarget = cloudVideos.find((v) => v.id === commentModalVideoId);
    if (cloudTarget) {
      if (!firebaseUser) {
        showToast('กรุณาเข้าสู่ระบบด้วย Google เพื่อแสดงความคิดเห็น');
        return;
      }
      setCommentDraft('');
      try {
        await addCloudVideoComment(
          firebaseUser.uid,
          commentModalVideoId,
          profile.username,
          text
        );
      } catch {
        showToast('ส่งความคิดเห็นไม่สำเร็จ กรุณาลองใหม่');
      }
      return;
    }

    const newComment: CommentItem = {
      id: `cmt-${Date.now()}`,
      author: profile.username,
      text,
      createdAt: 'เมื่อสักครู่'
    };
    setVideos((prev) =>
      prev.map((v) =>
        v.id === commentModalVideoId
          ? { ...v, comments: [...v.comments, newComment] }
          : v
      )
    );
    setCommentDraft('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const localPreview = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(localPreview);
    setPreviewPosterUrl('');
    setIsPreviewReady(false);
    setUploadExternalUrl('');
    if (!uploadCaption.trim()) {
      setUploadCaption(file.name.replace(/\.[^/.]+$/, '') + ' #TokTak');
    }
    void extractVideoPosterThumbnail(localPreview).then((thumb) => {
      if (thumb) setPreviewPosterUrl(thumb);
    });
    e.target.value = '';
  };

  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !uploadExternalUrl.trim()) {
      showToast('กรุณาเลือกไฟล์วิดีโอจากเครื่องหรือระบุลิงก์วิดีโอ');
      return;
    }

    setIsSavingUpload(true);
    setUploadProgress(0);
    const newId = `clip-${Date.now()}`;

    try {
      let persistedUrl = uploadExternalUrl.trim();
      let generatedPoster: string | undefined = previewPosterUrl || undefined;
      let cloudStoragePath: string | undefined;
      let cloudPosterPath: string | undefined;
      let uploadedToCloud = false;

      if (selectedFile) {
        const liveObjectUrl = URL.createObjectURL(selectedFile);
        if (!generatedPoster) {
          generatedPoster = await extractVideoPosterThumbnail(liveObjectUrl);
        }

        // แคชไฟล์ในเครื่องไว้เพื่อให้เล่นและบันทึกไฟล์ได้รวดเร็วเสมอ
        const savedToIdb = await saveVideoBlobToIDB(newId, selectedFile);
        if (savedToIdb) {
          setHydratedBlobUrls((prev) => ({ ...prev, [newId]: liveObjectUrl }));
        }

        // อัปโหลดไฟล์จริงขึ้น Firebase Cloud Storage + บันทึกข้อมูลลง Firestore หากเข้าสู่ระบบ Google แล้ว
        if (firebaseUser) {
          try {
            const storageRes = await uploadVideoToCloudStorage(
              firebaseUser.uid,
              newId,
              selectedFile,
              (pct) => setUploadProgress(pct)
            );
            persistedUrl = storageRes.downloadUrl;
            cloudStoragePath = storageRes.storagePath;

            if (generatedPoster && generatedPoster.startsWith('data:')) {
              const posterRes = await uploadPosterDataUrlToCloudStorage(
                firebaseUser.uid,
                newId,
                generatedPoster
              );
              if (posterRes) {
                generatedPoster = posterRes.downloadUrl;
                cloudPosterPath = posterRes.storagePath;
              }
            }

            await createCloudVideoDocument({
              id: newId,
              authorId: firebaseUser.uid,
              url: persistedUrl,
              posterUrl: generatedPoster,
              storagePath: cloudStoragePath,
              posterStoragePath: cloudPosterPath,
              username: profile.username,
              displayName: profile.displayName,
              avatarColor: 'from-rose-500 to-pink-500',
              avatarUrl: profile.avatarUrl,
              caption: uploadCaption.trim() || 'แชร์ช่วงเวลาดีๆ บน TokTak ✨ #TokTak',
              song: uploadSong.trim() || 'เสียงต้นฉบับ - TokTak Creator',
              feedCategory: 'foryou',
              linkedProductId: uploadProductId || undefined
            });
            uploadedToCloud = true;
          } catch (storageErr) {
            const code = (storageErr as { code?: string })?.code || '';
            if (code.includes('storage/')) {
              showToast('บันทึกในเครื่องแล้ว (โปรดเปิดใช้งาน Firebase Storage เพื่อซิงค์ไฟล์ข้ามเครื่อง)');
            } else {
              showToast('อัปโหลดขึ้นคลาวด์ไม่สำเร็จ จึงบันทึกสำรองไว้ในเครื่องชั่วคราว');
            }
          }
        }

        if (!uploadedToCloud) {
          if (savedToIdb) {
            persistedUrl = `idb://${newId}`;
          } else if (selectedFile.size <= 2.5 * 1024 * 1024) {
            const dataUrl = await readBlobAsDataUrl(selectedFile);
            persistedUrl = dataUrl || liveObjectUrl;
          } else {
            persistedUrl = liveObjectUrl;
          }
        }
      } else if (persistedUrl) {
        if (!generatedPoster) {
          generatedPoster = await extractVideoPosterThumbnail(persistedUrl);
        }
        if (firebaseUser && /^https?:\/\/.+/.test(persistedUrl)) {
          try {
            if (generatedPoster && generatedPoster.startsWith('data:')) {
              const posterRes = await uploadPosterDataUrlToCloudStorage(
                firebaseUser.uid,
                newId,
                generatedPoster
              );
              if (posterRes) {
                generatedPoster = posterRes.downloadUrl;
                cloudPosterPath = posterRes.storagePath;
              }
            }
            await createCloudVideoDocument({
              id: newId,
              authorId: firebaseUser.uid,
              url: persistedUrl,
              posterUrl: generatedPoster,
              posterStoragePath: cloudPosterPath,
              username: profile.username,
              displayName: profile.displayName,
              avatarColor: 'from-rose-500 to-pink-500',
              avatarUrl: profile.avatarUrl,
              caption: uploadCaption.trim() || 'แชร์ช่วงเวลาดีๆ บน TokTak ✨ #TokTak',
              song: uploadSong.trim() || 'เสียงต้นฉบับ - TokTak Creator',
              feedCategory: 'foryou',
              linkedProductId: uploadProductId || undefined
            });
            uploadedToCloud = true;
          } catch {
            // Fallback to local save below
          }
        }
      }

      if (!uploadedToCloud) {
        const newVideo: VideoItem = {
          id: newId,
          url: persistedUrl,
          posterUrl: generatedPoster,
          username: profile.username,
          displayName: profile.displayName,
          avatarColor: 'from-rose-500 to-pink-500',
          caption: uploadCaption.trim() || 'แชร์ช่วงเวลาดีๆ บน TokTak ✨ #TokTak',
          song: uploadSong.trim() || 'เสียงต้นฉบับ - TokTak Creator',
          likes: 1,
          isLiked: true,
          isSaved: false,
          comments: [],
          feedCategory: 'foryou',
          linkedProductId: uploadProductId || undefined,
          isUserCreated: true,
          createdAt: Date.now()
        };

        setVideos((prev) => {
          const next = [newVideo, ...prev];
          persistVideosSafely(next);
          return next;
        });
      }

      // รีเซ็ตฟอร์มและพากลับไปเล่นคลิปใหม่ทันทีที่หน้าแรก
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl('');
      setPreviewPosterUrl('');
      setIsPreviewReady(false);
      setUploadExternalUrl('');
      setUploadCaption('');
      setUploadProductId('');
      setFeedFilter('foryou');
      setCurrentIndex(0);
      setActiveTab('home');
      requestAnimationFrame(() => {
        feedScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      });
      if (uploadedToCloud) {
        showToast('อัปโหลดวิดีโอขึ้นคลาวด์ Firebase เรียบร้อยแล้ว!');
      } else if (!firebaseUser) {
        showToast('บันทึกคลิปในเครื่องแล้ว (เข้าสู่ระบบ Google เพื่อซิงค์คลาวด์ข้ามเครื่อง)');
      }
    } finally {
      setIsSavingUpload(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteUserVideo = async (videoId: string) => {
    const cloudTarget = cloudVideos.find((v) => v.id === videoId);
    if (cloudTarget && firebaseUser && cloudTarget.authorId === firebaseUser.uid) {
      try {
        await deleteCloudVideoDocument(
          videoId,
          cloudTarget.storagePath,
          cloudTarget.posterStoragePath
        );
      } catch {
        showToast('ไม่สามารถลบวิดีโอบนคลาวด์ได้');
        return;
      }
    }

    setVideos((prev) => {
      const next = prev.filter((v) => v.id !== videoId);
      persistVideosSafely(next);
      return next;
    });
    setHydratedBlobUrls((prev) => {
      if (!prev[videoId]) return prev;
      URL.revokeObjectURL(prev[videoId]);
      const copy = { ...prev };
      delete copy[videoId];
      return copy;
    });
    void deleteVideoBlobFromIDB(videoId);
    showToast('ลบวิดีโอเรียบร้อยแล้ว');
  };

  const handleJumpToVideoFromProfile = (videoId: string) => {
    setFeedFilter('foryou');
    setActiveTab('home');
    const targetIdx = resolvedVideos.findIndex((v) => v.id === videoId);
    if (targetIdx >= 0) {
      setCurrentIndex(targetIdx);
      requestAnimationFrame(() => {
        const container = feedScrollRef.current;
        if (container) {
          container.scrollTo({
            top: targetIdx * container.clientHeight,
            behavior: 'auto'
          });
        }
      });
    }
  };

  // Cart Handlers
  const handleAddToCart = (product: ProductItem) => {
    const existingItem = cart.find((c) => c.product.id === product.id);
    const nextQty = existingItem ? existingItem.quantity + 1 : 1;
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [{ product, quantity: 1 }, ...prev];
    });
    if (firebaseUser) {
      void setCloudCartItemQuantity(firebaseUser.uid, product.id, nextQty).catch(() => {});
    }
    showToast(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    const target = cart.find((c) => c.product.id === productId);
    const nextQty = target ? Math.max(0, target.quantity + delta) : 0;
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
    if (firebaseUser) {
      void setCloudCartItemQuantity(firebaseUser.uid, productId, nextQty).catch(() => {});
    }
  };

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalCartPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  // Filtered Lists for Shop, Services, and Profile
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((p) => {
      const matchCat = shopCategory === 'ทั้งหมด' || p.category === shopCategory;
      const matchQuery =
        !shopQuery.trim() ||
        p.name.toLowerCase().includes(shopQuery.trim().toLowerCase()) ||
        p.category.toLowerCase().includes(shopQuery.trim().toLowerCase());
      return matchCat && matchQuery;
    });
  }, [shopCategory, shopQuery]);

  const filteredServices = useMemo(() => {
    if (serviceCategory === 'ทั้งหมด') return INITIAL_SERVICES;
    return INITIAL_SERVICES.filter((s) => s.category === serviceCategory);
  }, [serviceCategory]);

  const myUploadedVideos = useMemo(
    () => resolvedVideos.filter((v) => v.isUserCreated || v.username === profile.username),
    [resolvedVideos, profile.username]
  );

  const profileGridVideos = useMemo(() => {
    if (profileTab === 'liked') return resolvedVideos.filter((v) => v.isLiked);
    if (profileTab === 'saved') return resolvedVideos.filter((v) => v.isSaved);
    return myUploadedVideos.length > 0 ? myUploadedVideos : resolvedVideos;
  }, [profileTab, resolvedVideos, myUploadedVideos]);

  const totalLikesCount = useMemo(
    () => resolvedVideos.reduce((sum, v) => sum + v.likes, 0),
    [resolvedVideos]
  );

  const activeCommentVideo = useMemo(
    () => resolvedVideos.find((v) => v.id === commentModalVideoId) || null,
    [resolvedVideos, commentModalVideoId]
  );

  return (
    <div className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-slate-100 flex justify-center items-center font-sans text-slate-900 select-none">
      {/* Mobile App Frame (Clean Light Mode Surface) */}
      <div className="relative w-full max-w-md h-[100dvh] bg-white sm:border-x sm:border-slate-200 flex flex-col overflow-hidden shadow-xl">
        {/* Global Toast Feedback */}
        {toastMessage && (
          <div className="absolute top-14 inset-x-4 z-50 flex justify-center pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200 shadow-lg rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-2 max-w-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* MAIN CONTENT AREA                                                */}
        {/* ================================================================ */}
        <main className="flex-1 min-h-0 relative overflow-hidden bg-white">
          {/* -------------------------------------------------------------- */}
          {/* TAB 1: HOME FEED                                               */}
          {/* -------------------------------------------------------------- */}
          {activeTab === 'home' && (
            <div className="relative w-full h-full bg-slate-950 overflow-hidden">
              {/* Light Mode Floating Header Bar */}
              <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
                <div className="w-9" />
                <div className="pointer-events-auto inline-flex items-center bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-full p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedFilter('following');
                      setCurrentIndex(0);
                      feedScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
                    }}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors ${
                      feedFilter === 'following'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    กำลังติดตาม
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedFilter('foryou');
                      setCurrentIndex(0);
                      feedScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
                    }}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors ${
                      feedFilter === 'foryou'
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    สำหรับคุณ
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  aria-label={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
                  className="pointer-events-auto w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 flex items-center justify-center shadow-sm active:scale-90 transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Snap-Scroll Vertical Video Feed */}
              <div
                ref={feedScrollRef}
                onScroll={handleFeedScroll}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {feedVideos.map((vid, idx) => {
                  const isHydrating = vid.url.startsWith('idb://');
                  const isVideoReady = Boolean(readyVideoIds[vid.id]);
                  const isDownloadingThis = downloadingVideoId === vid.id;
                  const linkedProduct = vid.linkedProductId
                    ? INITIAL_PRODUCTS.find((p) => p.id === vid.linkedProductId)
                    : undefined;

                  return (
                    <div
                      key={vid.id}
                      onClick={() => togglePlayVideo(vid.id)}
                      className="relative w-full h-full snap-start snap-always shrink-0 bg-slate-950 flex items-center justify-center overflow-hidden"
                    >
                      {/* ภาพพรีวิวที่ชัดเจนเสมอระหว่างรอเฟรมวิดีโอ (แก้ปัญหาหน้าจอสีเทา) */}
                      {vid.posterUrl ? (
                        <img
                          src={vid.posterUrl}
                          alt={vid.caption}
                          className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 z-0 bg-gradient-to-br ${vid.avatarColor} opacity-45 pointer-events-none`}
                        />
                      )}

                      {!isHydrating ? (
                        <video
                          ref={(el) => {
                            videoRefs.current[vid.id] = el;
                            if (el) {
                              el.setAttribute('webkit-playsinline', 'true');
                              el.setAttribute('x5-playsinline', 'true');
                              if (el.readyState >= 2 && !readyVideoIds[vid.id]) {
                                handleSyncVideoPoster(vid.id, el);
                              }
                            }
                          }}
                          src={getPlaybackSrc(vid.url)}
                          autoPlay={idx === currentIndex}
                          loop
                          playsInline
                          muted={isMuted || idx !== currentIndex}
                          preload={Math.abs(idx - currentIndex) <= 1 ? 'auto' : 'metadata'}
                          onLoadedData={(e) => handleSyncVideoPoster(vid.id, e.currentTarget)}
                          onCanPlay={(e) => handleSyncVideoPoster(vid.id, e.currentTarget)}
                          onPlaying={(e) => {
                            handleSyncVideoPoster(vid.id, e.currentTarget);
                            if (idx === currentIndex) {
                              setIsPlaying(true);
                            }
                          }}
                          className={`relative z-10 w-full h-full object-cover transition-opacity duration-200 ${
                            isVideoReady || !vid.posterUrl ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      ) : (
                        <div className="relative z-10 flex flex-col items-center justify-center text-white gap-2 bg-black/35 px-4 py-3 rounded-2xl backdrop-blur-xs">
                          <Film className="w-7 h-7 text-rose-400 animate-pulse" />
                          <span className="text-xs font-medium">กำลังโหลดวิดีโอจากเครื่อง...</span>
                        </div>
                      )}

                      {!isPlaying && idx === currentIndex && !isHydrating && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 pointer-events-none">
                          <div className="w-16 h-16 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                            <Play className="w-7 h-7 fill-slate-900 ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Subtle Bottom Legibility Scrim */}
                      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none z-20" />

                      {/* Bottom Left Video Info */}
                      <div className="absolute left-4 right-16 bottom-4 z-30 text-white space-y-2 pointer-events-none">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold drop-shadow">{vid.displayName}</span>
                          <span className="text-xs text-white/80 drop-shadow">{vid.username}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow">
                          {vid.caption}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/90">
                          <Music className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[210px]">{vid.song}</span>
                        </div>

                        {linkedProduct && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(linkedProduct);
                            }}
                            className="pointer-events-auto inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 rounded-full pl-2 pr-3 py-1.5 text-xs font-bold shadow-md border border-slate-200 active:scale-95 transition"
                          >
                            <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
                              <ShoppingBag className="w-3 h-3" />
                            </span>
                            <span className="truncate max-w-[140px]">{linkedProduct.name}</span>
                            <span className="text-rose-600">฿{linkedProduct.price}</span>
                          </button>
                        )}
                      </div>

                      {/* Right Side Action Rail */}
                      <div className="absolute right-3 bottom-4 z-30 flex flex-col items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-tr ${vid.avatarColor} border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs overflow-hidden`}
                        >
                          {vid.avatarUrl ? (
                            <img
                              src={vid.avatarUrl}
                              alt={vid.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            vid.displayName.slice(0, 2).toUpperCase()
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleToggleLike(vid.id);
                          }}
                          className="flex flex-col items-center gap-0.5 active:scale-90 transition"
                        >
                          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center">
                            <Heart
                              className={`w-4 h-4 ${
                                vid.isLiked
                                  ? 'fill-rose-500 text-rose-500'
                                  : 'text-slate-800'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-white drop-shadow">
                            {vid.likes.toLocaleString()}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentModalVideoId(vid.id);
                          }}
                          className="flex flex-col items-center gap-0.5 active:scale-90 transition"
                        >
                          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-800">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-white drop-shadow">
                            {Math.max(vid.comments.length, vid.commentsCount ?? 0)}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleToggleBookmark(vid.id);
                          }}
                          className="flex flex-col items-center gap-0.5 active:scale-90 transition"
                        >
                          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center">
                            <Bookmark
                              className={`w-4 h-4 ${
                                vid.isSaved
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-800'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-white drop-shadow">
                            {vid.isSaved ? 'รายการโปรด' : 'โปรด'}
                          </span>
                        </button>

                        {/* ปุ่มบันทึก/ดาวน์โหลดวิดีโอที่กำลังเล่นอยู่ลงเครื่อง หรือเปิดในแอปอื่น */}
                        <button
                          type="button"
                          disabled={isDownloadingThis}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDownloadVideo(vid);
                          }}
                          aria-label="บันทึกคลิปลงเครื่อง"
                          className="flex flex-col items-center gap-0.5 active:scale-90 transition disabled:opacity-75"
                        >
                          <div className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-900">
                            {isDownloadingThis ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-white drop-shadow">
                            {isDownloadingThis ? 'กำลังโหลด' : 'บันทึก'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleShareVideo(vid);
                          }}
                          className="flex flex-col items-center gap-0.5 active:scale-90 transition"
                        >
                          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-800">
                            <Share2 className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-white drop-shadow">แชร์</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* TAB 2: SHOP (LIGHT MODE RECOMMENDED PRODUCTS)                  */}
          {/* -------------------------------------------------------------- */}
          {activeTab === 'shop' && (
            <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
              <header className="bg-white border-b border-slate-200 px-4 pt-4 pb-3 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-extrabold text-slate-900">ร้านค้าแนะนำ</h1>
                    <p className="text-xs text-slate-500">คัดสรรสินค้าคุณภาพดีจากครีเอเตอร์</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>ตะกร้า</span>
                    {totalCartItems > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] leading-none">
                        {totalCartItems}
                      </span>
                    )}
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={shopQuery}
                    onChange={(e) => setShopQuery(e.target.value)}
                    placeholder="ค้นหาสินค้าแนะนำ..."
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-400"
                  />
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  {(['ทั้งหมด', 'แฟชั่น', 'แก็ดเจ็ต', 'ของแต่งบ้าน', 'บิวตี้'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setShopCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
                        shopCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 content-start">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-700">{product.rating}</span>
                          <span>• ขายแล้ว {product.soldCount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-sm font-extrabold text-rose-600">
                            ฿{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through ml-1">
                              ฿{product.originalPrice}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold active:scale-95 transition"
                        >
                          + ตะกร้า
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* TAB 3: UPLOAD VIDEO (+) WITH LOCAL INDEXEDDB PERSISTENCE       */}
          {/* -------------------------------------------------------------- */}
          {activeTab === 'upload' && (
            <div className="w-full h-full bg-white flex flex-col overflow-hidden">
              <header className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap shrink-0 py-1 px-1"
                >
                  ยกเลิก
                </button>
                <h1 className="text-sm font-extrabold text-slate-900 truncate">สร้างวิดีโอใหม่</h1>
                {!firebaseUser && authReady ? (
                  <button
                    type="button"
                    disabled={isSigningIn}
                    onClick={() => void handleGoogleSignIn()}
                    title="เข้าสู่ระบบด้วย Google เพื่ออัปโหลดขึ้นคลาวด์ Firebase"
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold active:scale-95 transition whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isSigningIn ? 'กำลังเข้า...' : 'เข้าสู่ระบบ'}</span>
                  </button>
                ) : (
                  <div className="w-10 shrink-0" />
                )}
              </header>

              <form
                onSubmit={handlePublishVideo}
                className="flex-1 min-h-0 flex flex-col overflow-hidden"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2.5 space-y-2.5">
                  {/* Video File Picker / Compact Live Preview */}
                  {previewUrl || uploadExternalUrl ? (
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-2">
                      <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-slate-950 shrink-0 flex items-center justify-center">
                        {previewPosterUrl && (
                          <img
                            src={previewPosterUrl}
                            alt="ตัวอย่างวิดีโอ"
                            className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none"
                          />
                        )}
                        <video
                          ref={(el) => {
                            if (el) {
                              el.setAttribute('webkit-playsinline', 'true');
                              el.setAttribute('x5-playsinline', 'true');
                            }
                          }}
                          src={getPlaybackSrc(previewUrl || uploadExternalUrl)}
                          autoPlay
                          loop
                          playsInline
                          muted
                          preload="auto"
                          onLoadedData={(e) => {
                            setIsPreviewReady(true);
                            if (!previewPosterUrl) {
                              const cap = captureFrameFromVideoElement(e.currentTarget);
                              if (cap) setPreviewPosterUrl(cap);
                            }
                          }}
                          onCanPlay={() => setIsPreviewReady(true)}
                          className={`relative z-10 w-full h-full object-cover transition-opacity duration-200 ${
                            isPreviewReady || !previewPosterUrl ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {selectedFile ? selectedFile.name : 'วิดีโอจากลิงก์ภายนอก'}
                        </p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {selectedFile
                            ? `ขนาด ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • พร้อมโพสต์`
                            : 'พร้อมโพสต์ขึ้นฟีด'}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
                          >
                            เปลี่ยนคลิป
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                              setSelectedFile(null);
                              setPreviewUrl('');
                              setPreviewPosterUrl('');
                              setIsPreviewReady(false);
                              setUploadExternalUrl('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[11px] font-semibold text-rose-600 whitespace-nowrap transition"
                          >
                            ลบออก
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/40 rounded-xl py-2 px-3 flex flex-row items-center justify-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          เลือกไฟล์วิดีโอจากเครื่องของคุณ
                        </p>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                          รองรับ MP4, MOV, WebM • บันทึกถาวรลงเครื่องไม่มีหายเมื่อรีเฟรช
                        </p>
                      </div>
                    </button>
                  )}

                  {!selectedFile && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        หรือวางลิงก์วิดีโอ (MP4 URL)
                      </label>
                      <input
                        type="url"
                        value={uploadExternalUrl}
                        onChange={(e) => {
                          setUploadExternalUrl(e.target.value);
                          setIsPreviewReady(false);
                        }}
                        placeholder="https://example.com/clip.mp4"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      คำอธิบายคลิป (Caption)
                    </label>
                    <textarea
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="เล่าเรื่องราวหรือรีวิวสินค้าของคุณ..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-400 resize-none"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto no-scrollbar">
                      {['#TokTak', '#รีวิวของดี', '#ของมันต้องมี', '#มินิมอล'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setUploadCaption((prev) =>
                              prev.includes(tag) ? prev : `${prev ? prev + ' ' : ''}${tag}`
                            )
                          }
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap shrink-0 transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                        เพลงประกอบ
                      </label>
                      <input
                        type="text"
                        value={uploadSong}
                        onChange={(e) => setUploadSong(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                        ปักตะกร้าสินค้าแนะนำ
                      </label>
                      <select
                        value={uploadProductId}
                        onChange={(e) => setUploadProductId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-400"
                      >
                        <option value="">ไม่ระบุสินค้า</option>
                        {INITIAL_PRODUCTS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (฿{p.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2.5 border-t border-slate-100 bg-white shrink-0">
                  <button
                    type="submit"
                    disabled={isSavingUpload}
                    className="w-full h-11 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold px-4 rounded-xl text-sm shadow-sm active:scale-[0.99] transition flex items-center justify-center whitespace-nowrap"
                  >
                    {isSavingUpload
                      ? uploadProgress > 0
                        ? `กำลังอัปโหลดขึ้นคลาวด์ Firebase ${uploadProgress}%`
                        : 'กำลังอัปโหลดและบันทึกวิดีโอ...'
                      : firebaseUser
                      ? 'โพสต์วิดีโอขึ้นคลาวด์ Firebase ทันที'
                      : 'โพสต์วิดีโอขึ้นฟีดทันที'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* TAB 4: SERVICES (LIGHT MODE CREATOR & SHOP SERVICES)           */}
          {/* -------------------------------------------------------------- */}
          {activeTab === 'services' && (
            <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
              <header className="bg-white border-b border-slate-200 px-4 pt-4 pb-3 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-extrabold text-slate-900">ศูนย์บริการครีเอเตอร์</h1>
                    <p className="text-xs text-slate-500">
                      ตัวช่วยปั้นช่อง ตัดต่อ รีวิว และโปรโมทร้านค้า
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {(['ทั้งหมด', 'ตัดต่อคลิป', 'รีวิวสินค้า', 'กราฟิก', 'ยิงแอด'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setServiceCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
                          serviceCategory === cat
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {filteredServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 mb-1.5">
                          {srv.category} • {srv.highlightTag}
                        </span>
                        <h2 className="text-sm font-bold text-slate-900 leading-snug">
                          {srv.title}
                        </h2>
                      </div>
                      <span className="text-sm font-extrabold text-rose-600 shrink-0">
                        ฿{srv.price.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500">
                        <span className="font-bold text-slate-800">{srv.providerName}</span>
                        <span className="mx-1.5">•</span>
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {srv.rating} ({srv.reviewsCount})
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {srv.turnaround}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedService(srv);
                          setServiceNote('');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold active:scale-95 transition"
                      >
                        ติดต่อจองคิว
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* TAB 5: PROFILE (ME) - SHOWS CRISP VIDEO COVERS & EXPORT BUTTON */}
          {/* -------------------------------------------------------------- */}
          {activeTab === 'profile' && (
            <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
              <div className="px-5 pt-6 pb-4 flex flex-col items-center text-center border-b border-slate-100">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => avatarInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      avatarInputRef.current?.click();
                    }
                  }}
                  aria-label="อัปโหลดรูปโปรไฟล์"
                  title="แตะเพื่อเปลี่ยนรูปโปรไฟล์"
                  className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-sm cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xl font-extrabold text-rose-600 overflow-hidden">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile.displayName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center shadow">
                    <Camera className="w-3 h-3" />
                  </span>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleAvatarUpload(e, 'profile')}
                  className="hidden"
                />
                <h1 className="text-base font-extrabold text-slate-900 mt-3">
                  {profile.displayName}
                </h1>
                <p className="text-xs text-slate-500">{profile.username}</p>
                <p className="text-xs text-slate-700 mt-2 max-w-xs leading-relaxed">
                  {profile.bio}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDraft(profile);
                      setIsEditProfileOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไขโปรไฟล์</span>
                  </button>

                  {firebaseUser ? (
                    <button
                      type="button"
                      onClick={() => void handleGoogleSignOut()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSigningIn}
                      onClick={() => void handleGoogleSignIn()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{isSigningIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}</span>
                    </button>
                  )}
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-3 gap-6 mt-5 w-full max-w-xs">
                  <div>
                    <p className="text-base font-extrabold text-slate-900">
                      {resolvedVideos.length}
                    </p>
                    <p className="text-[11px] text-slate-500">วิดีโอทั้งหมด</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900">12.4K</p>
                    <p className="text-[11px] text-slate-500">ผู้ติดตาม</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900">
                      {totalLikesCount.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500">ถูกใจรวม</p>
                  </div>
                </div>
              </div>

              {/* Profile Tabs */}
              <div className="grid grid-cols-3 border-b border-slate-200 bg-white sticky top-0 z-10">
                <button
                  type="button"
                  onClick={() => setProfileTab('mine')}
                  className={`py-2.5 text-xs font-bold border-b-2 transition ${
                    profileTab === 'mine'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  วิดีโอ ({myUploadedVideos.length > 0 ? myUploadedVideos.length : resolvedVideos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab('liked')}
                  className={`py-2.5 text-xs font-bold border-b-2 transition ${
                    profileTab === 'liked'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  ถูกใจ
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab('saved')}
                  className={`py-2.5 text-xs font-bold border-b-2 transition ${
                    profileTab === 'saved'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  ที่บันทึก
                </button>
              </div>

              {/* 3-Column Video Grid (แสดงภาพชัด + ปุ่มบันทึก/ส่งออกไปเปิดที่ไหนก็ได้) */}
              {profileGridVideos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center text-slate-400">
                  <Film className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-500">ยังไม่มีวิดีโอในหมวดนี้</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-0.5 p-0.5 pb-6">
                  {profileGridVideos.map((vid) => {
                    const isHydrating = vid.url.startsWith('idb://');
                    const isDownloadingThis = downloadingVideoId === vid.id;
                    return (
                      <div
                        key={vid.id}
                        onClick={() => handleJumpToVideoFromProfile(vid.id)}
                        className="relative aspect-[9/16] bg-slate-900 overflow-hidden cursor-pointer group"
                      >
                        {/* พื้นหลังไล่สีกรณีโหลดเฟรมแรกอยู่ (ไม่แสดงกล่องสีเทาเปล่า) */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${vid.avatarColor} opacity-85 flex items-center justify-center`}
                        >
                          <Film className="w-6 h-6 text-white/75" />
                        </div>

                        {vid.posterUrl ? (
                          <img
                            src={vid.posterUrl}
                            alt={vid.caption}
                            className="relative z-10 w-full h-full object-cover"
                          />
                        ) : (
                          !isHydrating && (
                            <video
                              ref={(el) => {
                                if (el) {
                                  el.setAttribute('webkit-playsinline', 'true');
                                  el.setAttribute('x5-playsinline', 'true');
                                }
                              }}
                              src={getPlaybackSrc(vid.url)}
                              muted
                              autoPlay
                              loop
                              playsInline
                              preload="auto"
                              onLoadedData={(e) => handleSyncVideoPoster(vid.id, e.currentTarget)}
                              onPlaying={(e) => handleSyncVideoPoster(vid.id, e.currentTarget)}
                              className="relative z-10 w-full h-full object-cover"
                            />
                          )
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-20 flex items-center justify-between text-white text-[10px] font-semibold">
                          <span className="inline-flex items-center gap-0.5">
                            <Play className="w-2.5 h-2.5 fill-white" />
                            {vid.likes}
                          </span>
                        </div>

                        {/* ปุ่มบันทึก/ส่งออกคลิปใต้โปรไฟล์เพื่อนำไปเปิดที่ไหนก็ได้ */}
                        <button
                          type="button"
                          disabled={isDownloadingThis}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDownloadVideo(vid);
                          }}
                          title="บันทึก/ส่งออกคลิปนี้"
                          className="absolute top-1.5 left-1.5 z-30 w-6 h-6 rounded-full bg-white/95 hover:bg-slate-900 hover:text-white text-slate-800 flex items-center justify-center shadow-sm transition"
                        >
                          {isDownloadingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                        </button>

                        {vid.isUserCreated && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDeleteUserVideo(vid.id);
                            }}
                            title="ลบวิดีโอนี้"
                            className="absolute top-1.5 right-1.5 z-30 w-6 h-6 rounded-full bg-white/95 hover:bg-rose-500 hover:text-white text-slate-700 flex items-center justify-center shadow-sm transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ================================================================ */}
        {/* BOTTOM TAB BAR (LIGHT MODE - FIXED AT BOTTOM)                    */}
        {/* 5 ปุ่ม: หน้าหลัก | ร้านค้า | ปุ่มบวก (+) | บริการ | ฉัน            */}
        {/* ================================================================ */}
        <nav className="h-16 bg-white border-t border-slate-200 px-1 pb-[env(safe-area-inset-bottom)] flex items-center justify-around shrink-0 z-30">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'home' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className={`text-[10px] mt-0.5 ${activeTab === 'home' ? 'font-extrabold' : 'font-medium'}`}>
              หน้าหลัก
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'shop' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 ${activeTab === 'shop' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className={`text-[10px] mt-0.5 ${activeTab === 'shop' ? 'font-extrabold' : 'font-medium'}`}>
              ร้านค้า
            </span>
            {totalCartItems > 0 && (
              <span className="absolute top-0.5 right-3.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Center Plus (+) Button */}
          <div className="flex-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              aria-label="อัปโหลดวิดีโอใหม่"
              className="relative w-12 h-8 flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="absolute inset-0 bg-cyan-400 rounded-xl -translate-x-0.5" />
              <span className="absolute inset-0 bg-rose-500 rounded-xl translate-x-0.5" />
              <span className="relative w-10 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xs">
                <Plus className="w-5 h-5 stroke-[2.8]" />
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'services' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Briefcase className={`w-5 h-5 ${activeTab === 'services' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className={`text-[10px] mt-0.5 ${activeTab === 'services' ? 'font-extrabold' : 'font-medium'}`}>
              บริการ
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'profile' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className={`text-[10px] mt-0.5 ${activeTab === 'profile' ? 'font-extrabold' : 'font-medium'}`}>
              ฉัน
            </span>
          </button>
        </nav>

        {/* ================================================================ */}
        {/* MODALS & DRAWERS (LIGHT MODE)                                    */}
        {/* ================================================================ */}

        {/* Save / Export / Open Anywhere Sheet (รองรับ iPhone Chrome / Safari / LINE) */}
        {downloadFallback && (
          <div
            onClick={() => setDownloadFallback(null)}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-end"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-4 space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  บันทึกและนำคลิปไปเปิดที่อื่น
                </h3>
                <button
                  type="button"
                  onClick={() => setDownloadFallback(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                คลิป <span className="font-bold text-slate-900">{downloadFallback.video.displayName}</span>{' '}
                ถูกบันทึกไว้ในแท็บ "ที่บันทึก" แล้ว สามารถกดบันทึกไฟล์วิดีโอลงแอป รูปภาพ / ไฟล์
                หรือส่งต่อไปเปิดในแอปอื่นได้ทันที
              </p>
              <div className="flex flex-col gap-2">
                {downloadFallback.shareFile && typeof navigator.share === 'function' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!downloadFallback.shareFile) return;
                      try {
                        await navigator.share({
                          files: [downloadFallback.shareFile],
                          title: `TokTak - ${downloadFallback.video.displayName}`,
                          text: downloadFallback.video.caption
                        });
                        showToast('เปิดเมนูส่งออกคลิปเรียบร้อยแล้ว');
                      } catch {
                        // ignore user cancel
                      }
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>บันทึกลงรูปภาพ / ส่งไปแอปอื่น</span>
                  </button>
                )}
                <div className="flex gap-2">
                  <a
                    href={downloadFallback.resolvedUrl}
                    download={downloadFallback.filename}
                    rel="noopener noreferrer"
                    onClick={() => {
                      showToast('กำลังเริ่มดาวน์โหลดไฟล์วิดีโอ...');
                    }}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลดไฟล์ MP4</span>
                  </a>
                  {!downloadFallback.isLocalBlob && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (navigator.clipboard) {
                            await navigator.clipboard.writeText(downloadFallback.resolvedUrl);
                          }
                          showToast('คัดลอกลิงก์วิดีโอแล้ว');
                        } catch {
                          showToast('ไม่สามารถคัดลอกลิงก์ได้');
                        }
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกลิงก์</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comment Drawer */}
        {activeCommentVideo && (
          <div
            onClick={() => setCommentModalVideoId(null)}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-end"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl max-h-[70%] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">
                  ความคิดเห็น ({activeCommentVideo.comments.length})
                </span>
                <button
                  type="button"
                  onClick={() => setCommentModalVideoId(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeCommentVideo.comments.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">
                    ยังไม่มีความคิดเห็น เป็นคนแรกที่คอมเมนต์เลย!
                  </p>
                ) : (
                  activeCommentVideo.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {c.author.replace('@', '').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-slate-800">
                          {c.author}{' '}
                          <span className="font-normal text-slate-400 ml-1">{c.createdAt}</span>
                        </p>
                        <p className="text-xs text-slate-700 mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form
                onSubmit={handleAddComment}
                className="p-3 border-t border-slate-100 flex items-center gap-2 bg-slate-50"
              >
                <input
                  type="text"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="พิมพ์ความคิดเห็นของคุณ..."
                  className="flex-1 bg-white border border-slate-200 rounded-full px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-end"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative h-56 bg-slate-100">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 text-slate-800 flex items-center justify-center shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {selectedProduct.name}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-extrabold text-rose-600">฿{selectedProduct.price}</p>
                    {selectedProduct.originalPrice && (
                      <p className="text-xs text-slate-400 line-through">
                        ฿{selectedProduct.originalPrice}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedProduct.description}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition"
                  >
                    เพิ่มลงตะกร้าสินค้า
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shopping Cart Modal */}
        {isCartOpen && (
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-end"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl max-h-[75%] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">
                  ตะกร้าสินค้า ({totalCartItems})
                </span>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">
                    ยังไม่มีสินค้าในตะกร้า เลือกดูสินค้าแนะนำได้เลย!
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs font-extrabold text-rose-600 mt-0.5">
                          ฿{item.product.price * item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(item.product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(item.product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-white space-y-2.5">
                  <div className="flex items-center justify-between text-sm font-extrabold">
                    <span className="text-slate-600">ยอดรวมทั้งหมด</span>
                    <span className="text-rose-600">฿{totalCartPrice.toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const snapshotCart = [...cart];
                      const itemsSummary = snapshotCart
                        .map((item) => `${item.product.name} x${item.quantity}`)
                        .join(', ');
                      if (firebaseUser && snapshotCart.length > 0) {
                        try {
                          await submitCloudShopOrder({
                            uid: firebaseUser.uid,
                            productIds: snapshotCart.map((c) => c.product.id),
                            totalPrice: totalCartPrice,
                            totalItems: totalCartItems,
                            itemsSummary
                          });
                        } catch {
                          showToast('ไม่สามารถบันทึกคำสั่งซื้อขึ้นคลาวด์ได้');
                          return;
                        }
                      }
                      setCart([]);
                      setIsCartOpen(false);
                      showToast('สั่งซื้อสินค้าเรียบร้อยแล้ว! ขอบคุณที่ใช้บริการ');
                    }}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl text-xs transition"
                  >
                    ยืนยันคำสั่งซื้อ
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Booking Modal */}
        {selectedService && (
          <div
            onClick={() => setSelectedService(null)}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-end"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-4 space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">ติดต่อจองคิวบริการ</h3>
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-900">{selectedService.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  โดย {selectedService.providerName} • ฿{selectedService.price.toLocaleString()}
                </p>
              </div>
              <textarea
                value={serviceNote}
                onChange={(e) => setServiceNote(e.target.value)}
                rows={3}
                placeholder="ระบุรายละเอียดงานที่ต้องการให้ครีเอเตอร์ช่วยดูแล..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-rose-400 resize-none"
              />
              <button
                type="button"
                onClick={async () => {
                  if (firebaseUser && selectedService) {
                    try {
                      await submitCloudServiceBooking({
                        uid: firebaseUser.uid,
                        serviceId: selectedService.id,
                        serviceTitle: selectedService.title,
                        price: selectedService.price,
                        note: serviceNote
                      });
                    } catch {
                      showToast('ไม่สามารถบันทึกการจองขึ้นคลาวด์ได้');
                      return;
                    }
                  }
                  setSelectedService(null);
                  setServiceNote('');
                  showToast('ส่งคำขอจองบริการเรียบร้อยแล้ว ทีมงานจะติดต่อกลับเร็วๆ นี้');
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ยืนยันส่งคำขอจองบริการ</span>
              </button>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditProfileOpen && (
          <div
            onClick={() => setIsEditProfileOpen(false)}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-3xl p-5 space-y-3 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">แก้ไขโปรไฟล์</h3>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 pb-1">
                <label className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 cursor-pointer shrink-0">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-extrabold text-rose-600 overflow-hidden">
                    {profileDraft.avatarUrl ? (
                      <img
                        src={profileDraft.avatarUrl}
                        alt={profileDraft.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profileDraft.displayName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center">
                    <Camera className="w-2.5 h-2.5" />
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => void handleAvatarUpload(e, 'draft')}
                    className="hidden"
                  />
                </label>
                <div className="flex-1 flex flex-wrap gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition">
                    เลือกรูปโปรไฟล์
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleAvatarUpload(e, 'draft')}
                      className="hidden"
                    />
                  </label>
                  {profileDraft.avatarUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setProfileDraft((prev) => ({ ...prev, avatarUrl: undefined }))
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  ชื่อที่แสดง
                </label>
                <input
                  type="text"
                  value={profileDraft.displayName}
                  onChange={(e) =>
                    setProfileDraft((prev) => ({ ...prev, displayName: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  ชื่อผู้ใช้ (Handle)
                </label>
                <input
                  type="text"
                  value={profileDraft.username}
                  onChange={(e) =>
                    setProfileDraft((prev) => ({ ...prev, username: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">คำแนะนำตัว</label>
                <textarea
                  rows={2}
                  value={profileDraft.bio}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400 resize-none"
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (firebaseUser) {
                    try {
                      const updated = await updateCloudProfile(firebaseUser.uid, profileDraft);
                      const nextProf: ProfileInfo = {
                        displayName: updated.displayName,
                        username: updated.username,
                        bio: updated.bio,
                        avatarUrl: updated.avatarUrl
                      };
                      setProfile(nextProf);
                      setProfileDraft(nextProf);
                    } catch {
                      showToast('ไม่สามารถอัปเดตโปรไฟล์บนคลาวด์ได้');
                      return;
                    }
                  } else {
                    setProfile(profileDraft);
                  }
                  setIsEditProfileOpen(false);
                  showToast(
                    firebaseUser
                      ? 'บันทึกข้อมูลโปรไฟล์ขึ้นคลาวด์ Firebase แล้ว'
                      : 'อัปเดตข้อมูลโปรไฟล์แล้ว'
                  );
                }}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
