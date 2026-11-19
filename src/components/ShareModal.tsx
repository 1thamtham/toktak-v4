import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Share2, Send, Download } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  videoUrl
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white border-t border-slate-200 rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900">แชร์หรือดาวน์โหลด</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-[11px] text-slate-500 line-clamp-1">{title}</p>
          <div className="grid grid-cols-4 gap-3 text-center">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-1 group active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-700 transition border border-slate-200 shadow-2xs">
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </div>
              <span className="text-[10px] text-slate-700 font-medium">
                {copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="flex flex-col items-center gap-1 group active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 flex items-center justify-center transition border border-emerald-200/60 shadow-2xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-700 font-medium">LINE</span>
            </button>

            <button
              onClick={onClose}
              className="flex flex-col items-center gap-1 group active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 flex items-center justify-center transition border border-blue-200/60 shadow-2xs">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-700 font-medium">Facebook</span>
            </button>

            <button
              onClick={onClose}
              className="flex flex-col items-center gap-1 group active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 group-hover:bg-rose-100 flex items-center justify-center transition border border-rose-200/60 shadow-2xs">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-700 font-medium">Direct Msg</span>
            </button>
          </div>

          {videoUrl && (
            <div className="pt-2 border-t border-slate-100">
              <a
                href={videoUrl}
                download="tokdesign-video.mp4"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98]"
              >
                <Download className="w-4 h-4 text-rose-400" />
                <span>ดาวน์โหลดวิดีโอนี้ลงเครื่อง (HD MP4)</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
