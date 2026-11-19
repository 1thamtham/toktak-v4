import { ProductItem, VideoItem, ServiceItem, CartItem, AdminOrder } from '../types';
import tshirtMockupImg from '../assets/images/tshirt_mockup_1794023817755.jpg';
import phonecaseMockupImg from '../assets/images/phonecase_mockup_1794023818273.jpg';
import totebagMockupImg from '../assets/images/totebag_mockup_1794023818674.jpg';
import creatorAvatarImg from '../assets/images/creator_avatar_1794023819826.jpg';

export const BUNDLED_ASSET_MAP: Record<string, string> = {
  '/src/assets/images/tshirt_mockup_1794023817755.jpg': tshirtMockupImg,
  '/src/assets/images/phonecase_mockup_1794023818273.jpg': phonecaseMockupImg,
  '/src/assets/images/totebag_mockup_1794023818674.jpg': totebagMockupImg,
  '/src/assets/images/creator_avatar_1794023819826.jpg': creatorAvatarImg
};

export const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'ord-1001',
    orderNumber: 'TKD-98214',
    customerName: 'สมชาย วิจิตรศิลป์',
    customerEmail: 'somchai.w@gmail.com',
    itemCount: 2,
    totalPrice: 940,
    status: 'processing',
    createdAt: 'วันนี้, 14:25 น.',
    productTitle: 'เสื้อยืดโอเวอร์ไซส์ สตรีทอาร์ต ลิมิเต็ด (2 ตัว)',
    shippingAddress: '128/4 ซอยสุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110'
  },
  {
    id: 'ord-1002',
    orderNumber: 'TKD-98215',
    customerName: 'กนกวรรณ รัตนแสง',
    customerEmail: 'kanokwan.r@outlook.com',
    itemCount: 1,
    totalPrice: 350,
    status: 'shipped',
    createdAt: 'วันนี้, 10:12 น.',
    productTitle: 'เคสมือถือคลื่นไซเคเดลิก iPhone 15 Pro',
    shippingAddress: '45/12 หมู่บ้านศุภาลัย ถ.แจ้งวัฒนะ ปากเกร็ด นนทบุรี 11120'
  },
  {
    id: 'ord-1003',
    orderNumber: 'TKD-98216',
    customerName: 'ภานุพงศ์ เจริญพานิชย์',
    customerEmail: 'panupong.c@gmail.com',
    itemCount: 4,
    totalPrice: 1160,
    status: 'pending',
    createdAt: 'เมื่อวาน, 18:40 น.',
    productTitle: 'กระเป๋าผ้าแคนวาส Modern Essentials (4 ใบ)',
    shippingAddress: '78 ถ.นิมมานเหมินท์ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200'
  }
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'เสื้อยืดโอเวอร์ไซส์ สตรีทอาร์ต ลิมิเต็ด',
    price: 490,
    originalPrice: 650,
    image: tshirtMockupImg,
    productType: 'tshirt',
    creatorName: 'TERRAIN Studio',
    creatorAvatar: creatorAvatarImg,
    salesCount: 1420,
    rating: 4.9,
    isCustomizable: true,
    description: 'ผ้าคอตตอน 100% พรีเมียม 260gsm นุ่ม ระบายอากาศดีเยี่ยม ปรับแต่งข้อความหรือลายสกรีนได้เอง',
    colors: ['#0f172a', '#ffffff', '#e2e8f0', '#334155']
  },
  {
    id: 'prod-2',
    name: 'เคสมือถือคลื่นไซเคเดลิก กันกระแทกระดับพรีเมียม',
    price: 350,
    originalPrice: 490,
    image: phonecaseMockupImg,
    productType: 'phonecase',
    creatorName: 'Waveform Labs',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    salesCount: 890,
    rating: 4.8,
    isCustomizable: true,
    description: 'เคสสองชั้น TPU+PC ผิวด้านกันรอยนิ้วมือ ปกป้องเลนส์กล้อง ใส่ชื่อและข้อความที่ต้องการได้',
    colors: ['#09090b', '#1e293b', '#475569', '#cbd5e1']
  },
  {
    id: 'prod-3',
    name: 'กระเป๋าผ้าแคนวาส Modern Essentials สะพายไหล่',
    price: 290,
    originalPrice: 390,
    image: totebagMockupImg,
    productType: 'totebag',
    creatorName: 'Artisan Goods',
    creatorAvatar: creatorAvatarImg,
    salesCount: 2150,
    rating: 5.0,
    isCustomizable: true,
    description: 'ผ้าดิบธรรมชาติความหนา 14 ออนซ์ จุของได้เยอะ รับน้ำหนักได้ดี สกรีนชื่อหรือโลโก้เฉพาะตัวคุณ',
    colors: ['#f5f5f0', '#1c1917', '#e7e5e4']
  },
  {
    id: 'prod-4',
    name: 'เสื้อยืดมินิมอล Typography "TOKYO NOIR"',
    price: 450,
    originalPrice: 590,
    image: tshirtMockupImg,
    productType: 'tshirt',
    creatorName: 'Noir Collective',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    salesCount: 640,
    rating: 4.7,
    isCustomizable: true,
    description: 'เสื้อทรง Boxy Cut สไตล์ญี่ปุ่น ซักแล้วไม่ย้วย สกรีนลายคมชัดไม่ลอก',
    colors: ['#18181b', '#ffffff', '#27272a']
  }
];

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    posterUrl: tshirtMockupImg,
    creatorName: 'Golden River City',
    creatorHandle: '@goldenrivercity',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95',
    creatorEmail: 'goldenrivercity@gmail.com',
    ownerEmail: 'goldenrivercity@gmail.com',
    authorEmail: 'goldenrivercity@gmail.com',
    caption: 'เบื้องหลังการออกแบบเสื้อยืดลายใหม่ 💥 ลองทำใน Design Studio แล้วสวยมาก กดสั่งได้เลยตรงการ์ดสินค้า!',
    musicTitle: 'TERRAIN Original Sound - Bangkok City Beat',
    likesCount: 12400,
    commentsCount: 382,
    sharesCount: 1205,
    isLiked: false,
    feedType: 'foryou',
    linkedProduct: INITIAL_PRODUCTS[0]
  },
  {
    id: 'vid-2',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    posterUrl: phonecaseMockupImg,
    creatorName: 'Waveform Labs',
    creatorHandle: '@waveform.case',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorEmail: 'waveform@toktak.com',
    ownerEmail: 'waveform@toktak.com',
    authorEmail: 'waveform@toktak.com',
    likedByEmails: ['goldenrivercity@gmail.com'],
    caption: 'เคสสีนี้ใส่กับไอโฟนเครื่องไหนก็รอด 📱 ปรับใส่ชื่อตัวเองได้ในสตูดิโอออกแบบด้านบนเลยนะทุกคน ✨',
    musicTitle: 'Waveform Audio - Lo-Fi Chill Summer 2026',
    likesCount: 8930,
    commentsCount: 194,
    sharesCount: 450,
    isLiked: true,
    feedType: 'foryou',
    linkedProduct: INITIAL_PRODUCTS[1]
  },
  {
    id: 'vid-3',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    posterUrl: totebagMockupImg,
    creatorName: 'Artisan Goods',
    creatorHandle: '@artisan.official',
    creatorAvatar: creatorAvatarImg,
    creatorEmail: 'artisan@toktak.com',
    ownerEmail: 'artisan@toktak.com',
    authorEmail: 'artisan@toktak.com',
    likedByEmails: ['goldenrivercity@gmail.com'],
    caption: 'กระเป๋าผ้าที่สายมินิมอลต้องมี 🌿 จุของได้จุใจ ใส่แมคบุ๊ก iPad ได้สบาย พร้อมสกรีนคำคมเท่ๆ ได้ตามใจชอบ!',
    musicTitle: 'Indie Vibes - Morning Walk Acoustic',
    likesCount: 5610,
    commentsCount: 128,
    sharesCount: 312,
    isLiked: true,
    feedType: 'following',
    linkedProduct: INITIAL_PRODUCTS[2]
  },
  {
    id: 'vid-draft-1',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    posterUrl: tshirtMockupImg,
    creatorName: 'Golden River City',
    creatorHandle: '@goldenrivercity',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95',
    creatorEmail: 'goldenrivercity@gmail.com',
    ownerEmail: 'goldenrivercity@gmail.com',
    authorEmail: 'goldenrivercity@gmail.com',
    caption: '📝 [ฉบับร่าง/ส่วนตัว] วิดีโอพรีวิวคอลเลกชันสตรีทแวร์ 2026 รอตรวจความเรียบร้อย',
    musicTitle: 'Exclusive Beats (Draft Unreleased)',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    isDraft: true,
    isPrivate: true,
    feedType: 'foryou',
    linkedProduct: INITIAL_PRODUCTS[0]
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'รับออกแบบลายเสื้อ สตรีทแวร์ & ฟอนต์กราฟิกเฉพาะบุคคล',
    category: 'graphic',
    categoryLabel: 'ออกแบบกราฟิก',
    creatorName: 'Krit Typography',
    creatorHandle: '@krit.design',
    creatorAvatar: creatorAvatarImg,
    rating: 4.95,
    reviewCount: 148,
    startingPrice: 500,
    turnaroundDays: 2,
    description: 'ส่งไฟล์เวกเตอร์ AI/PNG ความละเอียด 300dpi พร้อมสำหรับนำไปพิมพ์สกรีนเสื้อทันที แก้ไขได้ 3 ครั้งฟรี',
    tags: ['Streetwear', 'Typography', 'Logo', 'Vector'],
    coverImage: tshirtMockupImg
  },
  {
    id: 'srv-2',
    title: 'รับตัดต่อวิดีโอสั้น TikTok / Reels สไตล์ไดนามิก ดึงยอดวิว',
    category: 'video',
    categoryLabel: 'ถ่ายรูป/วิดีโอ',
    creatorName: 'FilmCraft BKK',
    creatorHandle: '@filmcraft.bkk',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.88,
    reviewCount: 92,
    startingPrice: 800,
    turnaroundDays: 1,
    description: 'ใส่ซับไตเติลเอฟเฟกต์ Sound FX คัตติ้งเร็วทันกระแส เพิ่มยอด Engagement ให้ช่องของคุณ',
    tags: ['Reels', 'TikTok Edit', 'CapCut', 'Color Grade'],
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'srv-3',
    title: 'รับสกรีนเสื้อและกระเป๋าผ้า DTG / ซิลค์สกรีน ไม่มีขั้นต่ำ',
    category: 'screen',
    categoryLabel: 'งานสกรีน/ผลิต',
    creatorName: 'Print Craft Factory',
    creatorHandle: '@printcraft.th',
    creatorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 310,
    startingPrice: 150,
    turnaroundDays: 3,
    description: 'รับสกรีนตั้งแต่ 1 ชิ้น งานคมชัดสีไม่หลุดลอก ใช้หมึกแท้มาตรฐานสากล เป็นมิตรกับผิว',
    tags: ['DTG', 'Screen Print', 'No MOQ', 'Tote Bag'],
    coverImage: totebagMockupImg
  },
  {
    id: 'srv-4',
    title: 'รับวาดการ์ตูน Portrait เวกเตอร์สำหรับสกรีนเคสและเสื้อ',
    category: 'illustration',
    categoryLabel: 'วาดภาพประกอบ',
    creatorName: 'Mew Illustrator',
    creatorHandle: '@mew.art',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 4.92,
    reviewCount: 76,
    startingPrice: 350,
    turnaroundDays: 2,
    description: 'วาดภาพคุณ คู่รัก หรือสัตว์เลี้ยงในสไตล์น่ารักสดใส พร้อมจัดวางลงเคสมือถือหรือเสื้อผ้าได้เลย',
    tags: ['Portrait', 'Cute Cartoon', 'Sticker', 'Pet Art'],
    coverImage: phonecaseMockupImg
  }
];

export const INITIAL_CART: CartItem[] = [
  {
    id: 'cart-1',
    productName: 'เสื้อยืดคัสตอมลายพิเศษ "BKK NIGHTS"',
    productType: 'tshirt',
    price: 490,
    quantity: 1,
    color: '#0f172a',
    customText: 'BKK NIGHTS',
    previewImage: tshirtMockupImg,
    timestamp: Date.now() - 3600000
  }
];
