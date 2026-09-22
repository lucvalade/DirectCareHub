// Developed by VertexAgent.io
// Project: DirectCare Hub - Offline Audio Handover Engine

export interface AudioHandoverRecord {
  id: string;
  shiftId: string;
  audioBlob: Blob;
  timestamp: number;
  synced: boolean;
}

const DB_NAME = 'DirectCareHandoverDB';
const DB_VERSION = 1;
const STORE_NAME = 'handovers';

/**
 * Initializes local IndexedDB for voice handover persistence.
 */
export function openHandoverDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a recorded audio handover locally in IndexedDB for offline resilience.
 */
export async function saveHandoverOffline(shiftId: string, audioBlob: Blob): Promise<string> {
  const db = await openHandoverDB();
  const id = `handover_${Date.now()}`;

  const record: AudioHandoverRecord = {
    id,
    shiftId,
    audioBlob,
    timestamp: Date.now(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves all pending offline handovers that have not yet synced to Firebase.
 */
export async function getPendingHandovers(): Promise<AudioHandoverRecord[]> {
  try {
    const db = await openHandoverDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const all = (request.result as AudioHandoverRecord[]) || [];
        resolve(all.filter((h) => !h.synced));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to read pending handovers:", err);
    return [];
  }
}
