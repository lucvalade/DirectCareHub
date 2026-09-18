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
  expenses: {
    'exp_01': {
      id: 'exp_01',
      attendant_id: 'psw_elena_02',
      attendant_name: 'Elena Rostova (Lead PSW)',
      employer_id: 'emp_ontario_01',
      date_incurred: '2026-09-12',
      category: 'groceries',
      amount: 64.50,
      description: 'Special dietary liquid thickeners and morning grocery run at Metro.',
      status: 'pending',
      submitted_at: '2026-09-13T10:15:00Z',
      receipt_url: 'https://picsum.photos/seed/receipt1/400/600'
    },
    'exp_02': {
      id: 'exp_02',
      attendant_id: 'att_2',
      attendant_name: 'Kavita Patel (Evening Attendant)',
      employer_id: 'emp_ontario_01',
      date_incurred: '2026-09-10',
      category: 'transit',
      amount: 12.80,
      description: 'Emergency late-night TTC transit return trip due to shift extension.',
      status: 'approved',
      submitted_at: '2026-09-11T08:30:00Z',
      approved_at: '2026-09-11T12:00:00Z',
      receipt_url: 'https://picsum.photos/seed/receipt2/400/600'
    },
    'exp_03': {
      id: 'exp_03',
      attendant_id: 'psw_elena_02',
      attendant_name: 'Elena Rostova (Lead PSW)',
      employer_id: 'emp_ontario_01',
      date_incurred: '2026-09-14',
      category: 'supplies',
      amount: 45.20,
      description: 'Nitrile gloves Box of 100 (Size M) purchased at Shoppers Drug Mart.',
      status: 'pending',
      submitted_at: '2026-09-14T17:40:00Z',
      receipt_url: 'https://picsum.photos/seed/receipt3/400/600'
    }
  },
  training_logs: {
    'tr_01': {
      id: 'tr_01',
      attendant_id: 'psw_elena_02',
      attendant_name: 'Elena Rostova (Lead PSW)',
      employer_id: 'emp_ontario_01',
      category: 'mechanical_lift',
      skill_title: 'Arjo Ceiling Lift & Loop Configuration',
      equipment_model: 'Arjo Maxi Sky 440 / Medium Clip-to-Loop',
      training_date: '2026-08-15',
      notes: 'Elena demonstrated excellent sling loop settings and Arjo lift handling under full load with complete patient stability.',
      employer_signed_at: '2026-08-15T14:30:00Z',
      attendant_acknowledged: true,
      attendant_acknowledged_at: '2026-08-15T15:00:00Z',
      expiry_or_renewal_date: '2027-08-15'
    },
    'tr_02': {
      id: 'tr_02',
      attendant_id: 'att_2',
      attendant_name: 'Kavita Patel (Evening Attendant)',
      employer_id: 'emp_ontario_01',
      category: 'transfer_technique',
      skill_title: 'Slide Sheet Transfer',
      equipment_model: 'Standard Slide Sheet & Transfer Board',
      training_date: '2026-09-02',
      notes: 'Reviewed proper spinal mechanics during sliding sheets maneuvers.',
      employer_signed_at: '2026-09-02T16:00:00Z',
      attendant_acknowledged: false,
      expiry_or_renewal_date: '2027-09-02'
    }
  }
};

let dbInstance: any = null;
let storageInstance: any = null;

// Safe dynamic initialization
function initAdminSDK() {
  if (typeof window !== 'undefined') {
    return { db: null, storage: null };
  }

  // If already initialized
  if (dbInstance && storageInstance) {
    return { db: dbInstance, storage: storageInstance };
  }

  try {
    // Only attempt real initialization if Firebase Admin has credential environment variable
    const hasServiceAccount = process.env.FIREBASE_CONFIG || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (hasServiceAccount) {
      if (admin.apps.length === 0) {
        admin.initializeApp();
      }
      dbInstance = admin.firestore();
      storageInstance = admin.storage();
      console.log('Firebase Admin SDK Initialized Successfully.');
      return { db: dbInstance, storage: storageInstance };
    }
  } catch (err) {
    console.warn('Firebase Admin SDK initialization failed. Utilizing robust mock fallback:', err);
  }

  // Mock Fallbacks
  const mockDb = {
    collection: (name: string) => new MockCollection(name, MEMORY_DB),
    batch: () => new MockBatch(MEMORY_DB)
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
  batch: () => initAdminSDK().db.batch()
};

export const adminStorage = {
  bucket: () => initAdminSDK().storage.bucket()
};
