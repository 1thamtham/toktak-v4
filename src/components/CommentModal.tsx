import React, { useState } from 'react';
import { X, Heart, Send } from 'lucide-react';
import { CommentItem } from '../types';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoCaption: string;
}

const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: 'c-1',
    userName: 'Tanawat_K',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    text: 'ลายเสื้อเท่มากครับ สั่งทำใส่ชื่อตัวเองได้เลยใช่มั้ยครับ? 🔥',
    timeAgo: '1ชม.',
    likes: 24,
    isLiked: false
  },
  {
    id: 'c-2',
    userName: 'Ploy_Art',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    text: 'ชอบสีเคสอันที่ 2 มากกก ออกแบบเองง่ายสุดๆ',
    timeAgo: '3ชม.',
    likes: 15,
    isLiked: true
  },
  {
    id: 'c-3',
    userName: 'Golf_Street',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    text: 'กระเป๋าผ้าเนื้อหนาดีมากครับ ได้รับของแล้วงานเนี๊ยบจริง ✨',
    timeAgo: '1วัน',
    likes: 8,
    isLiked: false
  }
];

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  videoCaption
}) => {
  const [comments, setComments] = useState<CommentItem[]>(DEFAULT_COMMENTS);
  const [newText, setNewText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      userName: 'คุณ (ผู้ใช้)',
      userAvatar: '/src/assets/images/creator_avatar_1794023819826.jpg',
      text: newText.trim(),
      timeAgo: 'เมื่อสักครู่',
      likes: 0,
      isLiked: false
    };

    setComments([newComment, ...comments]);
    setNewText('');
  };

  const toggleLike = (id: string) => {
    setComments(
      comments.map((c) =>
        c.id === id
          ? {
              ...c,
              likes: c.isLiked ? c.likes - 1 : c.likes + 1,
              isLiked: !c.isLiked
            }
          : c
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white border-t border-slate-200 rounded-t-3xl h-[65vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="w-6" />
          <span className="text-xs font-bold text-slate-900">
            ความคิดเห็น ({comments.length})
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start">
              <img
                src={comment.userAvatar}
                alt={comment.userName}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">
                    {comment.userName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {comment.timeAgo}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  {comment.text}
                </p>
              </div>
              <button
                onClick={() => toggleLike(comment.id)}
                className="flex flex-col items-center pt-1 text-slate-400 hover:text-rose-500 transition"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    comment.isLiked ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
                <span className="text-[9px] mt-0.5">{comment.likes}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Input */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="เพิ่มความคิดเห็นที่สร้างสรรค์..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 bg-slate-100 text-slate-900 text-xs px-3 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!newText.trim()}
            className="w-8 h-8 rounded-full bg-rose-500 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition active:scale-95 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
