import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyMockKeyForDevelopmentMode12345',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'careself-dev.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'careself-dev',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'careself-dev.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456789'
};

interface GlobalFirebase {
  _firebaseApp?: FirebaseApp;
  _firebaseAuth?: Auth;
  _firebaseDb?: Firestore;
  _firebaseStorage?: FirebaseStorage;
  _googleProvider?: GoogleAuthProvider;
}

const globalForFirebase = globalThis as unknown as GlobalFirebase;

const app: FirebaseApp = globalForFirebase._firebaseApp ?? (
  !getApps().length ? initializeApp(firebaseConfig) : getApp()
);

const auth: Auth = globalForFirebase._firebaseAuth ?? getAuth(app);
const db: Firestore = globalForFirebase._firebaseDb ?? getFirestore(app);
const storage: FirebaseStorage = globalForFirebase._firebaseStorage ?? getStorage(app);
const googleProvider: GoogleAuthProvider = globalForFirebase._googleProvider ?? new GoogleAuthProvider();

// Cache instances globally to prevent multiple connections during HMR or fast-refreshes
globalForFirebase._firebaseApp = app;
globalForFirebase._firebaseAuth = auth;
globalForFirebase._firebaseDb = db;
globalForFirebase._firebaseStorage = storage;
globalForFirebase._googleProvider = googleProvider;

export { app, auth, db, storage, googleProvider };
