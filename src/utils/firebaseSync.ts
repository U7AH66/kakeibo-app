import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { CategoryItem, PeriodSettings, Transaction } from '../types';
import { deduplicateCategories } from './storage';

export interface UserLedgerData {
  userId: string;
  userEmail?: string | null;
  transactions: Transaction[];
  categories: CategoryItem[];
  defaultAllowance: number;
  periodSettings?: PeriodSettings;
  updatedAt: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (value === undefined) return null;
      return value;
    })
  );
}

/**
 * Log in using Google Account with popup
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Failed to sign in with Google:', error);
    throw error;
  }
}

/**
 * Log out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Failed to sign out:', error);
    throw error;
  }
}

/**
 * Listen to auth state changes
 */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Subscribe to the authenticated user's private Firestore ledger in real-time.
 * Strictly scoped to /users/{userId}/ledger/main
 */
export function subscribeToUserLedger(
  userId: string,
  onUpdate: (data: UserLedgerData) => void,
  onError?: (err: Error) => void
): () => void {
  const ledgerPath = `users/${userId}/ledger/main`;
  const ledgerDocRef = doc(db, 'users', userId, 'ledger', 'main');

  return onSnapshot(
    ledgerDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserLedgerData;
        onUpdate(data);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, ledgerPath);
      } catch (e) {
        if (onError) onError(e as Error);
      }
    }
  );
}

/**
 * Push user's ledger updates directly to their private Firestore path
 */
export async function pushUserLedger(
  userId: string,
  userEmail: string | null | undefined,
  payload: {
    transactions: Transaction[];
    categories: CategoryItem[];
    defaultAllowance: number;
    periodSettings?: PeriodSettings;
  }
): Promise<void> {
  if (!userId) {
    throw new Error('ユーザーIDが見つかりません');
  }
  const ledgerPath = `users/${userId}/ledger/main`;
  try {
    const ledgerDocRef = doc(db, 'users', userId, 'ledger', 'main');

    // Clean and validate each transaction to avoid undefined or type errors
    const sanitizedTransactions = (payload.transactions || []).map((t) => ({
      id: String(t.id),
      month: String(t.month || ''),
      date: String(t.date || ''),
      category: String(t.category || ''),
      amount: Number(t.amount) || 0,
      memo: t.memo ? String(t.memo).trim() : '',
      createdAt: Number(t.createdAt) || Date.now(),
    }));

    // Clean and deduplicate categories
    const cleanedCategories = (payload.categories || []).map((c, index) => ({
      id: String(c.id || `cat-${index}`),
      name: String(c.name || ''),
      iconName: String(c.iconName || 'Tag'),
      color: c.color ? String(c.color) : '',
      order: typeof c.order === 'number' ? c.order : index,
    }));
    const sanitizedCategories = deduplicateCategories(cleanedCategories);

    const rawData = {
      userId,
      userEmail: userEmail || null,
      transactions: sanitizedTransactions,
      categories: sanitizedCategories,
      defaultAllowance: Number(payload.defaultAllowance) || 0,
      periodSettings: payload.periodSettings
        ? {
            cutoffDay: Number(payload.periodSettings.cutoffDay) || 18,
            rangeMode: payload.periodSettings.rangeMode || 'prev_day_to_cur_day',
            defaultDateType: payload.periodSettings.defaultDateType || 'cutoff_day',
            customDefaultDay: Number(payload.periodSettings.customDefaultDay) || 18,
          }
        : null,
      updatedAt: Date.now(),
    };

    const cleanData = sanitizeForFirestore(rawData);
    await setDoc(ledgerDocRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ledgerPath);
  }
}

/**
 * Fetch initial user ledger from Firestore
 */
export async function fetchUserLedger(userId: string): Promise<UserLedgerData | null> {
  const ledgerPath = `users/${userId}/ledger/main`;
  try {
    const ledgerDocRef = doc(db, 'users', userId, 'ledger', 'main');
    const snap = await getDoc(ledgerDocRef);
    if (snap.exists()) {
      return snap.data() as UserLedgerData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ledgerPath);
  }
}
