import { storage } from './firebaseConfig'; 
import { ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export interface StorageUploadResult {
  fileUri: string;
  isBase64: boolean;
}

/**
 * Uploads the recorded WebM audio blob to Firebase Storage and returns the gs:// URI
 * required by the Vertex AI / Gemini API for direct native audio ingestion.
 * Falls back gracefully to base64 encoding if Storage is unconfigured or offline.
 */
export async function uploadAudioToStorage(audioBlob: Blob, shiftId: string): Promise<StorageUploadResult> {
  const fileName = `handovers/${shiftId}/${uuidv4()}.webm`;

  try {
    const storageRef = ref(storage, fileName);
    const file = new File([audioBlob], 'handover.webm', { type: 'audio/webm' });

    // Attempt upload to Firebase Storage
    await uploadBytes(storageRef, file, { contentType: 'audio/webm' });

    const bucketName = storageRef.bucket;
    const gsUri = `gs://${bucketName}/${fileName}`;
    
    return {
      fileUri: gsUri,
      isBase64: false
    };
  } catch (error) {
    console.warn("Firebase Storage upload fallback to base64:", error);
    
    // Fallback: Convert blob to base64 string for direct inline processing with Gemini API
    const buffer = await audioBlob.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    
    return {
      fileUri: base64Data,
      isBase64: true
    };
  }
}
