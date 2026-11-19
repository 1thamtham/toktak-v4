/// <reference types="node" />
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), '.toktak-data');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const DB_FILE = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(MEDIA_DIR, { recursive: true });

interface StoredProfile {
  id: string;
  email: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  isGoogleVerified?: boolean;
  role?: 'superadmin' | 'admin' | 'creator' | 'user';
}

interface StoredVideo {
  id: string;
  videoUrl: string;
  posterUrl: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  creatorEmail?: string;
  ownerEmail?: string;
  authorEmail?: string;
  caption: string;
  musicTitle: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  likedByEmails?: string[];
  isDraft?: boolean;
  isPrivate?: boolean;
  feedType: 'following' | 'foryou';
  linkedProduct?: Record<string, unknown>;
}

interface CentralDatabase {
  videos: StoredVideo[];
  profiles: Record<string, StoredProfile>;
  activeEmail: string;
  updatedAt: number;
}

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';

const SEED_PROFILES: Record<string, StoredProfile> = {
  'goldenrivercity@gmail.com': {
    id: 'usr-goldenrivercitygmailcom',
    email: 'goldenrivercity@gmail.com',
    name: 'Golden River City',
    handle: '@goldenrivercity',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95',
    bio: '👑 Superadmin ผู้ดูแลระบบสูงสุด',
    joinedDate: 'พ.ย. 2026',
    followersCount: 1420,
    followingCount: 88,
    likesCount: 15400,
    isGoogleVerified: true,
    role: 'superadmin'
  },
  'admin@tokdesign.com': {
    id: 'usr-admintokdesigncom',
    email: 'admin@tokdesign.com',
    name: 'Admin TokDesign',
    handle: '@tokdesign_admin',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95',
    bio: '🛡️ ผู้ดูแลร้านค้า TokDesign',
    joinedDate: 'พ.ย. 2026',
    followersCount: 680,
    followingCount: 42,
    likesCount: 4200,
    isGoogleVerified: true,
    role: 'admin'
  },
  'customer@gmail.com': {
    id: 'usr-customergmailcom',
    email: 'customer@gmail.com',
    name: 'สมชาย ใจดี',
    handle: '@somchai_bkk',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=95',
    bio: 'ผู้ใช้งานทั่วไป 🎨 ชื่นชอบสตรีทแวร์',
    joinedDate: 'พ.ย. 2026',
    followersCount: 95,
    followingCount: 210,
    likesCount: 890,
    isGoogleVerified: true,
    role: 'user'
  }
};

const SEED_VIDEOS: StoredVideo[] = [];

function readDB(): CentralDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<CentralDatabase>;
      return {
        videos: Array.isArray(parsed.videos) ? parsed.videos : SEED_VIDEOS,
        profiles:
          parsed.profiles && typeof parsed.profiles === 'object'
            ? { ...SEED_PROFILES, ...parsed.profiles }
            : { ...SEED_PROFILES },
        activeEmail:
          typeof parsed.activeEmail === 'string' && parsed.activeEmail.trim()
            ? parsed.activeEmail.trim().toLowerCase()
            : 'goldenrivercity@gmail.com',
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now()
      };
    }
  } catch (err) {
    console.warn('Failed to read central db.json, using defaults:', err);
  }

  const initialDb: CentralDatabase = {
    videos: SEED_VIDEOS,
    profiles: { ...SEED_PROFILES },
    activeEmail: 'goldenrivercity@gmail.com',
    updatedAt: Date.now()
  };
  writeDB(initialDb);
  return initialDb;
}

function writeDB(db: CentralDatabase): void {
  try {
    db.updatedAt = Date.now();
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.warn('Failed to write central db.json:', err);
  }
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.mp4':
      return 'video/mp4';
    case '.mov':
      return 'video/quicktime';
    case '.webm':
      return 'video/webm';
    case '.m4v':
      return 'video/x-m4v';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

function inferExtension(contentType?: string, originalName?: string): string {
  if (originalName) {
    const ext = path.extname(originalName).toLowerCase();
    if (/^\.[a-z0-9]{2,5}$/.test(ext)) return ext;
  }
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('quicktime') || ct.includes('mov')) return '.mov';
  if (ct.includes('webm')) return '.webm';
  if (ct.includes('mp4')) return '.mp4';
  if (ct.includes('png')) return '.png';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg';
  return '.mp4';
}

async function startServer() {
  const app = express();

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, x-media-id, x-file-name');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // Upload raw binary video or image file for universal cross-device / LINE playback
  app.post(
    '/api/sync/media',
    express.raw({ type: '*/*', limit: '50mb' }),
    (req: Request, res: Response) => {
      try {
        const buffer = req.body as Buffer;
        if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
          res.status(400).json({ ok: false, error: 'Empty media body' });
          return;
        }
        const rawId = String(req.headers['x-media-id'] || `media-${Date.now()}`);
        const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || `media-${Date.now()}`;
        const ext = inferExtension(
          req.headers['content-type'],
          typeof req.headers['x-file-name'] === 'string' ? req.headers['x-file-name'] : undefined
        );
        const filename = `${safeId}${ext}`;
        const targetPath = path.join(MEDIA_DIR, filename);
        fs.writeFileSync(targetPath, buffer);
        res.json({ ok: true, url: `/api/media/${filename}`, size: buffer.length });
      } catch (err) {
        console.error('Media upload failed:', err);
        res.status(500).json({ ok: false, error: 'Media upload failed' });
      }
    }
  );

  // Serve media with full HTTP 206 Partial Content Range support (mandatory for iOS Safari & LINE In-App Browser)
  app.get('/api/media/:filename', (req: Request, res: Response) => {
    const rawName = path.basename(String(req.params.filename || ''));
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = path.join(MEDIA_DIR, safeName);

    if (!safeName || !fs.existsSync(filePath)) {
      res.status(404).json({ ok: false, error: 'Media not found' });
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const mimeType = getMimeType(safeName);
    const range = req.headers.range;

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = Number.parseInt(parts[0], 10);
      const rawEnd = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;
      const end = Math.min(fileSize - 1, rawEnd);

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
        return;
      }

      const chunkSize = end - start + 1;
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', String(chunkSize));
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.status(200);
    res.setHeader('Content-Length', String(fileSize));
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  });

  app.use(express.json({ limit: '15mb' }));

  app.get('/api/sync/bootstrap', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const db = readDB();
    res.json({ ok: true, ...db });
  });

  app.put('/api/sync/videos', (req: Request, res: Response) => {
    const incoming = req.body?.videos;
    if (!Array.isArray(incoming)) {
      res.status(400).json({ ok: false, error: 'videos array required' });
      return;
    }
    const db = readDB();
    db.videos = incoming;
    writeDB(db);
    res.json({ ok: true, videos: db.videos, updatedAt: db.updatedAt });
  });

  app.post('/api/sync/videos', (req: Request, res: Response) => {
    const video = req.body?.video as StoredVideo | undefined;
    if (!video || !video.id) {
      res.status(400).json({ ok: false, error: 'video object with id required' });
      return;
    }
    const db = readDB();
    db.videos = [video, ...db.videos.filter((v) => v.id !== video.id)];
    writeDB(db);
    res.json({ ok: true, video, videos: db.videos, updatedAt: db.updatedAt });
  });

  app.patch('/api/sync/videos/:id', (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    const patch = (req.body?.patch || req.body || {}) as Partial<StoredVideo>;
    const db = readDB();
    let updatedVideo: StoredVideo | null = null;
    db.videos = db.videos.map((v) => {
      if (v.id === id) {
        updatedVideo = { ...v, ...patch, id: v.id };
        return updatedVideo;
      }
      return v;
    });
    if (!updatedVideo) {
      res.status(404).json({ ok: false, error: 'Video not found' });
      return;
    }
    writeDB(db);
    res.json({ ok: true, video: updatedVideo, videos: db.videos, updatedAt: db.updatedAt });
  });

  app.delete('/api/sync/videos/:id', (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    const db = readDB();
    db.videos = db.videos.filter((v) => v.id !== id);
    writeDB(db);
    res.json({ ok: true, videos: db.videos, updatedAt: db.updatedAt });
  });

  app.put('/api/sync/profiles/:email', (req: Request, res: Response) => {
    const email = decodeURIComponent(String(req.params.email || '')).trim().toLowerCase();
    const profile = req.body?.profile as StoredProfile | undefined;
    const setActive = Boolean(req.body?.setActive);
    if (!email || !profile) {
      res.status(400).json({ ok: false, error: 'email and profile required' });
      return;
    }

    const db = readDB();
    const cleanProfile: StoredProfile = { ...profile, email };
    db.profiles[email] = cleanProfile;
    if (setActive) {
      db.activeEmail = email;
    }

    // Keep creator info on videos owned by this email synchronized centrally
    db.videos = db.videos.map((v) => {
      const owner = (v.authorEmail || v.ownerEmail || v.creatorEmail || '').trim().toLowerCase();
      if (owner === email) {
        return {
          ...v,
          creatorName: cleanProfile.name,
          creatorHandle: cleanProfile.handle,
          creatorAvatar: cleanProfile.avatar
        };
      }
      return v;
    });

    writeDB(db);
    res.json({
      ok: true,
      profile: cleanProfile,
      profiles: db.profiles,
      videos: db.videos,
      activeEmail: db.activeEmail,
      updatedAt: db.updatedAt
    });
  });

  app.post('/api/sync/active-user', (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      res.status(400).json({ ok: false, error: 'email required' });
      return;
    }
    const db = readDB();
    db.activeEmail = email;
    writeDB(db);
    res.json({ ok: true, activeEmail: db.activeEmail, updatedAt: db.updatedAt });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TokTak Central Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
