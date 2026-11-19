import type { UserProfile, VideoItem } from '../types';
import {
  supabase,
  isSupabaseConfigured,
  SUPABASE_MEDIA_BUCKET,
  profileToRow,
  rowToProfile,
  videoToRow,
  rowToVideo,
  videoPatchToRow,
  type SupabaseProfileRow,
  type SupabaseVideoRow
} from './supabaseClient';

export interface CentralBootstrapPayload {
  videos: VideoItem[];
  profiles: Record<string, UserProfile>;
  activeEmail: string;
  updatedAt: number;
}

const CENTRAL_API_BASE =
  (import.meta.env.VITE_CENTRAL_API_URL as string | undefined)?.trim().replace(/\/$/, '') || '';

export const isCloudSupabaseEnabled = isSupabaseConfigured;

export function resolveCentralApiUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith('data:') || pathOrUrl.startsWith('blob:') || pathOrUrl.startsWith('idb://')) {
    return pathOrUrl;
  }
  if (CENTRAL_API_BASE && pathOrUrl.startsWith('/')) {
    return `${CENTRAL_API_BASE}${pathOrUrl}`;
  }
  return pathOrUrl;
}

async function fetchJson<T>(url: string, init?: RequestInit, timeoutMs = 6000): Promise<T | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(resolveCentralApiUrl(url), {
      ...init,
      signal: controller.signal,
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

function resolveMediaExtension(file: Blob, fileName?: string): string {
  if (fileName) {
    const match = fileName.toLowerCase().match(/\.[a-z0-9]{2,5}$/);
    if (match) return match[0];
  }
  const mime = (file.type || '').toLowerCase();
  if (mime.includes('quicktime') || mime.includes('mov')) return '.mov';
  if (mime.includes('webm')) return '.webm';
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  return '.mp4';
}

export async function fetchCentralBootstrap(): Promise<CentralBootstrapPayload | null> {
  // 1. Primary Cloud Database: Supabase (ซิงค์ตรงกันทุกเครื่องทั้ง PC, มือถือ และ LINE)
  if (supabase) {
    try {
      const [videosRes, profilesRes] = await Promise.all([
        supabase
          .from('toktak_videos')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('toktak_profiles').select('*')
      ]);

      if (!videosRes.error && !profilesRes.error) {
        const videoRows = (videosRes.data || []) as SupabaseVideoRow[];
        const profileRows = (profilesRes.data || []) as SupabaseProfileRow[];

        const profiles: Record<string, UserProfile> = {};
        let activeEmail = '';
        let latestTs = 0;

        for (const row of profileRows) {
          const prof = rowToProfile(row);
          profiles[prof.email] = prof;
          if (row.is_active) {
            activeEmail = prof.email;
          }
          if (row.updated_at) {
            latestTs = Math.max(latestTs, Date.parse(row.updated_at) || 0);
          }
        }

        const videos = videoRows.map((row) => {
          if (row.updated_at) {
            latestTs = Math.max(latestTs, Date.parse(row.updated_at) || 0);
          }
          return rowToVideo(row);
        });

        return {
          videos,
          profiles,
          activeEmail: activeEmail || 'goldenrivercity@gmail.com',
          updatedAt: latestTs || Date.now()
        };
      }
    } catch (err) {
      console.warn('Supabase bootstrap fetch failed, falling back to Express API:', err);
    }
  }

  // 2. Built-in Central Express Server (/api/sync/bootstrap)
  const serverData = await fetchJson<CentralBootstrapPayload & { ok?: boolean }>('/api/sync/bootstrap');
  if (serverData && Array.isArray(serverData.videos)) {
    return {
      videos: serverData.videos,
      profiles: serverData.profiles || {},
      activeEmail: serverData.activeEmail || 'goldenrivercity@gmail.com',
      updatedAt: serverData.updatedAt || Date.now()
    };
  }

  return null;
}

export async function uploadCentralMedia(
  file: Blob,
  mediaId: string,
  fileName?: string
): Promise<string | null> {
  const safeId = mediaId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || `media-${Date.now()}`;
  const ext = resolveMediaExtension(file, fileName);
  const storagePath = `uploads/${safeId}${ext}`;

  // 1. Primary Cloud Storage: Supabase Storage CDN (รองรับ Byte-Range บนมือถือและ LINE ทันที)
  if (supabase) {
    try {
      const { error } = await supabase.storage.from(SUPABASE_MEDIA_BUCKET).upload(storagePath, file, {
        upsert: true,
        contentType: file.type || 'application/octet-stream',
        cacheControl: '31536000'
      });
      if (!error) {
        const { data } = supabase.storage.from(SUPABASE_MEDIA_BUCKET).getPublicUrl(storagePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to Express media API:', err);
    }
  }

  // 2. Built-in Central Express Media Storage (/api/sync/media)
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(resolveCentralApiUrl('/api/sync/media'), {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-media-id': safeId,
        'x-file-name': fileName || `${safeId}${ext}`
      },
      body: file
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; url?: string };
    return data.ok && data.url ? resolveCentralApiUrl(data.url) : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function syncCreateVideo(video: VideoItem): Promise<VideoItem[] | null> {
  if (supabase) {
    try {
      await supabase.from('toktak_videos').upsert(videoToRow(video), { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase syncCreateVideo failed:', err);
    }
  }

  const res = await fetchJson<{ ok?: boolean; videos?: VideoItem[] }>('/api/sync/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video })
  });
  return res?.videos || null;
}

export async function syncUpdateVideo(
  videoId: string,
  patch: Partial<VideoItem>
): Promise<VideoItem[] | null> {
  if (supabase) {
    try {
      await supabase.from('toktak_videos').update(videoPatchToRow(patch)).eq('id', videoId);
    } catch (err) {
      console.warn('Supabase syncUpdateVideo failed:', err);
    }
  }

  const res = await fetchJson<{ ok?: boolean; videos?: VideoItem[] }>(
    `/api/sync/videos/${encodeURIComponent(videoId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patch })
    }
  );
  return res?.videos || null;
}

export async function syncAllVideos(videos: VideoItem[]): Promise<VideoItem[] | null> {
  if (supabase && videos.length > 0) {
    try {
      await supabase
        .from('toktak_videos')
        .upsert(videos.map(videoToRow), { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase syncAllVideos failed:', err);
    }
  }

  const res = await fetchJson<{ ok?: boolean; videos?: VideoItem[] }>('/api/sync/videos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videos })
  });
  return res?.videos || null;
}

export async function syncDeleteVideo(videoId: string): Promise<VideoItem[] | null> {
  if (supabase) {
    try {
      await supabase.from('toktak_videos').delete().eq('id', videoId);
    } catch (err) {
      console.warn('Supabase syncDeleteVideo failed:', err);
    }
  }

  const res = await fetchJson<{ ok?: boolean; videos?: VideoItem[] }>(
    `/api/sync/videos/${encodeURIComponent(videoId)}`,
    { method: 'DELETE' }
  );
  return res?.videos || null;
}

export async function syncProfile(
  profile: UserProfile,
  setActive = true
): Promise<{ profiles?: Record<string, UserProfile>; videos?: VideoItem[] } | null> {
  const cleanEmail = profile.email.trim().toLowerCase();

  if (supabase) {
    try {
      if (setActive) {
        await supabase
          .from('toktak_profiles')
          .update({ is_active: false })
          .neq('email', cleanEmail);
      }
      await supabase
        .from('toktak_profiles')
        .upsert(profileToRow(profile, setActive), { onConflict: 'email' });
      await supabase
        .from('toktak_videos')
        .update({
          creator_name: profile.name,
          creator_handle: profile.handle,
          creator_avatar: profile.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('author_email', cleanEmail);
    } catch (err) {
      console.warn('Supabase syncProfile failed:', err);
    }
  }

  const res = await fetchJson<{
    ok?: boolean;
    profiles?: Record<string, UserProfile>;
    videos?: VideoItem[];
  }>(`/api/sync/profiles/${encodeURIComponent(cleanEmail)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, setActive })
  });
  return res || null;
}

export async function syncActiveUserEmail(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (supabase) {
    try {
      await supabase.from('toktak_profiles').update({ is_active: false }).neq('email', cleanEmail);
      await supabase
        .from('toktak_profiles')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('email', cleanEmail);
    } catch (err) {
      console.warn('Supabase syncActiveUserEmail failed:', err);
    }
  }

  await fetchJson('/api/sync/active-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail })
  });
}

/**
 * Subscribe to real-time updates across PC, Mobile, and LINE In-App Browser.
 * Uses Supabase Realtime WebSockets when configured, or periodic central server check as fallback.
 */
export function subscribeToCentralUpdates(onRemoteChange: () => void): () => void {
  const client = supabase;
  if (client) {
    const channel = client
      .channel('toktak-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'toktak_videos' },
        () => onRemoteChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'toktak_profiles' },
        () => onRemoteChange()
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }

  const timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      onRemoteChange();
    }
  }, 6000);

  return () => {
    window.clearInterval(timer);
  };
}
