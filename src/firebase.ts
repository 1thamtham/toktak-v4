import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
auth.useDeviceLanguage();
export const storage = getStorage(app);
storage.maxUploadRetryTime = 15000;
storage.maxOperationRetryTime = 15000;

export function createGoogleAuthProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export const googleProvider = createGoogleAuthProvider();

export { firebaseConfig };

export const BLUEPRINT_LIMITS = {
  ID_MAX: 128,
  DISPLAY_NAME_MAX: 80,
  USERNAME_MAX: 40,
  BIO_MAX: 300,
  URL_MAX: 2048,
  IMAGE_DATA_OR_URL_MAX: 100000,
  STORAGE_PATH_MAX: 300,
  CAPTION_MAX: 500,
  SONG_MAX: 150,
  COMMENT_TEXT_MAX: 500,
  ITEMS_SUMMARY_MAX: 500,
  NOTE_MAX: 500,
  HTTPS_URL_PATTERN: /^https?:\/\/.+/,
} as const;

export function clampText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function sanitizeId(raw: string, fallbackPrefix = 'id'): string {
  const cleaned = (raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, BLUEPRINT_LIMITS.ID_MAX);
  return cleaned || `${fallbackPrefix}-${Date.now()}`;
}

export function sanitizeHandle(raw: string, fallbackSuffix = 'toktak'): string {
  const withoutAt = (raw || '').trim().replace(/^@+/, '');
  const cleaned = withoutAt
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '');
  const safeSuffix = (fallbackSuffix || 'toktak').replace(/[^a-zA-Z0-9._-]+/g, '') || 'toktak';
  const body = cleaned || `creator_${safeSuffix}`;
  return `@${body}`.slice(0, BLUEPRINT_LIMITS.USERNAME_MAX);
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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();