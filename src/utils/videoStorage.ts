const DB_NAME = 'toktak_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'video_blobs';

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

export async function saveVideoBlob(videoId: string, blob: Blob): Promise<boolean> {
  try {
    // อ่านข้อมูลไบนารีจริงออกจาก File/Blob ก่อนเปิด Transaction ของ IndexedDB
    // เพื่อป้องกันปัญหาไฟล์อ้างอิงชั่วคราวหายหลังรีเฟรชหรือเปิดลิงก์ใหม่บน iOS / Android
    const buffer = await blob.arrayBuffer();
    const materializedBlob = new Blob([buffer], { type: blob.type || 'video/mp4' });
    const db = await openMediaDB();
    return await new Promise<boolean>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(materializedBlob, videoId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch (e) {
    console.warn('saveVideoBlob failed:', e);
    return false;
  }
}

export async function getVideoBlob(videoId: string): Promise<Blob | null> {
  try {
    const db = await openMediaDB();
    return await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(videoId);
      req.onsuccess = () => {
        const result = req.result;
        resolve(result instanceof Blob ? result : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('getVideoBlob failed:', e);
    return null;
  }
}

export async function deleteVideoBlob(videoId: string): Promise<void> {
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(videoId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('deleteVideoBlob failed:', e);
  }
}

export async function getAllVideoBlobs(): Promise<Record<string, Blob>> {
  try {
    const db = await openMediaDB();
    return await new Promise<Record<string, Blob>>((resolve) => {
      const result: Record<string, Blob> = {};
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          if (typeof cursor.key === 'string' && cursor.value instanceof Blob) {
            result[cursor.key] = cursor.value;
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      req.onerror = () => resolve(result);
    });
  } catch (e) {
    console.warn('getAllVideoBlobs failed:', e);
    return {};
  }
}

export function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const [header, base64] = dataUrl.split(',');
    if (!header || !base64) return null;
    const mimeMatch = header.match(/data:([^;]+);base64/);
    const mime = mimeMatch ? mimeMatch[1] : 'video/mp4';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}
