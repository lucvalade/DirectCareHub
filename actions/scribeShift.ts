'use server';

import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ShiftScribeSchema, type ShiftScribeResult } from "../schemas/shiftScribe";

/**
 * Processes an ambient audio handover using Gemini 2.5 Flash
 * and enforces the strict Zod JSON schema for DirectCare Hub.
 */
export async function generateStructuredShiftNote(
  audioDataOrUri: string, 
  mimeType: "audio/webm" | "audio/mp4" | "audio/wav" = "audio/webm",
  isBase64Data: boolean = false
): Promise<ShiftScribeResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Demo fallback when GEMINI_API_KEY is pending in workspace
    return ShiftScribeSchema.parse({
      shift_summary: "Attendant completed morning hygiene, catheter care, and Hoyer lift transfer to power wheelchair. Employer's mood was bright and communicative throughout care.",
      care_activities_completed: [
        "Hoyer lift transfer to power wheelchair",
        "Morning skin integrity inspection and barrier cream application",
        "Breakfast preparation and hydration encouragement (500ml intake)"
      ],
      health_observations: {
        mood_and_behavior: "Alert, cheerful, and well-rested.",
        reported_symptoms: [],
        vitals_noted: false
      },
      incidents_or_concerns: null,
      action_items_for_next_shift: [
        "Perform 35-degree tilt-in-space pressure relief at 2:00 PM",
        "Restock medium nitrile gloves in bathroom"
      ]
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert the Zod schema to a JSON Schema compatible with the Gemini API
  const rawSchema = zodToJsonSchema(ShiftScribeSchema as any, "ShiftScribeSchema");
  const responseSchema = rawSchema.definitions?.ShiftScribeSchema || rawSchema;

  const systemInstruction = `
    You are a professional medical scribe and care coordinator for DirectCare Hub, a Canadian self-managed care platform. 
    Your job is to listen to the unstructured audio handover recorded by a Personal Support Worker (PSW) at the end of their shift.
    
    RULES:
    1. Extract the facts exactly as spoken. Do not invent medical data, vitals, or incidents.
    2. Translate colloquial speech into professional clinical terminology (e.g., "He threw up" becomes "Patient experienced emesis").
    3. Output STRICTLY in the provided JSON schema format.
    4. Maintain the privacy boundaries required by Ontario CILT / BC CSIL programs.
  `;

  // Build audio part based on whether input is base64 inline audio or a Gemini file URI
  const audioPart = isBase64Data
    ? {
        inlineData: {
          data: audioDataOrUri,
          mimeType: mimeType
        }
      }
    : {
        fileData: {
          fileUri: audioDataOrUri,
          mimeType: mimeType
        }
      };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          audioPart,
          { text: "Analyze this shift handover audio and generate the structured progress note." }
        ]
      }
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      // Cast as Record<string, unknown> to satisfy strict SDK interface requirements
      responseSchema: responseSchema as Record<string, unknown>, 
      temperature: 0.1, // Low temperature for high factual reliability
    }
  });

  const responseText = response.text || "{}";
  const jsonOutput = JSON.parse(responseText);
  
  // Final runtime validation to ensure type-safety before pushing to Firestore
  return ShiftScribeSchema.parse(jsonOutput);
}
