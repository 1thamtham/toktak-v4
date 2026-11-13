import React from 'react';
import { Search, Sparkles, Radio, Crown } from 'lucide-react';

interface TopBarProps {
  feedType: 'following' | 'foryou' | 'live';
  onFeedTypeChange: (type: 'following' | 'foryou') => void;
  onOpenLive: () => void;
  onOpenDesignStudio: () => void;
  onOpenSearch?: () => void;
  isSuperadmin?: boolean;
  isAdmin?: boolean;
  onOpenAdminBackend?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  feedType,
  onFeedTypeChange,
  onOpenLive,
  onOpenDesignStudio,
  onOpenSearch,
  isSuperadmin = false,
  isAdmin = false,
  onOpenAdminBackend
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-2 py-2 flex items-center justify-between pointer-events-auto bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* 1. Left: Live Broadcast Button */}
      <button
        onClick={onOpenLive}
        aria-label="ดูไลฟ์สด"
        className="px-2 py-1 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-600 flex items-center gap-1 font-bold text-[10px] shadow-2xs transition active:scale-95 shrink-0"
      >
        <Radio className="w-3 h-3 animate-pulse text-rose-500" />
        <span className="tracking-tight">LIVE</span>
      </button>

      {/* 2. Center: Feed navigation tabs & Studio button */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={() => onFeedTypeChange('following')}
          className={`px-1.5 py-0.5 text-[11px] font-medium transition-all relative ${
            feedType === 'following'
              ? 'text-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ติดตาม
          {feedType === 'following' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-slate-900 rounded-full" />
          )}
        </button>

        <span className="text-slate-300 text-[10px]">|</span>

        <button
          onClick={() => onFeedTypeChange('foryou')}
          className={`px-1.5 py-0.5 text-[11px] font-medium transition-all relative ${
            feedType === 'foryou'
              ? 'text-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          สำหรับคุณ
          {feedType === 'foryou' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-slate-900 rounded-full" />
          )}
        </button>

        {/* Studio Button */}
        <button
          onClick={onOpenDesignStudio}
          className="ml-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-2xs hover:brightness-105 active:scale-95 transition flex items-center gap-0.5 shrink-0"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>🎨 ออกแบบ</span>
        </button>
      </div>

      {/* 3. Right: Superadmin Console (if admin) + Search Button */}
      <div className="flex items-center gap-1 shrink-0">
        {(isSuperadmin || isAdmin) && onOpenAdminBackend && (
          <button
            onClick={onOpenAdminBackend}
            title="เปิดระบบจัดการหลังบ้าน Superadmin"
            className="px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/50 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition active:scale-90"
          >
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="hidden xs:inline">หลังบ้าน</span>
          </button>
        )}

        <button
          onClick={onOpenSearch}
          aria-label="ค้นหา"
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition active:scale-95 border border-slate-200/60 shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
