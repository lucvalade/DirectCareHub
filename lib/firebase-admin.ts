import * as admin from 'firebase-admin';

// Simple In-Memory Database fallback to ensure zero server crashes when Firebase is not provisioned
class MockDocument {
  private data: any = null;
  constructor(private collectionName: string, private docId: string, private store: any) {
    if (!this.store[this.collectionName]) {
      this.store[this.collectionName] = {};
    }
  }

  async get() {
    const docData = this.store[this.collectionName]?.[this.docId];
    return {
      exists: !!docData,
      id: this.docId,
      data: () => docData || null
    };
  }

  async set(data: any) {
    if (!this.store[this.collectionName]) {
      this.store[this.collectionName] = {};
    }
    this.store[this.collectionName][this.docId] = { ...data };
    return { success: true };
  }

  async update(data: any) {
    if (!this.store[this.collectionName]?.[this.docId]) {
      this.store[this.collectionName][this.docId] = {};
    }
    this.store[this.collectionName][this.docId] = {
      ...this.store[this.collectionName][this.docId],
      ...data
    };
    return { success: true };
  }
}

class MockCollection {
  constructor(private collectionName: string, private store: any) {}

  doc(id: string) {
    return new MockDocument(this.collectionName, id, this.store);
  }

  where(field: string, op: string, value: any) {
    return {
      where: (f: string, o: string, v: any) => this.where(f, o, v),
      get: async () => {
        const results: any[] = [];
        const colData = this.store[this.collectionName] || {};
        Object.values(colData).forEach((doc: any) => {
          if (op === '==' && doc[field] === value) {
            results.push({
              id: doc.id || 'mock-id',
              data: () => doc
            });
          }
        });
        return {
          docs: results
        };
      }
    };
  }

  async get() {
    const results: any[] = [];
    const colData = this.store[this.collectionName] || {};
    Object.values(colData).forEach((doc: any) => {
      results.push({
        id: doc.id || 'mock-id',
        data: () => doc
      });
    });
    return {
      docs: results
    };
  }
}

class MockBatch {
  constructor(private store: any) {}
  update(ref: any, data: any) {
    ref.update(data);
    return this;
  }
  async commit() {
    return { success: true };
  }
}

class MockStorageFile {
  constructor(private filePath: string) {}
  async save(buffer: Buffer, options?: any) {
    console.log(`[Mock Storage] File saved to ${this.filePath}`);
    return true;
  }
  async makePublic() {
    console.log(`[Mock Storage] File ${this.filePath} marked as public`);
    return true;
  }
}

class MockBucket {
  name = 'directcare-mock-bucket';
  file(filePath: string) {
    return new MockStorageFile(filePath);
  }
}

// Global In-Memory Stores
const MEMORY_DB: any = {
  expenses: {},
  training_logs: {},
  shifts: {}
};

let dbInstance: any = null;
let storageInstance: any = null;

// Safe dynamic initialization
function initAdminSDK() {
  if (typeof window !== 'undefined') {
    return { db: null, storage: null };
  }

  if (dbInstance && storageInstance) {
    return { db: dbInstance, storage: storageInstance };
  }

  try {
    const hasServiceAccount = process.env.FIREBASE_CONFIG || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (hasServiceAccount) {
      if (admin.apps.length === 0) {
        admin.initializeApp();
      }
      dbInstance = admin.firestore();
      storageInstance = admin.storage();
      return { db: dbInstance, storage: storageInstance };
    }
  } catch (err) {
    console.warn('Firebase Admin SDK initialization failed. Utilizing robust mock fallback:', err);
  }

  // Mock Fallbacks
  const mockDb = {
    collection: (name: string) => new MockCollection(name, MEMORY_DB),
    batch: () => new MockBatch(MEMORY_DB),
    runTransaction: async (updateFunction: any) => {
      const mockTransaction = {
        get: async (ref: any) => ref.get(),
        update: (ref: any, data: any) => ref.update(data),
        set: (ref: any, data: any) => ref.set(data)
      };
      return updateFunction(mockTransaction);
    }
  };

  const mockStorage = {
    bucket: () => new MockBucket()
  };

  dbInstance = mockDb;
  storageInstance = mockStorage;
  return { db: mockDb, storage: mockStorage };
}

export const adminDb = {
  collection: (name: string) => initAdminSDK().db.collection(name),
  batch: () => initAdminSDK().db.batch(),
  runTransaction: (fn: any) => initAdminSDK().db.runTransaction(fn)
};

export const adminStorage = {
  bucket: () => initAdminSDK().storage.bucket()
};

export const adminFieldValue = {
  serverTimestamp: () => new Date().toISOString()
};
