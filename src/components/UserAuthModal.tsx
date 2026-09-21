import React from 'react';
import { LogOut, Cloud, ShieldCheck, User as UserIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { ColorTheme, SyncStatus } from '../types';
import { THEME_CONFIGS } from '../utils/theme';
import { formatJPY } from '../utils/format';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  onForceSync: () => Promise<void>;
  totalTransactionsCount: number;
  totalCategoriesCount: number;
  colorTheme?: ColorTheme;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignIn,
  onSignOut,
  syncStatus,
  lastSyncedAt,
  onForceSync,
  totalTransactionsCount,
  totalCategoriesCount,
  colorTheme = 'amber',
}) => {
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const curConfig = THEME_CONFIGS[colorTheme];

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await onSignIn();
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (!window.confirm('Googleアカウントからログアウトしますか？')) return;
    setIsSigningOut(true);
    try {
      await onSignOut();
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await onForceSync();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-sm font-bold text-neutral-900 dark:text-white">
                アカウント・データ同期
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Googleアカウント専用のプライベート自動保存
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-neutral-800 dark:text-neutral-200 text-xs">
          {currentUser ? (
            /* Logged In State */
            <div className="space-y-4">
              {/* Account profile card */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/70 dark:border-neutral-700/60 space-y-3">
                <div className="flex items-center space-x-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-11 h-11 rounded-full border border-neutral-300 dark:border-neutral-600 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-800 dark:text-amber-300 font-bold text-sm">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-neutral-900 dark:text-white truncate text-sm">
                      {currentUser.displayName || 'Google ユーザー'}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 truncate text-[11px]">
                      {currentUser.email}
                    </p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                        専用クラウド同期中
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                  <div>
                    <span className="text-neutral-400">登録データ:</span>{' '}
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {totalTransactionsCount}件 ({totalCategoriesCount}品目)
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">最終同期:</span>{' '}
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {lastSyncedAt
                        ? new Date(lastSyncedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                        : 'たった今'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy assurance banner */}
              <div className="p-3 bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/40 rounded-xl space-y-1">
                <p className="font-bold text-sky-900 dark:text-sky-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>あなたのアカウント限定で厳重保護</span>
                </p>
                <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80 leading-relaxed">
                  データはあなたのGoogleアカウントID（UID）にのみ紐づいてFirestoreに保存されます。共有コードや他人からの閲覧・編集は一切不可能です。スマホや別PCで同じGoogleアカウントでログインすると、即座に同期されます。
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 font-semibold transition active:scale-95 flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? '同期中...' : '今すぐ最新同期'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="py-2.5 px-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold transition active:scale-95 flex items-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ログアウト</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out / Prompt Login State */
            <div className="space-y-4">
              <div className="text-center py-3 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800">
                  <Cloud className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Googleアカウントで安全に自動同期
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
                  ログインすると、現在の家計簿データがあなたのGoogleアカウント専用領域に自動保存され、スマホや他のPCでも常に同じ内容を閲覧・管理できます。
                </p>
              </div>

              {/* Security features */}
              <div className="space-y-2 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 text-[11px]">
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-neutral-600 dark:text-neutral-300">
                    <strong className="text-neutral-900 dark:text-neutral-100">完全なプライベート保護:</strong>{' '}
                    他者と共有されず、あなた専用のクラウド領域にのみ暗号化保存されます。
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-neutral-600 dark:text-neutral-300">
                    <strong className="text-neutral-900 dark:text-neutral-100">完全リアルタイム自動保存:</strong>{' '}
                    支出や品目を登録するたびに即時反映されます。
                  </p>
                </div>
              </div>

              {/* Google Sign-in button */}
              <button
                id="btn-google-signin"
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full py-3 px-4 rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white font-bold border border-neutral-300 dark:border-neutral-700 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-750 transition active:scale-98 flex items-center justify-center space-x-3 text-sm"
              >
                {/* Google Icon SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isSigningIn ? 'Googleでログイン中...' : 'Googleアカウントでログイン'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
