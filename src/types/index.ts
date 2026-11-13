export type TabType = 'home' | 'shop' | 'services' | 'profile';

export type ProductType = 'tshirt' | 'phonecase' | 'totebag';

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  productType: ProductType;
  creatorName: string;
  creatorAvatar: string;
  salesCount: number;
  rating: number;
  isCustomizable: boolean;
  description?: string;
  colors?: string[];
}

export interface VideoItem {
  id: string;
  videoUrl: string;
  posterUrl: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  creatorEmail?: string;
  ownerEmail?: string;
  authorEmail?: string;
  isPrivate?: boolean;
  isDraft?: boolean;
  likedByEmails?: string[];
  caption: string;
  musicTitle: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  linkedProduct?: ProductItem;
  feedType: 'following' | 'foryou' | 'live';
}

export interface LiveComment {
  id: string;
  userName: string;
  text: string;
  badge?: string;
}

export interface LiveStreamItem {
  id: string;
  title: string;
  hostName: string;
  hostHandle: string;
  hostAvatar: string;
  viewerCount: number;
  videoUrl: string;
  posterUrl: string;
  pinnedProduct?: ProductItem;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: 'graphic' | 'video' | 'screen' | 'illustration' | 'other';
  categoryLabel: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  turnaroundDays: number;
  description: string;
  tags: string[];
  coverImage: string;
}

export interface CommentItem {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

export interface CartItem {
  id: string;
  productName: string;
  productType: ProductType;
  price: number;
  quantity: number;
  color: string;
  customText?: string;
  customGraphicUrl?: string;
  previewImage: string;
  timestamp: number;
}

export interface DesignProject {
  productType: ProductType;
  baseColor: string;
  customText: string;
  textColor: string;
  textSize: number;
  fontFamily: string;
  textPosition: { x: number; y: number };
  customGraphicUrl: string | null;
  graphicScale: number;
  graphicPosition: { x: number; y: number };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  isGoogleVerified: boolean;
  role: 'superadmin' | 'admin' | 'creator' | 'user';
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed';
  createdAt: string;
  productTitle: string;
  shippingAddress: string;
}
