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
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white border-t border-gray-200 px-3 h-14 flex items-center justify-between shadow-lg">
      {/* 1. Home */}
      <button
        onClick={() => onTabChange('home')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[50px] ${
          currentTab === 'home' ? 'text-black' : 'text-gray-800 hover:text-orange-500'
        }`}
      >
        <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5] text-black' : 'stroke-[2] text-gray-800'}`} />
        <span className={`text-[10px] mt-0.5 tracking-tight ${currentTab === 'home' ? 'font-black text-black' : 'font-bold text-gray-800'}`}>
          หน้าแรก
        </span>
      </button>

      {/* 2. Shop */}
      <button
        onClick={() => onTabChange('shop')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[50px] relative ${
          currentTab === 'shop' ? 'text-black' : 'text-gray-800 hover:text-orange-500'
        }`}
      >
        <ShoppingBag className={`w-5 h-5 ${currentTab === 'shop' ? 'stroke-[2.5] text-black' : 'stroke-[2] text-gray-800'}`} />
        <span className={`text-[10px] mt-0.5 tracking-tight ${currentTab === 'shop' ? 'font-black text-black' : 'font-bold text-gray-800'}`}>
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
          onClick={onOpenCreateModal}
          aria-label="สร้างคอนเทนต์หรือลงขาย"
          className="relative group w-11 h-7 flex items-center justify-center transition-transform active:scale-90"
        >
          {/* TikTok signature cyan / magenta wings */}
          <div className="absolute inset-0 bg-[#00f2fe] rounded-lg -translate-x-[2px] opacity-90 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-[#fe0979] rounded-lg translate-x-[2px] opacity-90 group-hover:opacity-100" />
          {/* Center dark/contrast block inside button */}
          <div className="relative w-8 h-7 bg-black rounded-md flex items-center justify-center text-white shadow-xs">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
        </button>
      </div>

      {/* 4. Other / Services */}
      <button
        onClick={() => onTabChange('services')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[50px] ${
          currentTab === 'services' ? 'text-black' : 'text-gray-800 hover:text-orange-500'
        }`}
      >
        <LayoutGrid className={`w-5 h-5 ${currentTab === 'services' ? 'stroke-[2.5] text-black' : 'stroke-[2] text-gray-800'}`} />
        <span className={`text-[10px] mt-0.5 tracking-tight ${currentTab === 'services' ? 'font-black text-black' : 'font-bold text-gray-800'}`}>
          อื่นๆ
        </span>
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => onTabChange('profile')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[50px] relative ${
          currentTab === 'profile' ? 'text-black' : 'text-gray-800 hover:text-orange-500'
        }`}
      >
        {currentUser?.avatar ? (
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className={`w-5 h-5 rounded-full object-cover ${
                currentTab === 'profile' ? 'ring-2 ring-black' : 'ring-1 ring-gray-400'
              }`}
            />
            {currentUser.isGoogleVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full ring-1 ring-white" />
            )}
          </div>
        ) : (
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5] text-black' : 'stroke-[2] text-gray-800'}`} />
        )}
        <span className={`text-[10px] mt-0.5 tracking-tight ${currentTab === 'profile' ? 'font-black text-black' : 'font-bold text-gray-800'}`}>
          โปรไฟล์
        </span>
      </button>
    </nav>
  );
};
