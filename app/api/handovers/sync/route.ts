import { NextRequest, NextResponse } from 'next/server';
import { uploadAudioToStorage } from '@/lib/firebase/storage';
import { generateStructuredShiftNote } from '@/actions/scribeShift';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const shiftId = formData.get('shiftId') as string;

    if (!audioFile || !shiftId) {
      return NextResponse.json({ error: 'Missing payload data' }, { status: 400 });
    }

    // 1. Upload to Firebase Storage or base64 fallback
    const uploadResult = await uploadAudioToStorage(audioFile, shiftId);
    
    // 2. Process via Gemini 2.5 Flash
    const structuredNote = await generateStructuredShiftNote(
      uploadResult.fileUri, 
      'audio/webm',
      uploadResult.isBase64
    );

    return NextResponse.json({ success: true, note: structuredNote }, { status: 200 });
  } catch (error) {
    console.error("Background sync processing failed:", error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
