import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { firebaseConfig } from '../firebase';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  isQuotaError: boolean;
  isDailyReadQuota: boolean;
}

export class FirebaseErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      isQuotaError: false,
      isDailyReadQuota: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const rawMsg = error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล';
    const isDailyReadQuota = rawMsg.includes(
      "Quota exceeded for quota metric 'Free daily read units per project (free tier database)'"
    );
    const isQuotaError = isDailyReadQuota || rawMsg.includes('Quota exceeded.');

    let friendlyMessage = 'ระบบกำลังรีเฟรชการเชื่อมต่อคลาวด์ กรุณาลองใหม่อีกครั้ง';
    if (isQuotaError) {
      friendlyMessage =
        'โควต้าการใช้งานฟรีรายวันของฐานข้อมูล Firebase เต็มแล้ว (โควต้าจะรีเซ็ตในวันถัดไป)';
    } else {
      try {
        const parsed = JSON.parse(rawMsg) as { error?: string };
        if (parsed?.error) {
          friendlyMessage = parsed.error;
        }
      } catch {
        friendlyMessage = rawMsg;
      }
    }

    return {
      hasError: true,
      errorMessage: friendlyMessage,
      isQuotaError,
      isDailyReadQuota,
    };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const upgradeUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;

    return (
      <div className="fixed inset-0 h-[100dvh] w-screen bg-slate-50 flex items-center justify-center p-5 text-slate-900">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-extrabold text-slate-900">
              {this.state.isQuotaError ? 'โควต้าฐานข้อมูล Firebase เต็ม' : 'ไม่สามารถเชื่อมต่อข้อมูลได้'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed break-words">
              {this.state.errorMessage}
            </p>
          </div>
          {this.state.isDailyReadQuota && (
            <a
              href={upgradeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
            >
              ตรวจสอบแพ็กเกจใน Firebase Console
            </a>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>โหลดหน้าเว็บใหม่</span>
          </button>
        </div>
      </div>
    );
  }
}
