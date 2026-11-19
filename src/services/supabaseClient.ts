import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ProductItem, UserProfile, VideoItem } from '../types';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim().replace(/\/$/, '') || '';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';
export const SUPABASE_MEDIA_BUCKET =
  (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined)?.trim() || 'toktak-media';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

export interface SupabaseProfileRow {
  email: string;
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string | null;
  joined_date: string | null;
  followers_count: number | null;
  following_count: number | null;
  likes_count: number | null;
  is_google_verified: boolean | null;
  role: 'superadmin' | 'admin' | 'creator' | 'user' | null;
  is_active?: boolean | null;
  updated_at?: string;
}

export interface SupabaseVideoRow {
  id: string;
  video_url: string;
  poster_url: string | null;
  creator_name: string;
  creator_handle: string;
  creator_avatar: string | null;
  creator_email: string;
  owner_email: string | null;
  author_email: string | null;
  caption: string | null;
  music_title: string | null;
  likes_count: number | null;
  comments_count: number | null;
  shares_count: number | null;
  is_liked: boolean | null;
  liked_by_emails: string[] | null;
  is_draft: boolean | null;
  is_private: boolean | null;
  feed_type: 'following' | 'foryou' | 'live' | null;
  linked_product: ProductItem | null;
  created_at?: string;
  updated_at?: string;
}

export function profileToRow(profile: UserProfile, isActive?: boolean): SupabaseProfileRow {
  const email = profile.email.trim().toLowerCase();
  return {
    email,
    id: profile.id,
    name: profile.name,
    handle: profile.handle,
    avatar: profile.avatar || '',
    bio: profile.bio || '',
    joined_date: profile.joinedDate || 'พ.ย. 2026',
    followers_count: profile.followersCount ?? 0,
    following_count: profile.followingCount ?? 0,
    likes_count: profile.likesCount ?? 0,
    is_google_verified: profile.isGoogleVerified ?? true,
    role: profile.role || 'user',
    ...(typeof isActive === 'boolean' ? { is_active: isActive } : {}),
    updated_at: new Date().toISOString()
  };
}

export function rowToProfile(row: SupabaseProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email.trim().toLowerCase(),
    name: row.name,
    handle: row.handle,
    avatar: row.avatar || '',
    bio: row.bio || '',
    joinedDate: row.joined_date || 'พ.ย. 2026',
    followersCount: row.followers_count ?? 0,
    followingCount: row.following_count ?? 0,
    likesCount: row.likes_count ?? 0,
    isGoogleVerified: row.is_google_verified ?? true,
    role: row.role || 'user'
  };
}

export function videoToRow(video: VideoItem): SupabaseVideoRow {
  const ownerEmail = (video.authorEmail || video.ownerEmail || video.creatorEmail || '').trim().toLowerCase();
  return {
    id: video.id,
    video_url: video.videoUrl || '',
    poster_url: video.posterUrl || '',
    creator_name: video.creatorName || '',
    creator_handle: video.creatorHandle || '',
    creator_avatar: video.creatorAvatar || '',
    creator_email: ownerEmail,
    owner_email: ownerEmail,
    author_email: ownerEmail,
    caption: video.caption || '',
    music_title: video.musicTitle || '',
    likes_count: video.likesCount ?? 0,
    comments_count: video.commentsCount ?? 0,
    shares_count: video.sharesCount ?? 0,
    is_liked: Boolean(video.isLiked),
    liked_by_emails: Array.isArray(video.likedByEmails) ? video.likedByEmails : [],
    is_draft: Boolean(video.isDraft),
    is_private: Boolean(video.isPrivate),
    feed_type: video.feedType || 'foryou',
    linked_product: video.linkedProduct ?? null,
    updated_at: new Date().toISOString()
  };
}

export function rowToVideo(row: SupabaseVideoRow): VideoItem {
  const ownerEmail = (row.author_email || row.owner_email || row.creator_email || '').trim().toLowerCase();
  return {
    id: row.id,
    videoUrl: row.video_url || '',
    posterUrl: row.poster_url || '',
    creatorName: row.creator_name || '',
    creatorHandle: row.creator_handle || '',
    creatorAvatar: row.creator_avatar || '',
    creatorEmail: ownerEmail,
    ownerEmail,
    authorEmail: ownerEmail,
    caption: row.caption || '',
    musicTitle: row.music_title || '',
    likesCount: row.likes_count ?? 0,
    commentsCount: row.comments_count ?? 0,
    sharesCount: row.shares_count ?? 0,
    isLiked: Boolean(row.is_liked),
    likedByEmails: Array.isArray(row.liked_by_emails) ? row.liked_by_emails : [],
    isDraft: Boolean(row.is_draft),
    isPrivate: Boolean(row.is_private),
    feedType: row.feed_type || 'foryou',
    linkedProduct: row.linked_product || undefined
  };
}

export function videoPatchToRow(patch: Partial<VideoItem>): Partial<SupabaseVideoRow> {
  const row: Partial<SupabaseVideoRow> = {
    updated_at: new Date().toISOString()
  };
  if (patch.videoUrl !== undefined) row.video_url = patch.videoUrl;
  if (patch.posterUrl !== undefined) row.poster_url = patch.posterUrl;
  if (patch.creatorName !== undefined) row.creator_name = patch.creatorName;
  if (patch.creatorHandle !== undefined) row.creator_handle = patch.creatorHandle;
  if (patch.creatorAvatar !== undefined) row.creator_avatar = patch.creatorAvatar;
  if (patch.caption !== undefined) row.caption = patch.caption;
  if (patch.musicTitle !== undefined) row.music_title = patch.musicTitle;
  if (patch.likesCount !== undefined) row.likes_count = patch.likesCount;
  if (patch.commentsCount !== undefined) row.comments_count = patch.commentsCount;
  if (patch.sharesCount !== undefined) row.shares_count = patch.sharesCount;
  if (patch.isLiked !== undefined) row.is_liked = patch.isLiked;
  if (patch.likedByEmails !== undefined) row.liked_by_emails = patch.likedByEmails;
  if (patch.isDraft !== undefined) row.is_draft = patch.isDraft;
  if (patch.isPrivate !== undefined) row.is_private = patch.isPrivate;
  if (patch.feedType !== undefined) row.feed_type = patch.feedType;
  if (patch.linkedProduct !== undefined) row.linked_product = patch.linkedProduct ?? null;
  return row;
}
