import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { CategoryItem, Transaction } from '../types';

export interface UserLedgerData {
  userId: string;
  userEmail?: string | null;
  transactions: Transaction[];
  categories: CategoryItem[];
  defaultAllowance: number;
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
  }
): Promise<void> {
  const ledgerPath = `users/${userId}/ledger/main`;
  try {
    const ledgerDocRef = doc(db, 'users', userId, 'ledger', 'main');
    const data: UserLedgerData = {
      userId,
      userEmail: userEmail || null,
      transactions: payload.transactions,
      categories: payload.categories,
      defaultAllowance: payload.defaultAllowance,
      updatedAt: Date.now(),
    };

    await setDoc(ledgerDocRef, data);
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
