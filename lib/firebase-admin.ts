import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

interface GlobalFirebaseAdmin {
  adminApp?: App;
  adminAuth?: Auth;
  adminDb?: Firestore;
  adminStorage?: Storage;
}

const globalForAdmin = globalThis as unknown as GlobalFirebaseAdmin;

/**
 * Strict Singleton Pattern for Firebase Admin SDK to prevent connection pool exhaustion
 * and OOM crashes across Next.js Server Actions and Route Handlers.
 */
export function getAdminApp(): App {
  if (globalForAdmin.adminApp) {
    return globalForAdmin.adminApp;
  }

  // Check if an app is already initialized in the process
  const existingApps = getApps();
  if (existingApps.length > 0) {
    globalForAdmin.adminApp = getApp();
    return globalForAdmin.adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'careself-dev';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  try {
    if (clientEmail && privateKey) {
      globalForAdmin.adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Fallback to Application Default Credentials or Project ID configuration
      globalForAdmin.adminApp = initializeApp({
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
  } catch (err) {
    console.warn('[FirebaseAdmin] Failed to initialize standard admin credential, checking if already initialized:', err);
    if (getApps().length > 0) {
      globalForAdmin.adminApp = getApp();
    } else {
      // Re-throw or create minimal fallback
      throw err;
    }
  }

  return globalForAdmin.adminApp;
}

export function getAdminAuth(): Auth {
  if (!globalForAdmin.adminAuth) {
    globalForAdmin.adminAuth = getAuth(getAdminApp());
  }
  return globalForAdmin.adminAuth;
}

export function getAdminDb(): Firestore {
  if (!globalForAdmin.adminDb) {
    globalForAdmin.adminDb = getFirestore(getAdminApp());
  }
  return globalForAdmin.adminDb;
}

export function getAdminStorage(): Storage {
  if (!globalForAdmin.adminStorage) {
    globalForAdmin.adminStorage = getStorage(getAdminApp());
  }
  return globalForAdmin.adminStorage;
}

// Proxies for direct imports: import { adminDb, adminStorage, adminAuth } from "@/lib/firebase-admin"
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getAdminDb() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export const adminStorage = new Proxy({} as Storage, {
  get(_target, prop) {
    const instance = getAdminStorage() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAdminAuth() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

