import React, { useState, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  ArrowLeft,
  Sparkles,
  Search,
  Star,
  Clock,
  CheckCircle2,
  MessageSquare,
  Send,
  X,
  Upload,
  Plus,
  Layers,
  Megaphone,
  Briefcase,
  HelpCircle,
  Wand2,
  Image as ImageIcon,
  RotateCcw,
  Tag,
  Check,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesViewProps {
  services: ServiceItem[];
  onOpenCreateModal: () => void;
  onOpenTokTakShop?: () => void;
}

export interface FolderItem {
  id: string;
  isTop3?: boolean;
  icon?: any;
  coverImage?: string;
  accentColor?: string;
  badgeBg: string;
  badge: string;
  title: string;
  subtitle: string;
  countLabel: string;
  isCustom?: boolean;
}

interface CustomBrief {
  id: string;
  folderId?: string;
  title: string;
  category: string;
  budget: number;
  deadlineDays: number;
  details: string;
  referenceUrl?: string;
  status: 'pending' | 'reviewing' | 'accepted';
  createdAt: string;
}

interface CommunityPost {
  id: string;
  folderId?: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  type: 'hire' | 'offer' | 'discuss';
  title: string;
  content: string;
  budget?: string;
  repliesCount: number;
  timeAgo: string;
}

const INITIAL_BRIEFS: CustomBrief[] = [
  {
    id: 'brief-1',
    title: 'สั่งทำเสื้อยืดแก๊งเพื่อน 15 ตัว สกรีนลายกราฟิกหน้า-หลัง',
    category: 'สกรีนเสื้อยืด',
    budget: 4500,
    deadlineDays: 5,
    details: 'ต้องการเสื้อผ้าคอตตอน 100% สีดำ ลายกราฟิกสไตล์ Cyberpunk ที่อกซ้าย และข้อความด้านหลัง',
    status: 'reviewing',
    createdAt: '2 ชม. ที่แล้ว'
  }
];

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorName: 'Natthapol Studio',
    authorHandle: '@natthapol.st',
    authorAvatar: '/src/assets/images/creator_avatar_1794023819826.jpg',
    type: 'offer',
    title: 'รับออกแบบลายเสื้อสตรีทแวร์ คิวว่าง 2 คิว ส่งงานไวใน 24 ชม.',
    content: 'พร้อมส่งไฟล์เวกเตอร์ AI/PNG 300dpi ให้ช่างสกรีนได้ทันที แก้ไขได้ไม่จำกัด สนใจทักแชทสอบถามเรทราคาได้เลยครับ',
    budget: 'เริ่มต้น ฿450',
    repliesCount: 4,
    timeAgo: '15 นาทีที่แล้ว'
  },
  {
    id: 'post-2',
    authorName: 'Korn_CoffeeBKK',
    authorHandle: '@korn.cafe',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    type: 'hire',
    title: 'หาช่างสกรีนกระเป๋าผ้าแคนวาส 50 ใบ สำหรับแจกลูกค้าร้านกาแฟ',
    content: 'มีไฟล์โลโก้พร้อมแล้ว ต้องการผ้าดิบหนา 12-14 ออนซ์ สีครีมธรรมชาติ ขอช่างที่ส่งงานได้ภายในวันศุกร์นี้ครับ',
    budget: 'งบ ฿8,000',
    repliesCount: 8,
    timeAgo: '1 ชม. ที่แล้ว'
  }
];

const BASE_FOLDERS: FolderItem[] = [
  {
    id: 'brief-tool',
    isTop3: true,
    icon: FolderPlus,
    accentColor: 'from-rose-500 to-pink-500',
    badgeBg: 'bg-rose-50 text-rose-600 border-rose-200',
    badge: 'สำหรับลูกค้า',
    title: 'สตูดิโอสร้างงานตามสั่ง',
    subtitle: 'เครื่องมือให้ลูกค้าเข้ามาสร้างงาน บรีฟไอเดีย แนบรูปตัวอย่าง คำนวณงบประมาณ',
    countLabel: 'โปรเจกต์ของฉัน'
  },
  {
    id: 'market',
    isTop3: true,
    icon: Briefcase,
    accentColor: 'from-cyan-500 to-blue-500',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badge: 'ตลาดบริการ',
    title: 'ตลาดบริการฟรีแลนซ์',
    subtitle: 'เลือกดูบริการงานรับจ้าง ค้นหาช่างสกรีน ช่างภาพ นักวาด และติดต่อจ้างงาน',
    countLabel: 'ผู้ให้บริการ'
  },
  {
    id: 'board',
    isTop3: true,
    icon: Megaphone,
    accentColor: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badge: 'โพสต์ประกาศ',
    title: 'กระดานโพสต์ข้อความบริการ',
    subtitle: 'หน้าสำหรับโพสต์ข้อความลงประกาศรับงาน หรือโพสต์หาฟรีแลนซ์/ทีมงานผลิตด่วน',
    countLabel: 'โพสต์อัปเดต'
  },
  {
    id: 'catalog',
    isTop3: false,
    icon: Layers,
    accentColor: 'from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badge: 'แคตตาล็อก',
    title: 'แคตตาล็อกวัสดุ & งานสกรีน',
    subtitle: 'คู่มือชนิดผ้า ตารางขนาดเสื้อ เทคนิคสกรีน DTG และสีมาตรฐาน',
    countLabel: 'คู่มือ 6 บท'
  },
  {
    id: 'faq',
    isTop3: false,
    icon: HelpCircle,
    accentColor: 'from-purple-500 to-indigo-500',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badge: 'ศูนย์ช่วยเหลือ',
    title: 'คำถามที่พบบ่อย & ข้อตกลงงาน',
    subtitle: 'ระยะเวลาผลิต การรับประกันงานสกรีน ขั้นตอนชำระเงิน และการจัดส่ง',
    countLabel: 'คำถามยอดนิยม'
  }
];

// Helper to generate dynamic aesthetic studio folder cover graphics via HTML5 Canvas
const generateAIFolderCover = (title: string, styleTheme: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const palettes: Record<string, [string, string, string]> = {
    streetwear: ['#0f172a', '#e11d48', '#fbbf24'],
    minimal: ['#f8fafc', '#475569', '#0284c7'],
    cyber: ['#09090b', '#06b6d4', '#ec4899'],
    creative: ['#1e1b4b', '#8b5cf6', '#f43f5e']
  };

  const [bgStart, accent1, accent2] = palettes[styleTheme] || palettes.streetwear;

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 640, 360);
  grad.addColorStop(0, bgStart);
  grad.addColorStop(1, '#18181b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 360);

  // Abstract Graphic Glow Circles
  ctx.save();
  ctx.globalAlpha = 0.35;
  const radGrad1 = ctx.createRadialGradient(180, 140, 10, 180, 140, 220);
  radGrad1.addColorStop(0, accent1);
  radGrad1.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad1;
  ctx.beginPath();
  ctx.arc(180, 140, 220, 0, Math.PI * 2);
  ctx.fill();

  const radGrad2 = ctx.createRadialGradient(480, 240, 10, 480, 240, 200);
  radGrad2.addColorStop(0, accent2);
  radGrad2.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad2;
  ctx.beginPath();
  ctx.arc(480, 240, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Subtle studio grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 40; x < 640; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 360);
    ctx.stroke();
  }
  for (let y = 40; y < 360; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }

  // Folder Badge Icon Shape
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.roundRect?.(40, 40, 140, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('✦ AI STUDIO COVER', 52, 61);

  // Folder Title Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  const cleanTitle = title.trim() || 'CREATIVE FOLDER';
  ctx.fillText(cleanTitle.slice(0, 24), 40, 280);

  // Subtitle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '14px sans-serif';
  ctx.fillText('TokDesign Custom Folder · Official Studio Asset', 40, 312);

  return canvas.toDataURL('image/png');
};

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  onOpenCreateModal,
  onOpenTokTakShop
}) => {
  // Folder navigation state: null = root folders overview, or folder id string
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [foldersList, setFoldersList] = useState<FolderItem[]>(BASE_FOLDERS);

  // Create Folder Modal State
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [folderTabMode, setFolderTabMode] = useState<'info' | 'cover'>('info');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [newFolderBadge, setNewFolderBadge] = useState('สำหรับลูกค้า');
  const [newFolderCover, setNewFolderCover] = useState<string | null>(null);
  const [selectedAIStyle, setSelectedAIStyle] = useState('streetwear');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [folderCreatedSuccess, setFolderCreatedSuccess] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  // Customer Brief Studio state
  const [briefs, setBriefs] = useState<CustomBrief[]>(INITIAL_BRIEFS);
  const [briefTitle, setBriefTitle] = useState('');
  const [briefCategory, setBriefCategory] = useState('สกรีนเสื้อยืด');
  const [briefBudget, setBriefBudget] = useState('1500');
  const [briefDays, setBriefDays] = useState('3');
  const [briefDetails, setBriefDetails] = useState('');
  const [briefImage, setBriefImage] = useState<string | null>(null);
  const [briefSuccess, setBriefSuccess] = useState(false);
  const briefFileInputRef = useRef<HTMLInputElement | null>(null);

  // Community & Service Post state
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [postType, setPostType] = useState<'hire' | 'offer' | 'discuss'>('offer');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postBudget, setPostBudget] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  // Custom folder internal tab switch
  const [customFolderTab, setCustomFolderTab] = useState<'brief' | 'post'>('brief');

  // Freelance service list search/filter state
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const currentFolder = foldersList.find((f) => f.id === activeFolderId);

  // Handle AI Image Generation for Folder Cover
  const handleGenerateAICover = () => {
    setIsGeneratingCover(true);
    setTimeout(() => {
      const generatedImg = generateAIFolderCover(
        newFolderName || 'สตูดิโอสร้างสรรค์',
        selectedAIStyle
      );
      setNewFolderCover(generatedImg);
      setIsGeneratingCover(false);
    }, 600);
  };

  const handleUploadCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFolderCover(URL.createObjectURL(file));
    }
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    // If user has no cover image, auto-generate one!
    const finalCover =
      newFolderCover || generateAIFolderCover(newFolderName, selectedAIStyle);

    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      isTop3: true,
      icon: FolderPlus,
      coverImage: finalCover,
      accentColor: 'from-rose-500 to-amber-500',
      badgeBg: 'bg-rose-50 text-rose-600 border-rose-200',
      badge: newFolderBadge,
      title: newFolderName.trim(),
      subtitle: newFolderDesc.trim() || 'โฟลเดอร์สำหรับสร้างงานและโพสต์ข้อความบริการ',
      countLabel: 'เพิ่งสร้างใหม่',
      isCustom: true
    };

    setFoldersList([newFolder, ...foldersList]);
    setFolderCreatedSuccess(true);
    setTimeout(() => {
      setFolderCreatedSuccess(false);
      setIsCreateFolderModalOpen(false);
      setNewFolderName('');
      setNewFolderDesc('');
      setNewFolderCover(null);
      // Automatically open the new folder!
      setActiveFolderId(newFolder.id);
    }, 1200);
  };

  // Handle Customer Brief Submission
  const handleBriefSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBrief: CustomBrief = {
      id: `brief-${Date.now()}`,
      folderId: activeFolderId || undefined,
      title: briefTitle.trim() || 'งานสั่งทำสกรีน/ออกแบบตามสั่ง',
      category: briefCategory,
      budget: Number(briefBudget) || 1000,
      deadlineDays: Number(briefDays) || 3,
      details: briefDetails.trim() || 'ต้องการชิ้นงานพรีเมียม ส่งงานตรงเวลา',
      referenceUrl: briefImage || undefined,
      status: 'pending',
      createdAt: 'เมื่อสักครู่'
    };

    setBriefs([newBrief, ...briefs]);
    setBriefSuccess(true);
    setTimeout(() => {
      setBriefSuccess(false);
      setBriefTitle('');
      setBriefDetails('');
      setBriefImage(null);
    }, 1800);
  };

  // Handle Community Post Submission
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      folderId: activeFolderId || undefined,
      authorName: 'คุณ (ผู้ใช้)',
      authorHandle: '@artisan.bkk',
      authorAvatar: '/src/assets/images/creator_avatar_1794023819826.jpg',
      type: postType,
      title: postTitle.trim(),
      content: postContent.trim(),
      budget: postBudget.trim() || undefined,
      repliesCount: 0,
      timeAgo: 'เมื่อสักครู่'
    };

    setPosts([newPost, ...posts]);
    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      setPostTitle('');
      setPostContent('');
      setPostBudget('');
    }, 1800);
  };

  const handleBriefFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBriefImage(URL.createObjectURL(file));
    }
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setSelectedService(null);
      setInquiryText('');
    }, 1500);
  };

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] pb-20 bg-slate-50 text-slate-900 select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-3.5 pt-3 pb-2.5 border-b border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeFolderId && (
              <button
                onClick={() => setActiveFolderId(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition active:scale-95 border border-slate-200/80 mr-0.5"
                title="ย้อนกลับไปหน้าโฟลเดอร์"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-wide flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-cyan-600" />
                <span>{activeFolderId ? currentFolder?.title : 'อื่นๆ (บริการ & ครีเอทีฟ)'}</span>
              </h2>
              <p className="text-[10px] text-slate-500">
                {activeFolderId
                  ? 'อยู่ในโฟลเดอร์สำหรับจัดการงาน'
                  : 'เลือกโฟลเดอร์เพื่อสร้างงาน บรีฟลูกค้า หรือโพสต์ประกาศบริการ'}
              </p>
            </div>
          </div>

          {/* Trigger Button to Open Create Folder Modal */}
          <button
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition active:scale-95 shadow-xs flex items-center gap-1 shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>สร้างโฟลเดอร์</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. ROOT VIEW: 3 TOP PROMINENT FOLDERS + SECONDARY FOLDERS */}
      {/* ======================================================== */}
      {!activeFolderId && (
        <div className="p-3.5 space-y-3.5">
          {/* TokTak shop สำหรับครีเอเตอร์ Menu Button with right chevron */}
          <button
            onClick={onOpenTokTakShop}
            className="w-full p-3 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 hover:from-amber-500/15 hover:to-purple-500/15 border border-amber-300/80 rounded-2xl flex items-center justify-between shadow-xs transition active:scale-[0.99] group bg-white text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    TokTak shop สำหรับครีเอเตอร์
                  </span>
                  <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs">
                    สร้างรายได้
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  แตะเพื่อเปิดหน้าสมัครปักตะกร้า • ค่าคอมมิชชัน 10-35%
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-rose-50 flex items-center justify-center text-slate-400 group-hover:text-rose-600 transition shrink-0 ml-2">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>

          {/* Section 1: 3 Prominent Top Folders */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>📁 โฟลเดอร์บริการหลัก</span>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 font-semibold px-1.5 py-0.2 rounded-full">
                  {foldersList.filter((f) => f.isTop3).length} โฟลเดอร์หลัก
                </span>
              </span>
              <button
                onClick={() => setIsCreateFolderModalOpen(true)}
                className="text-[10px] text-cyan-700 hover:text-cyan-800 font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>เพิ่มโฟลเดอร์</span>
              </button>
            </div>

            {/* Prominent Folders Stack / Grid */}
            <div className="space-y-2.5">
              {foldersList.filter((f) => f.isTop3).map((folder, idx) => {
                const IconComponent = folder.icon || Folder;
                return (
                  <div
                    key={folder.id}
                    onClick={() => setActiveFolderId(folder.id)}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition cursor-pointer active:scale-[0.99] group relative overflow-hidden"
                  >
                    {/* Top right count badge */}
                    <div className="absolute top-0 right-0 px-3 py-1 bg-slate-100/70 rounded-bl-xl border-l border-b border-slate-200/60 flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-slate-500">{folder.countLabel}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      {/* Folder Cover Image or Icon Gradient */}
                      {folder.coverImage ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shadow-xs group-hover:scale-105 transition-transform shrink-0 bg-slate-100">
                          <img
                            src={folder.coverImage}
                            alt={folder.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${folder.accentColor || 'from-cyan-500 to-blue-500'} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 pr-16">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${folder.badgeBg}`}>
                            {folder.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">0{idx + 1}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition leading-snug">
                          {folder.title}
                        </h3>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                          {folder.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Secondary / Resource Folders */}
          <div className="pt-1">
            <span className="text-xs font-bold text-slate-700 block mb-2 px-0.5">
              📁 โฟลเดอร์ข้อมูลและคู่มืองาน
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {foldersList.filter((f) => !f.isTop3).map((folder) => {
                const IconComponent = folder.icon || Folder;
                return (
                  <div
                    key={folder.id}
                    onClick={() => setActiveFolderId(folder.id)}
                    className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 transition cursor-pointer active:scale-[0.98] group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 flex items-center justify-center mb-2 transition">
                        <IconComponent className="w-4 h-4 text-cyan-600" />
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-900 group-hover:text-cyan-700 transition line-clamp-1">
                        {folder.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {folder.subtitle}
                      </p>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 mt-2 block">
                      {folder.countLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CUSTOM USER-CREATED FOLDER VIEW                       */}
      {/* ======================================================== */}
      {activeFolderId && currentFolder?.isCustom && (
        <div className="p-3.5 space-y-4">
          {/* Custom Folder Banner with Cover Image */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900 text-white">
            {currentFolder.coverImage && (
              <img
                src={currentFolder.coverImage}
                alt={currentFolder.title}
                className="w-full h-32 object-cover opacity-80"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5 flex flex-col justify-end">
              <span className="text-[9px] font-semibold bg-rose-500 text-white px-2 py-0.5 rounded-full w-fit mb-1">
                {currentFolder.badge}
              </span>
              <h3 className="text-sm font-bold text-white leading-tight">{currentFolder.title}</h3>
              <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-1">{currentFolder.subtitle}</p>
            </div>
          </div>

          {/* Internal Tab switcher: เครื่องมือสร้างงาน vs โพสต์ข้อความบริการ */}
          <div className="grid grid-cols-2 bg-slate-200/80 p-1 rounded-xl text-center">
            <button
              onClick={() => setCustomFolderTab('brief')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                customFolderTab === 'brief'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛠️ เครื่องมือสร้างงาน/บรีฟ
            </button>
            <button
              onClick={() => setCustomFolderTab('post')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                customFolderTab === 'post'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📢 โพสต์ข้อความบริการ
            </button>
          </div>

          {/* Tab 1: Brief Tool inside custom folder */}
          {customFolderTab === 'brief' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-rose-500" />
                <span>สร้างงานในโฟลเดอร์นี้</span>
              </h4>

              {briefSuccess ? (
                <div className="py-5 text-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-1 animate-bounce" />
                  <p className="text-xs font-bold text-slate-900">บันทึกบรีฟงานเรียบร้อยแล้ว!</p>
                </div>
              ) : (
                <form onSubmit={handleBriefSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="หัวข้องานที่ต้องการสั่งทำ..."
                    value={briefTitle}
                    onChange={(e) => setBriefTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={briefCategory}
                      onChange={(e) => setBriefCategory(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none"
                    >
                      <option value="สกรีนเสื้อยืด">👕 สกรีนเสื้อยืด</option>
                      <option value="เคสมือถือ">📱 เคสมือถือ</option>
                      <option value="กระเป๋าผ้า">👜 กระเป๋าผ้า</option>
                      <option value="ออกแบบกราฟิกใหม่">🎨 ออกแบบกราฟิก</option>
                    </select>
                    <input
                      type="number"
                      placeholder="งบประมาณ (฿)"
                      value={briefBudget}
                      onChange={(e) => setBriefBudget(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="รายละเอียดชิ้นงานที่ต้องการ..."
                    value={briefDetails}
                    onChange={(e) => setBriefDetails(e.target.value)}
                    required
                    className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-xs"
                  >
                    ส่งบรีฟงานลงโฟลเดอร์นี้
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Post tool inside custom folder */}
          {customFolderTab === 'post' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                <span>โพสต์ข้อความบริการในโฟลเดอร์นี้</span>
              </h4>

              {postSuccess ? (
                <div className="py-5 text-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-1 animate-bounce" />
                  <p className="text-xs font-bold text-slate-900">โพสต์ข้อความสำเร็จ!</p>
                </div>
              ) : (
                <form onSubmit={handlePostSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="หัวข้อประกาศข้อความบริการ..."
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="เนื้อหาข้อความบริการ..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-xs"
                  >
                    โพสต์ข้อความทันที
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. FOLDER 1: เครื่องมือสำหรับลูกค้าเข้ามาสร้างงานตามสั่ง */}
      {/* ======================================================== */}
      {activeFolderId === 'brief-tool' && (
        <div className="p-3.5 space-y-4">
          {/* Creator Tool Banner */}
          <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-900">
                เครื่องมือสร้างงาน & บรีฟโจทย์สำหรับลูกค้า
              </h3>
            </div>
            <p className="text-[11px] text-slate-600">
              กรอกความต้องการของคุณเพื่อเปิดรับใบเสนอราคาจากช่างสกรีนและนักออกแบบในระบบ
            </p>
          </div>

          {/* Customer Brief Creation Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 mb-2.5 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-rose-500" />
              <span>สร้างใบสั่งงานใหม่ (New Custom Brief)</span>
            </h4>

            {briefSuccess ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-1.5 animate-bounce" />
                <p className="text-xs font-bold text-slate-900">สร้างบรีฟงานสั่งทำเรียบร้อยแล้ว!</p>
                <p className="text-[10px] text-slate-500 mt-0.5">ช่างและดีไซเนอร์จะเริ่มส่งใบเสนอราคาให้คุณ</p>
              </div>
            ) : (
              <form onSubmit={handleBriefSubmit} className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">
                    หัวข้องานที่คุณต้องการสั่งทำ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น สกรีนเสื้อทีม 20 ตัว ลายมินิมอล, เคสคู่รัก..."
                    value={briefTitle}
                    onChange={(e) => setBriefTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      ประเภทชิ้นงาน
                    </label>
                    <select
                      value={briefCategory}
                      onChange={(e) => setBriefCategory(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500"
                    >
                      <option value="สกรีนเสื้อยืด">👕 สกรีนเสื้อยืด</option>
                      <option value="เคสมือถือ">📱 เคสมือถือ</option>
                      <option value="กระเป๋าผ้า">👜 กระเป๋าผ้า</option>
                      <option value="ออกแบบกราฟิกใหม่">🎨 ออกแบบกราฟิก</option>
                      <option value="ตัดต่อวิดีโอคลิป">🎬 ตัดต่อคลิป</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      งบประมาณที่ตั้งไว้ (฿)
                    </label>
                    <input
                      type="number"
                      value={briefBudget}
                      onChange={(e) => setBriefBudget(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">
                    รายละเอียดบรีฟงาน (จำนวน, สี, ขนาด, ข้อความที่ต้องการ)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ระบุสเปกงานที่ต้องการให้ครบถ้วน..."
                    value={briefDetails}
                    onChange={(e) => setBriefDetails(e.target.value)}
                    required
                    className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500 placeholder:text-slate-400"
                  />
                </div>

                {/* Reference upload */}
                <div>
                  <input
                    type="file"
                    ref={briefFileInputRef}
                    accept="image/*"
                    onChange={handleBriefFile}
                    className="hidden"
                  />
                  {briefImage ? (
                    <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200">
                      <img src={briefImage} alt="Ref" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setBriefImage(null)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => briefFileInputRef.current?.click()}
                      className="w-full py-2 bg-slate-50 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-[11px] text-slate-600 flex items-center justify-center gap-1.5 active:scale-95 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-rose-500" />
                      <span>แนบภาพตัวอย่างเรฟเฟอเรนซ์ (Reference Image)</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95 flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>บันทึกและส่งบรีฟงาน</span>
                </button>
              </form>
            )}
          </div>

          {/* List of Created Briefs */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              ประวัติบรีฟงานของฉัน ({briefs.length})
            </h4>
            <div className="space-y-2">
              {briefs.map((b) => (
                <div key={b.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded border border-rose-200">
                      {b.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{b.createdAt}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">{b.title}</h5>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{b.details}</p>
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-600 tabular-nums">งบประมาณ ฿{b.budget}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ● กำลังเปิดรับช่าง
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FOLDER 2: ตลาดบริการฟรีแลนซ์ (Freelance Services List) */}
      {/* ======================================================== */}
      {activeFolderId === 'market' && (
        <div className="p-3.5 space-y-3">
          {/* Search inside folder */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาบริการ เช่น ออกแบบลายเสื้อ, ตัดต่อคลิป..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-600 placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Service items */}
          <div className="space-y-3">
            {services
              .filter(
                (s) =>
                  s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                  s.creatorName.toLowerCase().includes(serviceSearch.toLowerCase())
              )
              .map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs hover:border-slate-300 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <img
                        src={service.creatorAvatar}
                        alt={service.creatorName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800">{service.creatorName}</h4>
                        <span className="text-[10px] text-slate-400">{service.creatorHandle}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-700 tabular-nums">{service.rating}</span>
                      <span className="text-slate-400">({service.reviewCount})</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition leading-snug mb-1">
                    {service.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">เริ่มต้น</span>
                      <span className="text-sm font-bold text-cyan-700 tabular-nums">
                        ฿{service.startingPrice}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>เสร็จใน {service.turnaroundDays} วัน</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                      className="px-3 py-1 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg transition active:scale-95 flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>จ้างงาน</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FOLDER 3: กระดานโพสต์ข้อความบริการ & หาคนทำงาน         */}
      {/* ======================================================== */}
      {activeFolderId === 'board' && (
        <div className="p-3.5 space-y-4">
          {/* Post Creation Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              <span>โพสต์ข้อความสำหรับบริการ / หาฟรีแลนซ์</span>
            </h4>

            {postSuccess ? (
              <div className="py-5 text-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-1 animate-bounce" />
                <p className="text-xs font-bold text-slate-900">โพสต์ข้อความขึ้นกระดานสำเร็จ!</p>
              </div>
            ) : (
              <form onSubmit={handlePostSubmit} className="space-y-2.5">
                <div className="flex gap-1.5">
                  {[
                    { id: 'offer' as const, label: '💼 เสนอบริการ' },
                    { id: 'hire' as const, label: '📢 หาคนทำงาน' },
                    { id: 'discuss' as const, label: '💬 พูดคุยขอคำแนะนำ' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPostType(t.id)}
                      className={`flex-1 py-1 text-[10px] font-semibold rounded-lg border transition ${
                        postType === t.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="หัวข้อประกาศ..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500"
                />

                <textarea
                  rows={2}
                  placeholder="รายละเอียดข้อความ หรือสิ่งที่ต้องการ..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 placeholder:text-slate-400"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="งบประมาณ (ระบุหรือไม่ก็ได้)"
                    value={postBudget}
                    onChange={(e) => setPostBudget(e.target.value)}
                    className="flex-1 bg-slate-50 text-slate-900 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition active:scale-95 shadow-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>โพสต์ทันที</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Posts Feed */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              ประกาศล่าสุดบนกระดาน ({posts.length})
            </h4>
            <div className="space-y-2.5">
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {post.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400">{post.timeAgo}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                        post.type === 'offer'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : post.type === 'hire'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {post.type === 'offer' ? 'เสนอบริการ' : post.type === 'hire' ? 'หาคนทำงาน' : 'พูดคุย'}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 mb-1">{post.title}</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{post.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    {post.budget ? (
                      <span className="font-bold text-amber-600 text-[11px]">{post.budget}</span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">ติดต่อพูดคุย</span>
                    )}

                    <button
                      onClick={() => alert(`เปิดแชทกับ ${post.authorName}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold rounded-md transition active:scale-95 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-cyan-600" />
                      <span>ตอบกลับ / ติดต่อ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. FOLDER 4: แคตตาล็อกวัสดุ & งานสกรีน                    */}
      {/* ======================================================== */}
      {activeFolderId === 'catalog' && (
        <div className="p-3.5 space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              เทคนิคการพิมพ์ & วัสดุมาตรฐานสตูดิโอ
            </h4>

            <div className="space-y-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-900 block">1. การสกรีนระบบ DTG (Direct to Garment)</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  พิมพ์ลงบนเนื้อผ้าโดยตรงด้วยหมึกแท้คมชัด สีสันสดใส ไม่มีขั้นต่ำ เหมาะสำหรับเสื้อยืดและกระเป๋าผ้า
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-900 block">2. เคสมือถือ UV Hybrid Printing</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  พิมพ์ระบบ UV นูนสัมผัสมีมิติ เคลือบด้านกันรอยนิ้วมือและกันการหลุดลอก 100%
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-900 block">3. ชนิดผ้าคอตตอน Comb 100% (260 GSM)</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  ผ้าเกรดพรีเมียม สัมผัสนุ่ม ไม่หด ไม่ย้วย ระบายอากาศได้ดีเยี่ยม เหมาะกับสภาพอากาศเมืองไทย
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. FOLDER 5: FAQ & ข้อตกลงงาน                            */}
      {/* ======================================================== */}
      {activeFolderId === 'faq' && (
        <div className="p-3.5 space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              คำถามที่พบบ่อย (FAQ)
            </h4>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900">Q: สั่งสกรีนเสื้อตัวเดียวได้ไหม?</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  A: ได้เลยครับ ระบบของเรารองรับการสั่งทำแบบ No Minimum (ไม่มีขั้นต่ำ) เริ่มต้นที่ 1 ตัว
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900">Q: ใช้เวลาผลิตและจัดส่งกี่วัน?</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  A: ระยะเวลาผลิต 1-3 วันทำการ และจัดส่งด่วน 1-2 วันถึงหน้าบ้านครับ
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900">Q: หากสินค้ามีตำหนิหรือลายพิมพ์ผิด?</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  A: มีการรับประกันพิมพ์ใหม่หรือคืนเงินเต็มจำนวนภายใน 7 วันหลังได้รับสินค้า
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. CREATE FOLDER MODAL (ชื่อโฟลเดอร์ + รูปปก หรือ AI เจนภาพ)  */}
      {/* ======================================================== */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">สร้างโฟลเดอร์ใหม่</h3>
              </div>
              <button
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {folderCreatedSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-900">สร้างโฟลเดอร์สำเร็จ!</h4>
                <p className="text-xs text-slate-500 mt-1">กำลังนำคุณเข้าสู่พื้นที่ทำงานในโฟลเดอร์...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateFolderSubmit} className="py-3 space-y-3.5">
                {/* Tab switch for Folder Info vs Folder Cover */}
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-center">
                  <button
                    type="button"
                    onClick={() => setFolderTabMode('info')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                      folderTabMode === 'info'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    1. ข้อมูลโฟลเดอร์
                  </button>
                  <button
                    type="button"
                    onClick={() => setFolderTabMode('cover')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                      folderTabMode === 'cover'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    2. รูปปกโฟลเดอร์ (AI/อัปโหลด)
                  </button>
                </div>

                {/* TAB 1: FOLDER INFO */}
                {folderTabMode === 'info' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-700 block mb-1">
                        ชื่อโฟลเดอร์ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น สกรีนเสื้อวงดนตรี, โปรเจกต์เคสคู่รัก..."
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        required
                        className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-700 block mb-1">
                        คำอธิบายโฟลเดอร์
                      </label>
                      <textarea
                        rows={2}
                        placeholder="ระบุวัตถุประสงค์ เช่น รวมบรีฟงานสกรีนและโพสต์หาฟรีแลนซ์..."
                        value={newFolderDesc}
                        onChange={(e) => setNewFolderDesc(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-600 placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-700 block mb-1">
                        หมวดหมู่ / ป้ายกำกับ
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {['สำหรับลูกค้า', 'ตลาดบริการ', 'โปรเจกต์ด่วน', 'งานคัสตอม'].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setNewFolderBadge(b)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition ${
                              newFolderBadge === b
                                ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFolderTabMode('cover')}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <span>ถัดไป: ใส่รูปปกโฟลเดอร์</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    </button>
                  </div>
                )}

                {/* TAB 2: FOLDER COVER (AI Generate or Upload) */}
                {folderTabMode === 'cover' && (
                  <div className="space-y-3">
                    {/* Live Cover Preview Frame */}
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs flex items-center justify-center">
                      {newFolderCover ? (
                        <img
                          src={newFolderCover}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-1 opacity-60" />
                          <p className="text-xs font-semibold text-slate-300">
                            ยังไม่มีภาพปกโฟลเดอร์
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            กดปุ่มด้านล่างให้ AI เจนภาพให้ หรืออัปโหลดจากเครื่อง
                          </p>
                        </div>
                      )}

                      {/* Title overlay in preview */}
                      <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-left pointer-events-none">
                        <span className="text-[9px] text-amber-400 font-bold uppercase block">
                          {newFolderBadge}
                        </span>
                        <span className="text-xs font-bold text-white truncate block">
                          {newFolderName || 'ชื่อโฟลเดอร์ใหม่'}
                        </span>
                      </div>
                    </div>

                    {/* AI Generator Option */}
                    <div className="p-3 bg-gradient-to-r from-purple-50 via-cyan-50 to-rose-50 border border-purple-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>ให้ระบบ AI เจนภาพปกอัตโนมัติ</span>
                        </span>
                        <span className="text-[9px] text-purple-700 bg-purple-100 font-semibold px-1.5 py-0.2 rounded">
                          ฟรี ทันที
                        </span>
                      </div>

                      {/* Style choice */}
                      <div className="grid grid-cols-4 gap-1 text-[9px] font-semibold text-center">
                        {[
                          { id: 'streetwear', label: 'สตรีทแวร์' },
                          { id: 'minimal', label: 'มินิมอล' },
                          { id: 'cyber', label: 'นีออนไซเบอร์' },
                          { id: 'creative', label: 'ครีเอทีฟ' }
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setSelectedAIStyle(st.id)}
                            className={`py-1 rounded border transition ${
                              selectedAIStyle === st.id
                                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateAICover}
                        disabled={isGeneratingCover}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-105 active:scale-95 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        {isGeneratingCover ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>กำลังเจนภาพศิลปะด้วย AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>✨ คลิกเจนภาพปกด้วย AI ทันที</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Or Upload From Device */}
                    <div>
                      <input
                        type="file"
                        ref={coverFileInputRef}
                        accept="image/*"
                        onChange={handleUploadCoverFile}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="w-full py-2 bg-slate-50 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>หรือเลือกรูปปกจากเครื่องของคุณ</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Final Submit Button */}
                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateFolderModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={!newFolderName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>สร้างโฟลเดอร์ทันที</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Service Contact / Hire Modal for Marketplace Folder */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">รายละเอียดงานบริการ</span>
              <button
                onClick={() => setSelectedService(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inquirySuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
                <p className="text-slate-900 font-bold text-sm">ส่งคำขอจ้างงานเรียบร้อยแล้ว!</p>
                <p className="text-xs text-slate-500 mt-1">ผู้ให้บริการจะติดต่อกลับในกล่องข้อความโดยเร็วที่สุด</p>
              </div>
            ) : (
              <div className="py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedService.creatorAvatar}
                    alt={selectedService.creatorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{selectedService.creatorName}</h4>
                    <span className="text-[10px] text-slate-400">{selectedService.creatorHandle}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-900">{selectedService.title}</p>
                  <p className="text-[11px] text-slate-600">{selectedService.description}</p>
                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-cyan-700">
                    <span>ราคาประเมินเริ่มต้น ฿{selectedService.startingPrice}</span>
                    <span className="text-slate-500 text-[10px] font-normal">ระยะเวลา {selectedService.turnaroundDays} วัน</span>
                  </div>
                </div>

                <form onSubmit={handleSendInquiry} className="space-y-2.5">
                  <label className="text-[11px] text-slate-700 font-medium block">
                    ระบุรายละเอียดที่คุณต้องการให้ทำให้ชัดเจน:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="เช่น ต้องการออกแบบลายเสื้อ 2 ลาย สไตล์มินิมอล มีฟอนต์ตามตัวอย่าง..."
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    required
                    className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-600 placeholder:text-slate-400"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500 flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ส่งใบเสนอราคา/ข้อความ</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
