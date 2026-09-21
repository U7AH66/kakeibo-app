import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Coins,
  Layers,
  ListFilter,
} from 'lucide-react';
import {
  CategoryItem,
  CategorySummary,
  ColorTheme,
  ThemeMode,
  Transaction,
} from './types';
import {
  loadCategories,
  loadColorTheme,
  loadDefaultAllowance,
  loadThemeMode,
  loadTransactions,
  saveCategories,
  saveColorTheme,
  saveDefaultAllowance,
  saveThemeMode,
  saveTransactions,
} from './utils/storage';
import { INITIAL_TRANSACTIONS, DEFAULT_CATEGORIES } from './data/initialData';
import {
  formatJPY,
  formatMonthLabel,
  formatShortMonth,
  generateHtmlTable,
  generateAsciiTableText,
  generateLineShareText,
  copyTableToClipboard,
  copyPlainTextToClipboard,
} from './utils/format';
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { CategoryAggregateList } from './components/CategoryAggregateList';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { QuickEntryModal } from './components/QuickEntryModal';
import { ExportModal } from './components/ExportModal';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { UserAuthModal } from './components/UserAuthModal';
import { Toast } from './components/Toast';
import { THEME_CONFIGS } from './utils/theme';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState,
  subscribeToUserLedger,
  pushUserLedger,
  fetchUserLedger,
  UserLedgerData,
} from './utils/firebaseSync';
import { User } from 'firebase/auth';
import { SyncStatus } from './types';

export default function App() {
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [defaultAllowance, setDefaultAllowance] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  // Firebase Auth & Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isRemoteUpdatingRef = useRef<boolean>(false);
  const userLedgerUnsubRef = useRef<(() => void) | null>(null);

  // Theme & Design State
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('amber');
  const [systemIsDark, setSystemIsDark] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // UI Navigation & Modals State
  const [activeTab, setActiveTab] = useState<'aggregate' | 'history'>('aggregate');
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [prefilledCategory, setPrefilledCategory] = useState<string | undefined>(undefined);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Toast & Copy States with Auto-dismiss
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyTextSuccess, setCopyTextSuccess] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copyTextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize local cache and system theme preferences on mount
  useEffect(() => {
    const localTxs = loadTransactions();
    const localCats = loadCategories();
    const localAllowance = loadDefaultAllowance();
    setTransactions(localTxs);
    setCategories(localCats);
    setDefaultAllowance(localAllowance);
    setThemeMode(loadThemeMode());
    setColorTheme(loadColorTheme());

    // Listen for system theme preferences
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemIsDark(media.matches);
      const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // 2. Subscribe to Firebase Authentication state
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState(async (user) => {
      setCurrentUser(user);

      // Clean up previous user listener if any
      if (userLedgerUnsubRef.current) {
        userLedgerUnsubRef.current();
        userLedgerUnsubRef.current = null;
      }

      if (user) {
        setSyncStatus('syncing');
        showToast(`Google アカウント（${user.displayName || user.email}）でログインしました`);

        try {
          // Fetch existing remote ledger if any
          const remoteData = await fetchUserLedger(user.uid);
          if (remoteData) {
            isRemoteUpdatingRef.current = true;
            if (remoteData.transactions && Array.isArray(remoteData.transactions)) {
              setTransactions(remoteData.transactions);
              saveTransactions(remoteData.transactions);
            }
            if (remoteData.categories && Array.isArray(remoteData.categories)) {
              setCategories(remoteData.categories);
              saveCategories(remoteData.categories);
            }
            if (typeof remoteData.defaultAllowance === 'number') {
              setDefaultAllowance(remoteData.defaultAllowance);
              saveDefaultAllowance(remoteData.defaultAllowance);
            }
            setLastSyncedAt(remoteData.updatedAt);
            setSyncStatus('synced');
            setTimeout(() => {
              isRemoteUpdatingRef.current = false;
            }, 300);
          } else {
            // First time login: seed user cloud ledger with current local data
            const currentTxs = loadTransactions();
            const currentCats = loadCategories();
            const currentAllow = loadDefaultAllowance();
            await pushUserLedger(user.uid, user.email, {
              transactions: currentTxs,
              categories: currentCats,
              defaultAllowance: currentAllow,
            });
            setLastSyncedAt(Date.now());
            setSyncStatus('synced');
          }

          // Start real-time listener for this user's private ledger
          userLedgerUnsubRef.current = subscribeToUserLedger(
            user.uid,
            (updatedRemote) => {
              if (!updatedRemote) return;
              isRemoteUpdatingRef.current = true;
              if (updatedRemote.transactions && Array.isArray(updatedRemote.transactions)) {
                setTransactions(updatedRemote.transactions);
                saveTransactions(updatedRemote.transactions);
              }
              if (updatedRemote.categories && Array.isArray(updatedRemote.categories)) {
                setCategories(updatedRemote.categories);
                saveCategories(updatedRemote.categories);
              }
              if (typeof updatedRemote.defaultAllowance === 'number') {
                setDefaultAllowance(updatedRemote.defaultAllowance);
                saveDefaultAllowance(updatedRemote.defaultAllowance);
              }
              setLastSyncedAt(updatedRemote.updatedAt || Date.now());
              setSyncStatus('synced');
              setTimeout(() => {
                isRemoteUpdatingRef.current = false;
              }, 300);
            },
            (err) => {
              console.warn('Firestore live listener error:', err);
              setSyncStatus('error');
            }
          );
        } catch (err) {
          console.error('Failed to sync user ledger:', err);
          setSyncStatus('error');
        }
      } else {
        setSyncStatus('offline');
      }
    });

    return () => {
      unsubscribeAuth();
      if (userLedgerUnsubRef.current) {
        userLedgerUnsubRef.current();
      }
    };
  }, []);

  // Compute effective dark mode
  const isDarkEffective = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemIsDark;
  }, [themeMode, systemIsDark]);

  // Apply dark mode class to root HTML element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkEffective) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkEffective]);

  const handleSelectThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemeMode(mode);
  };

  const handleToggleDarkMode = () => {
    const nextMode = isDarkEffective ? 'light' : 'dark';
    handleSelectThemeMode(nextMode);
    showToast(nextMode === 'dark' ? '🌙 ダークモードに切り替えました' : '☀️ ライトモードに切り替えました');
  };

  const handleSelectColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    saveColorTheme(theme);
    showToast(`アクセントカラーを「${THEME_CONFIGS[theme].name}」に変更しました`);
  };

  // Safe Toast function that GUARANTEES dismissal
  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Transactions in current month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.month === currentMonth);
  }, [transactions, currentMonth]);

  // Aggregate by category
  const categorySummaries = useMemo<CategorySummary[]>(() => {
    const map = new Map<string, { total: number; count: number; txs: Transaction[] }>();

    for (const tx of monthTransactions) {
      if (!map.has(tx.category)) {
        map.set(tx.category, {
          total: 0,
          count: 0,
          txs: [],
        });
      }
      const entry = map.get(tx.category)!;
      entry.total += tx.amount;
      entry.count += 1;
      entry.txs.push(tx);
    }

    const list: CategorySummary[] = [];
    map.forEach((value, key) => {
      list.push({
        category: key,
        total: value.total,
        count: value.count,
        transactions: value.txs.sort((a, b) => b.createdAt - a.createdAt),
      });
    });

    return list;
  }, [monthTransactions]);

  // Category totals map for real-time calculation preview
  const categoryTotals = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const item of categorySummaries) {
      map[item.category] = item.total;
    }
    return map;
  }, [categorySummaries]);

  // Total monthly sum
  const totalAmount = useMemo(() => {
    return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  // Top category by amount
  const topCategory = useMemo(() => {
    if (categorySummaries.length === 0) return null;
    const sorted = [...categorySummaries].sort((a, b) => b.total - a.total);
    return { name: sorted[0].category, total: sorted[0].total };
  }, [categorySummaries]);

  // Has allowance registered for this month?
  const hasAllowanceThisMonth = monthTransactions.some((t) => t.category === 'お小遣い');

  // Helper to persist locally and sync to authenticated user's Firestore ledger
  const syncToCloud = async (
    newTxs: Transaction[],
    newCats: CategoryItem[],
    allowanceVal: number
  ) => {
    if (!currentUser) {
      setSyncStatus('offline');
      return;
    }

    try {
      setSyncStatus('syncing');
      await pushUserLedger(currentUser.uid, currentUser.email, {
        transactions: newTxs,
        categories: newCats,
        defaultAllowance: allowanceVal,
      });
      setSyncStatus('synced');
      setLastSyncedAt(Date.now());
    } catch (err) {
      console.warn('Failed to sync changes to user cloud ledger:', err);
      setSyncStatus('error');
    }
  };

  // Add transaction (auto-accumulates to category total & syncs to cloud)
  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
    syncToCloud(updated, categories, defaultAllowance);

    const oldTotal = categoryTotals[data.category] || 0;
    const newTotal = oldTotal + data.amount;
    showToast(`【${data.category}】に ${formatJPY(data.amount)} を加算しました（合計: ${formatJPY(newTotal)}）`);
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
    syncToCloud(updated, categories, defaultAllowance);
    if (target) {
      showToast(`【${target.category}】の ${formatJPY(target.amount)} を削除しました`);
    }
  };

  const handleAddNewCategory = (name: string) => {
    if (categories.some((c) => c.name === name)) return;
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name,
      iconName: 'Tag',
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
    syncToCloud(transactions, updated, defaultAllowance);
    showToast(`新しい項目「${name}」を追加しました`);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    saveCategories(updated);
    syncToCloud(transactions, updated, defaultAllowance);
  };

  const handleAddDefaultAllowance = () => {
    handleAddTransaction({
      month: currentMonth,
      date: `${currentMonth}-01`,
      category: 'お小遣い',
      amount: defaultAllowance,
      memo: '今月のお小遣い基本額',
    });
  };

  // Google Login handler
  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      showToast(`「${user.displayName || user.email}」でログインしました`);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      showToast('Googleログインに失敗しました。ポップアップが許可されているか確認してください。');
      throw err;
    }
  };

  // Google Logout handler
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setSyncStatus('offline');
      showToast('ログアウトしました');
    } catch (err) {
      console.error('Sign out error:', err);
      showToast('ログアウトに失敗しました');
      throw err;
    }
  };

  // Force sync authenticated user's data to cloud
  const handleForceSync = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSyncStatus('syncing');
    try {
      await pushUserLedger(currentUser.uid, currentUser.email, {
        transactions,
        categories,
        defaultAllowance,
      });
      setSyncStatus('synced');
      setLastSyncedAt(Date.now());
      showToast('Googleアカウントのクラウド領域に同期保存しました');
    } catch {
      setSyncStatus('error');
      showToast('クラウド同期に失敗しました');
    }
  };

  // One-tap Copy Rich Table to Clipboard (Pastes as real table in Apple Notes / Excel / Word / Docs)
  const handleQuickCopyTable = async () => {
    const htmlTable = generateHtmlTable(currentMonth, categorySummaries, totalAmount);
    const asciiTable = generateAsciiTableText(currentMonth, categorySummaries, totalAmount);

    const success = await copyTableToClipboard(htmlTable, asciiTable);
    if (success) {
      setCopySuccess(true);
      showToast('ノート用「表」をクリップボードにコピーしました！');
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  // One-tap Copy Clean Text for LINE / Messaging Apps (No ASCII box lines that break on mobile)
  const handleQuickCopyText = async () => {
    const lineText = generateLineShareText(currentMonth, categorySummaries, totalAmount);
    const success = await copyPlainTextToClipboard(lineText);
    if (success) {
      setCopyTextSuccess(true);
      showToast('LINE用テキストをコピーしました！トークにそのまま貼れます');
      if (copyTextTimeoutRef.current) clearTimeout(copyTextTimeoutRef.current);
      copyTextTimeoutRef.current = setTimeout(() => {
        setCopyTextSuccess(false);
      }, 2000);
    }
  };

  const handleResetToSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    saveTransactions(INITIAL_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    saveCategories(DEFAULT_CATEGORIES);
    setDefaultAllowance(0);
    saveDefaultAllowance(0);
    syncToCloud(INITIAL_TRANSACTIONS, DEFAULT_CATEGORIES, 0);
    showToast('データを初期状態にリセットしました');
  };

  const curConfig = THEME_CONFIGS[colorTheme];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 pb-24 sm:pb-12 transition-colors duration-200">
      {/* Header */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={(newM) => setCurrentMonth(newM)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenManageCategories={() => setIsCategoryManagerOpen(true)}
        onOpenThemeSettings={() => setIsThemeModalOpen(true)}
        onOpenSync={() => setIsAuthModalOpen(true)}
        syncStatus={syncStatus}
        currentUser={currentUser}
        themeMode={themeMode}
        isDarkEffective={isDarkEffective}
        onToggleDarkMode={handleToggleDarkMode}
        colorTheme={colorTheme}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Hero Summary Card */}
        <SummaryCard
          currentMonth={currentMonth}
          totalAmount={totalAmount}
          categoryCount={categorySummaries.length}
          transactionCount={monthTransactions.length}
          topCategory={topCategory}
          onOpenQuickEntry={() => {
            setPrefilledCategory(undefined);
            setIsQuickEntryOpen(true);
          }}
          onQuickCopyTable={handleQuickCopyTable}
          onQuickCopyText={handleQuickCopyText}
          copySuccess={copySuccess}
          copyTextSuccess={copyTextSuccess}
          colorTheme={colorTheme}
        />

        {/* Quick prompt to add base allowance if user has configured one and it is missing */}
        {defaultAllowance > 0 && !hasAllowanceThisMonth && (
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-800 dark:text-amber-300">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {formatShortMonth(currentMonth)}の「お小遣い（基本額）」が未登録です
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  タップすると基本額（{formatJPY(defaultAllowance)}）を一発でリストに追加できます
                </p>
              </div>
            </div>
            <button
              id="btn-add-base-allowance"
              type="button"
              onClick={handleAddDefaultAllowance}
              className={`inline-flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition active:scale-95 ${curConfig.btnPrimary}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{formatJPY(defaultAllowance)} を追加</span>
            </button>
          </div>
        )}

        {/* View switcher tabs */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex space-x-4">
            <button
              id="tab-aggregate-view"
              type="button"
              onClick={() => setActiveTab('aggregate')}
              className={`pb-2.5 text-sm font-bold border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === 'aggregate'
                  ? curConfig.tabActive
                  : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>項目別・自動集計（表形式）</span>
            </button>
            <button
              id="tab-history-view"
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 text-sm font-bold border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? curConfig.tabActive
                  : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>記帳履歴・明細 ({monthTransactions.length})</span>
            </button>
          </div>

          <div className="hidden sm:block text-xs text-neutral-400 dark:text-neutral-500 font-medium">
            {formatMonthLabel(currentMonth)}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'aggregate' ? (
          <CategoryAggregateList
            categories={categorySummaries}
            totalAmount={totalAmount}
            onOpenQuickAddWithCategory={(catName) => {
              setPrefilledCategory(catName);
              setIsQuickEntryOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            colorTheme={colorTheme}
          />
        ) : (
          <TransactionHistoryView
            transactions={monthTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            colorTheme={colorTheme}
          />
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          id="btn-fab-quick-entry"
          type="button"
          onClick={() => {
            setPrefilledCategory(undefined);
            setIsQuickEntryOpen(true);
          }}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition active:scale-90 ${curConfig.btnPrimary}`}
          aria-label="使ったお金を記録する"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Modals */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        categories={categories}
        currentMonth={currentMonth}
        categoryTotals={categoryTotals}
        initialCategory={prefilledCategory}
        onAddTransaction={handleAddTransaction}
        onAddNewCategory={handleAddNewCategory}
        colorTheme={colorTheme}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currentMonth={currentMonth}
        categories={categorySummaries}
        totalAmount={totalAmount}
        colorTheme={colorTheme}
        onShowToast={showToast}
      />

      <ManageCategoriesModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onAddCategory={(newCat) => {
          const updated = [...categories, newCat];
          setCategories(updated);
          saveCategories(updated);
          syncToCloud(transactions, updated, defaultAllowance);
        }}
        onDeleteCategory={handleDeleteCategory}
        defaultAllowance={defaultAllowance}
        onSaveDefaultAllowance={(amount) => {
          setDefaultAllowance(amount);
          saveDefaultAllowance(amount);
          syncToCloud(transactions, categories, amount);
          showToast(`基本お小遣い額を ${formatJPY(amount)} に更新しました`);
        }}
        onResetToSampleData={handleResetToSampleData}
        onOpenSync={() => setIsAuthModalOpen(true)}
        colorTheme={colorTheme}
      />

      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        themeMode={themeMode}
        onSelectThemeMode={handleSelectThemeMode}
        colorTheme={colorTheme}
        onSelectColorTheme={handleSelectColorTheme}
      />

      {/* Firebase User Google Auth & Private Sync Modal */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        onForceSync={handleForceSync}
        totalTransactionsCount={transactions.length}
        totalCategoriesCount={categories.length}
        colorTheme={colorTheme}
      />

      {/* Toast feedback with automatic timer & close button */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
