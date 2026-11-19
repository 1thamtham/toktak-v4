import {
  User,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from 'firebase/storage';
import {
  auth,
  BLUEPRINT_LIMITS,
  clampText,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  sanitizeHandle,
  sanitizeId,
  storage,
} from '../firebase';

export interface CloudProfileData {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
  avatarUrl?: string;
  isPublic: boolean;
}

export interface CloudVideoRecord {
  id: string;
  authorId: string;
  url: string;
  posterUrl?: string;
  storagePath?: string;
  posterStoragePath?: string;
  username: string;
  displayName: string;
  avatarColor: string;
  avatarUrl?: string;
  caption: string;
  song: string;
  likes: number;
  commentsCount: number;
  feedCategory: 'foryou' | 'following';
  linkedProductId?: string;
  lastCommentId?: string;
  visibility: 'public' | 'private';
  createdAtMs: number;
}

export interface CloudCommentRecord {
  id: string;
  videoId: string;
  authorId: string;
  author: string;
  text: string;
  createdAtMs: number;
}

function toMillis(ts: unknown): number {
  if (ts instanceof Timestamp) {
    return ts.toMillis();
  }
  if (ts && typeof ts === 'object' && 'seconds' in ts && typeof (ts as { seconds: unknown }).seconds === 'number') {
    return (ts as { seconds: number }).seconds * 1000;
  }
  if (typeof ts === 'number') {
    return ts;
  }
  return Date.now();
}

function mapVideoDoc(id: string, data: Record<string, unknown>): CloudVideoRecord {
  return {
    id,
    authorId: typeof data.authorId === 'string' ? data.authorId : '',
    url: typeof data.url === 'string' ? data.url : '',
    posterUrl: typeof data.posterUrl === 'string' ? data.posterUrl : undefined,
    storagePath: typeof data.storagePath === 'string' ? data.storagePath : undefined,
    posterStoragePath:
      typeof data.posterStoragePath === 'string' ? data.posterStoragePath : undefined,
    username: typeof data.username === 'string' ? data.username : '@creator',
    displayName: typeof data.displayName === 'string' ? data.displayName : 'TokTak Creator',
    avatarColor:
      typeof data.avatarColor === 'string' ? data.avatarColor : 'from-rose-500 to-pink-500',
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined,
    caption: typeof data.caption === 'string' ? data.caption : '',
    song: typeof data.song === 'string' ? data.song : 'เสียงต้นฉบับ - TokTak',
    likes: typeof data.likes === 'number' ? data.likes : 0,
    commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : 0,
    feedCategory: data.feedCategory === 'following' ? 'following' : 'foryou',
    linkedProductId:
      typeof data.linkedProductId === 'string' && data.linkedProductId.length > 0
        ? data.linkedProductId
        : undefined,
    lastCommentId: typeof data.lastCommentId === 'string' ? data.lastCommentId : undefined,
    visibility: data.visibility === 'private' ? 'private' : 'public',
    createdAtMs: toMillis(data.createdAt),
  };
}

// ============================================================================
// AUTHENTICATION & USER BOOTSTRAP
// ============================================================================

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDocuments(result.user);
  return result.user;
}

export async function signOutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

export async function ensureUserDocuments(user: User): Promise<CloudProfileData> {
  const uid = sanitizeId(user.uid, 'user');
  const userPath = `users/${uid}`;
  const profilePath = `profiles/${uid}`;

  // 1) Private PII account doc
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid,
        email: clampText(user.email || `${uid}@users.local`, 160),
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  // 2) Public creator profile doc
  try {
    const profileRef = doc(db, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        uid,
        displayName:
          typeof data.displayName === 'string' ? data.displayName : 'TokTak Creator',
        username: typeof data.username === 'string' ? data.username : '@creator',
        bio: typeof data.bio === 'string' ? data.bio : '',
        avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined,
        isPublic: data.isPublic !== false,
      };
    }

    const emailLocal = user.email ? user.email.split('@')[0] : uid.slice(0, 8);
    const newProfile: CloudProfileData = {
      uid,
      displayName: clampText(user.displayName || 'TokTak Creator', BLUEPRINT_LIMITS.DISPLAY_NAME_MAX) || 'TokTak Creator',
      username: sanitizeHandle(emailLocal, uid.slice(0, 6)),
      bio: clampText('สร้างสรรค์คอนเทนต์วิดีโอสั้น & รีวิวของดีโทนมินิมอล ✨', BLUEPRINT_LIMITS.BIO_MAX),
      ...(user.photoURL && user.photoURL.length <= BLUEPRINT_LIMITS.IMAGE_DATA_OR_URL_MAX
        ? { avatarUrl: user.photoURL }
        : {}),
      isPublic: true,
    };

    await setDoc(profileRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, profilePath);
  }
}

export function subscribeUserProfile(
  uid: string,
  onProfile: (profile: CloudProfileData) => void
): Unsubscribe {
  const path = `profiles/${uid}`;
  return onSnapshot(
    doc(db, 'profiles', uid),
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      onProfile({
        uid,
        displayName:
          typeof data.displayName === 'string' ? data.displayName : 'TokTak Creator',
        username: typeof data.username === 'string' ? data.username : '@creator',
        bio: typeof data.bio === 'string' ? data.bio : '',
        avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined,
        isPublic: data.isPublic !== false,
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateCloudProfile(
  uid: string,
  draft: { displayName: string; username: string; bio: string; avatarUrl?: string }
): Promise<CloudProfileData> {
  const safeUid = sanitizeId(uid, 'user');
  const path = `profiles/${safeUid}`;
  const cleanPayload: Record<string, unknown> = {
    displayName:
      clampText(draft.displayName, BLUEPRINT_LIMITS.DISPLAY_NAME_MAX) || 'TokTak Creator',
    username: sanitizeHandle(draft.username, safeUid.slice(0, 6)),
    bio: clampText(draft.bio, BLUEPRINT_LIMITS.BIO_MAX),
    isPublic: true,
    updatedAt: serverTimestamp(),
  };

  if (draft.avatarUrl && draft.avatarUrl.length <= BLUEPRINT_LIMITS.IMAGE_DATA_OR_URL_MAX) {
    cleanPayload.avatarUrl = draft.avatarUrl;
  } else {
    cleanPayload.avatarUrl = '';
  }

  try {
    const profileRef = doc(db, 'profiles', safeUid);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      await updateDoc(profileRef, cleanPayload);
    } else {
      await setDoc(profileRef, {
        uid: safeUid,
        ...cleanPayload,
        createdAt: serverTimestamp(),
      });
    }
    return {
      uid: safeUid,
      displayName: String(cleanPayload.displayName),
      username: String(cleanPayload.username),
      bio: String(cleanPayload.bio),
      avatarUrl: cleanPayload.avatarUrl ? String(cleanPayload.avatarUrl) : undefined,
      isPublic: true,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ============================================================================
// FIREBASE CLOUD STORAGE (VIDEOS, POSTERS, AVATARS)
// ============================================================================

export async function uploadVideoToCloudStorage(
  uid: string,
  videoId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ downloadUrl: string; storagePath: string }> {
  const safeUid = sanitizeId(uid, 'user');
  const safeVidId = sanitizeId(videoId, 'clip');
  const rawExt = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  const ext = rawExt && rawExt.length <= 5 ? rawExt : 'mp4';
  const storagePath = `videos/${safeUid}/${safeVidId}.${ext}`;
  const fileRef = ref(storage, storagePath);

  return await new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type || 'video/mp4',
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }
      },
      (err) => {
        reject(err);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ downloadUrl, storagePath });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function uploadPosterDataUrlToCloudStorage(
  uid: string,
  videoId: string,
  posterDataUrl: string
): Promise<{ downloadUrl: string; storagePath: string } | null> {
  try {
    const response = await fetch(posterDataUrl);
    const blob = await response.blob();
    if (!blob || blob.size === 0) return null;

    const safeUid = sanitizeId(uid, 'user');
    const safeVidId = sanitizeId(videoId, 'clip');
    const storagePath = `posters/${safeUid}/${safeVidId}.jpg`;
    const fileRef = ref(storage, storagePath);

    await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' });
    const downloadUrl = await getDownloadURL(fileRef);
    return { downloadUrl, storagePath };
  } catch {
    return null;
  }
}

export async function uploadAvatarBlobToCloudStorage(
  uid: string,
  avatarBlob: Blob
): Promise<string | null> {
  try {
    const safeUid = sanitizeId(uid, 'user');
    const storagePath = `avatars/${safeUid}/avatar_${Date.now()}.jpg`;
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, avatarBlob, { contentType: 'image/jpeg' });
    return await getDownloadURL(fileRef);
  } catch {
    return null;
  }
}

export async function deleteCloudStorageObject(storagePath?: string): Promise<void> {
  if (!storagePath) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // Ignore missing/already-deleted storage objects
  }
}

// ============================================================================
// FIRESTORE VIDEOS, LIKES, BOOKMARKS, COMMENTS
// ============================================================================

export async function fetchPublicVideosOnce(): Promise<CloudVideoRecord[]> {
  const path = 'videos';
  try {
    const q = query(collection(db, 'videos'), where('visibility', '==', 'public'));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapVideoDoc(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribePublicVideos(
  onVideos: (videos: CloudVideoRecord[]) => void
): Unsubscribe {
  const path = 'videos';
  const q = query(collection(db, 'videos'), where('visibility', '==', 'public'));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => mapVideoDoc(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => b.createdAtMs - a.createdAtMs);
      onVideos(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function fetchUserLikedVideoIds(
  uid: string,
  videoIds: string[]
): Promise<Set<string>> {
  const liked = new Set<string>();
  const safeUid = sanitizeId(uid, 'user');
  await Promise.all(
    videoIds.map(async (vidId) => {
      const safeVidId = sanitizeId(vidId, 'clip');
      try {
        const snap = await getDoc(doc(db, 'videos', safeVidId, 'likes', safeUid));
        if (snap.exists()) {
          liked.add(safeVidId);
        }
      } catch {
        // Skip inaccessible doc
      }
    })
  );
  return liked;
}

export function subscribeSavedVideos(
  uid: string,
  onSavedIds: (ids: Set<string>) => void
): Unsubscribe {
  const safeUid = sanitizeId(uid, 'user');
  const path = `users/${safeUid}/savedVideos`;
  const q = query(
    collection(db, 'users', safeUid, 'savedVideos'),
    where('userId', '==', safeUid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const next = new Set<string>();
      snap.forEach((d) => {
        const data = d.data();
        if (typeof data.videoId === 'string') {
          next.add(data.videoId);
        } else {
          next.add(d.id);
        }
      });
      onSavedIds(next);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createCloudVideoDocument(input: {
  id: string;
  authorId: string;
  url: string;
  posterUrl?: string;
  storagePath?: string;
  posterStoragePath?: string;
  username: string;
  displayName: string;
  avatarColor: string;
  avatarUrl?: string;
  caption: string;
  song: string;
  feedCategory: 'foryou' | 'following';
  linkedProductId?: string;
}): Promise<void> {
  const safeId = sanitizeId(input.id, 'clip');
  const safeAuthorId = sanitizeId(input.authorId, 'user');
  const path = `videos/${safeId}`;

  if (!BLUEPRINT_LIMITS.HTTPS_URL_PATTERN.test(input.url)) {
    throw new Error('Cloud video URL must start with https:// or http://');
  }

  const docPayload: Record<string, unknown> = {
    id: safeId,
    authorId: safeAuthorId,
    url: clampText(input.url, BLUEPRINT_LIMITS.URL_MAX),
    username: sanitizeHandle(input.username, safeAuthorId.slice(0, 6)),
    displayName:
      clampText(input.displayName, BLUEPRINT_LIMITS.DISPLAY_NAME_MAX) || 'TokTak Creator',
    avatarColor:
      clampText(input.avatarColor, 80) || 'from-rose-500 to-pink-500',
    caption:
      clampText(input.caption, BLUEPRINT_LIMITS.CAPTION_MAX) || 'แชร์ช่วงเวลาดีๆ บน TokTak ✨',
    song: clampText(input.song, BLUEPRINT_LIMITS.SONG_MAX) || 'เสียงต้นฉบับ - TokTak Creator',
    likes: 0,
    commentsCount: 0,
    feedCategory: input.feedCategory === 'following' ? 'following' : 'foryou',
    visibility: 'public',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (input.posterUrl && input.posterUrl.length <= BLUEPRINT_LIMITS.IMAGE_DATA_OR_URL_MAX) {
    docPayload.posterUrl = input.posterUrl;
  }
  if (input.storagePath) {
    docPayload.storagePath = clampText(input.storagePath, BLUEPRINT_LIMITS.STORAGE_PATH_MAX);
  }
  if (input.posterStoragePath) {
    docPayload.posterStoragePath = clampText(
      input.posterStoragePath,
      BLUEPRINT_LIMITS.STORAGE_PATH_MAX
    );
  }
  if (input.avatarUrl && input.avatarUrl.length <= BLUEPRINT_LIMITS.IMAGE_DATA_OR_URL_MAX) {
    docPayload.avatarUrl = input.avatarUrl;
  }
  if (input.linkedProductId) {
    docPayload.linkedProductId = clampText(input.linkedProductId, 64);
  }

  try {
    await setDoc(doc(db, 'videos', safeId), docPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleCloudVideoLike(
  uid: string,
  videoId: string,
  currentlyLiked: boolean
): Promise<void> {
  const safeUid = sanitizeId(uid, 'user');
  const safeVidId = sanitizeId(videoId, 'clip');
  const path = `videos/${safeVidId}/likes/${safeUid}`;

  try {
    const batch = writeBatch(db);
    const likeRef = doc(db, 'videos', safeVidId, 'likes', safeUid);
    const videoRef = doc(db, 'videos', safeVidId);

    if (currentlyLiked) {
      batch.delete(likeRef);
      batch.update(videoRef, {
        likes: increment(-1),
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.set(likeRef, {
        videoId: safeVidId,
        userId: safeUid,
        createdAt: serverTimestamp(),
      });
      batch.update(videoRef, {
        likes: increment(1),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleCloudSavedVideo(
  uid: string,
  videoId: string,
  currentlySaved: boolean
): Promise<void> {
  const safeUid = sanitizeId(uid, 'user');
  const safeVidId = sanitizeId(videoId, 'clip');
  const path = `users/${safeUid}/savedVideos/${safeVidId}`;

  try {
    const savedRef = doc(db, 'users', safeUid, 'savedVideos', safeVidId);
    if (currentlySaved) {
      await deleteDoc(savedRef);
    } else {
      await setDoc(savedRef, {
        videoId: safeVidId,
        userId: safeUid,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeVideoComments(
  videoId: string,
  onComments: (comments: CloudCommentRecord[]) => void
): Unsubscribe {
  const safeVidId = sanitizeId(videoId, 'clip');
  const path = `videos/${safeVidId}/comments`;
  const q = query(
    collection(db, 'videos', safeVidId, 'comments'),
    where('videoId', '==', safeVidId),
    where('isPublic', '==', true)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            videoId: safeVidId,
            authorId: typeof data.authorId === 'string' ? data.authorId : '',
            author: typeof data.author === 'string' ? data.author : '@user',
            text: typeof data.text === 'string' ? data.text : '',
            createdAtMs: toMillis(data.createdAt),
          };
        })
        .sort((a, b) => a.createdAtMs - b.createdAtMs);
      onComments(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addCloudVideoComment(
  uid: string,
  videoId: string,
  authorHandle: string,
  text: string
): Promise<void> {
  const safeUid = sanitizeId(uid, 'user');
  const safeVidId = sanitizeId(videoId, 'clip');
  const commentId = sanitizeId(
    `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    'cmt'
  );
  const path = `videos/${safeVidId}/comments/${commentId}`;
  const cleanText = clampText(text, BLUEPRINT_LIMITS.COMMENT_TEXT_MAX);
  if (!cleanText) return;

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'videos', safeVidId, 'comments', commentId), {
      id: commentId,
      videoId: safeVidId,
      authorId: safeUid,
      author: sanitizeHandle(authorHandle, safeUid.slice(0, 6)),
      text: cleanText,
      isPublic: true,
      createdAt: serverTimestamp(),
    });
    batch.update(doc(db, 'videos', safeVidId), {
      commentsCount: increment(1),
      lastCommentId: commentId,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCloudVideoDocument(
  videoId: string,
  storagePath?: string,
  posterStoragePath?: string
): Promise<void> {
  const safeVidId = sanitizeId(videoId, 'clip');
  const path = `videos/${safeVidId}`;
  try {
    await deleteDoc(doc(db, 'videos', safeVidId));
    await Promise.all([
      deleteCloudStorageObject(storagePath),
      deleteCloudStorageObject(posterStoragePath),
    ]);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// CART, SHOP ORDERS & SERVICE BOOKINGS
// ============================================================================

export function subscribeUserCart(
  uid: string,
  onCart: (entries: { productId: string; quantity: number }[]) => void
): Unsubscribe {
  const safeUid = sanitizeId(uid, 'user');
  const path = `users/${safeUid}/cartItems`;
  const q = query(
    collection(db, 'users', safeUid, 'cartItems'),
    where('userId', '==', safeUid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            productId: typeof data.productId === 'string' ? data.productId : d.id,
            quantity: typeof data.quantity === 'number' ? data.quantity : 1,
          };
        })
        .filter((item) => item.quantity > 0);
      onCart(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function setCloudCartItemQuantity(
  uid: string,
  productId: string,
  quantity: number
): Promise<void> {
  const safeUid = sanitizeId(uid, 'user');
  const safeProdId = sanitizeId(productId, 'prod');
  const path = `users/${safeUid}/cartItems/${safeProdId}`;

  try {
    const itemRef = doc(db, 'users', safeUid, 'cartItems', safeProdId);
    if (quantity <= 0) {
      await deleteDoc(itemRef);
    } else {
      const clampedQty = Math.min(99, Math.max(1, Math.round(quantity)));
      await setDoc(itemRef, {
        productId: safeProdId,
        userId: safeUid,
        quantity: clampedQty,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function submitCloudShopOrder(input: {
  uid: string;
  productIds: string[];
  totalPrice: number;
  totalItems: number;
  itemsSummary: string;
}): Promise<void> {
  const safeUid = sanitizeId(input.uid, 'user');
  const orderId = sanitizeId(`ord-${Date.now()}`, 'ord');
  const path = `orders/${orderId}`;

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'orders', orderId), {
      id: orderId,
      userId: safeUid,
      totalPrice: Math.max(0, input.totalPrice),
      totalItems: Math.max(1, Math.round(input.totalItems)),
      itemsSummary:
        clampText(input.itemsSummary, BLUEPRINT_LIMITS.ITEMS_SUMMARY_MAX) || 'คำสั่งซื้อสินค้า TokTak',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    for (const prodId of input.productIds) {
      const safeProdId = sanitizeId(prodId, 'prod');
      batch.delete(doc(db, 'users', safeUid, 'cartItems', safeProdId));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitCloudServiceBooking(input: {
  uid: string;
  serviceId: string;
  serviceTitle: string;
  price: number;
  note: string;
}): Promise<void> {
  const safeUid = sanitizeId(input.uid, 'user');
  const safeServiceId = sanitizeId(input.serviceId, 'srv');
  const bookingId = sanitizeId(`bkg-${Date.now()}`, 'bkg');
  const path = `serviceBookings/${bookingId}`;

  try {
    await setDoc(doc(db, 'serviceBookings', bookingId), {
      id: bookingId,
      userId: safeUid,
      serviceId: safeServiceId,
      serviceTitle:
        clampText(input.serviceTitle, 150) || 'บริการครีเอเตอร์ TokTak',
      price: Math.max(0, input.price),
      note: clampText(input.note, BLUEPRINT_LIMITS.NOTE_MAX),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
