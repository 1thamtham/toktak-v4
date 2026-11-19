import React from 'react';
import { Home, ShoppingBag, LayoutGrid, User, Plus } from 'lucide-react';
import { TabType, UserProfile } from '../types';

interface BottomTabBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCreateModal: () => void;
  cartCount?: number;
  currentUser?: UserProfile | null;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onTabChange,
  onOpenCreateModal,
  cartCount = 0,
  currentUser
}) => {
  return (
    <nav className="w-full bg-black border-t border-zinc-800 px-3 min-h-14 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] flex items-center justify-between shadow-2xl pointer-events-auto">
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => onTabChange('home')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[50px] cursor-pointer touch-manipulation ${
          currentTab === 'home' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5] text-white' : 'stroke-[2] text-zinc-400'}`} />
        <span className={`text-[10px] mt-0.5 tracking-tight ${currentTab === 'home' ? 'font-black text-white' : 'font-semibold text-zinc-400'}`}>
          หน้าแรก
        </span>
      </button>

      {/* 2. Shop */}
      <button
        type="button"
        onClick={() => onTabChange('shop')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[50px] relative cursor-pointer touch-manipulation ${
          currentTab === 'shop' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <ShoppingBag className={`w-5 h-5 ${currentTab === 'shop' ? 'stroke-[2.5] text-white' : 'stroke-[2] text-zinc-400'}`} />
        <span className={`text-[10px] mt-0.5 tracking-tight ${currentTab === 'shop' ? 'font-black text-white' : 'font-semibold text-zinc-400'}`}>
          ร้านค้า
        </span>
        {cartCount > 0 && (
          <span className="absolute top-0.5 right-3 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
            {cartCount}
          </span>
        )}
      </button>

      {/* 3. Center TikTok Plus (+) Button */}
      <div className="flex-1 flex items-center justify-center">
        <button
          type="button"
          onClick={onOpenCreateModal}
          aria-label="สร้างคอนเทนต์หรือลงขาย"
          className="relative group w-11 h-7 flex items-center justify-center transition-transform active:scale-90 cursor-pointer touch-manipulation"
        >
          {/* TikTok signature cyan / magenta wings */}
          <div className="absolute inset-0 bg-[#00f2fe] rounded-lg -translate-x-[2px] opacity-95 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-[#fe0979] rounded-lg translate-x-[2px] opacity-95 group-hover:opacity-100" />
          {/* Center high-contrast white block inside dark bar */}
          <div className="relative w-8 h-7 bg-white rounded-md flex items-center justify-center text-black shadow-xs">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
        </button>
      </div>

      {/* 4. Other / Services */}
      <button
        type="button"
        onClick={() => onTabChange('services')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[50px] cursor-pointer touch-manipulation ${
          currentTab === 'services' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <LayoutGrid className={`w-5 h-5 ${currentTab === 'services' ? 'stroke-[2.5] text-white' : 'stroke-[2] text-zinc-400'}`} />
        <span className={`text-[10px] mt-0.5 tracking-tight ${currentTab === 'services' ? 'font-black text-white' : 'font-semibold text-zinc-400'}`}>
          อื่นๆ
        </span>
      </button>

      {/* 5. Profile */}
      <button
        type="button"
        onClick={() => onTabChange('profile')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[50px] relative cursor-pointer touch-manipulation ${
          currentTab === 'profile' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        {currentUser?.avatar ? (
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className={`w-5 h-5 rounded-full object-cover ${
                currentTab === 'profile' ? 'ring-2 ring-white' : 'ring-1 ring-zinc-500'
              }`}
            />
            {currentUser.isGoogleVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full ring-1 ring-black" />
            )}
          </div>
        ) : (
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5] text-white' : 'stroke-[2] text-zinc-400'}`} />
        )}
        <span className={`text-[10px] mt-0.5 tracking-tight ${currentTab === 'profile' ? 'font-black text-white' : 'font-semibold text-zinc-400'}`}>
          โปรไฟล์
        </span>
      </button>
    </nav>
  );
};
