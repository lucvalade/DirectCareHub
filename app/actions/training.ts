"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { TrainingLogEntry, TrainingCategory } from "@/types/training";

export async function fetchTrainingLogs(): Promise<{ data: TrainingLogEntry[]; error?: string }> {
  try {
    const snap = await adminDb.collection("training_logs").get();
    const list: TrainingLogEntry[] = [];
    snap.docs.forEach((doc: any) => {
      list.push({
        id: doc.id,
        ...doc.data()
      } as TrainingLogEntry);
    });
    // Sort by training_date desc
    list.sort((a, b) => new Date(b.training_date).getTime() - new Date(a.training_date).getTime());
    return { data: list };
  } catch (error: any) {
    console.error("Error fetching training logs:", error);
    return { data: [], error: error.message || "Failed to fetch training logs" };
  }
}

export async function logTrainingSession(formData: FormData) {
  try {
    const employerId = formData.get("employerId") as string;
    const attendantId = formData.get("attendantId") as string;
    const attendantName = formData.get("attendantName") as string;
    const category = formData.get("category") as TrainingCategory;
    const skillTitle = formData.get("skillTitle") as string;
    const equipmentModel = (formData.get("equipmentModel") as string) || "";
    const trainingDate = formData.get("trainingDate") as string;
    const notes = (formData.get("notes") as string) || "";
    const renewalDate = (formData.get("renewalDate") as string) || "";

    if (!employerId || !attendantId || !skillTitle || !trainingDate) {
      throw new Error("Missing required training log details.");
    }

    const newLog: TrainingLogEntry = {
      id: crypto.randomUUID(),
      employer_id: employerId,
      attendant_id: attendantId,
      attendant_name: attendantName,
      category,
      skill_title: skillTitle,
      equipment_model: equipmentModel,
      training_date: trainingDate,
      notes,
      employer_signed_at: new Date().toISOString(),
      attendant_acknowledged: false,
      expiry_or_renewal_date: renewalDate || undefined,
    };

    await adminDb.collection("training_logs").doc(newLog.id).set(newLog);
    revalidatePath("/training");
    return { success: true, logId: newLog.id };
  } catch (error: any) {
    console.error("Training log error:", error);
    return { error: error.message };
  }
}

export async function acknowledgeTraining(logId: string, attendantId: string) {
  try {
    const logRef = adminDb.collection("training_logs").doc(logId);
    const doc = await logRef.get();

    if (!doc.exists) throw new Error("Training record not found");
    if (doc.data()?.attendant_id !== attendantId) throw new Error("Unauthorized");

    await logRef.update({
      attendant_acknowledged: true,
      attendant_acknowledged_at: new Date().toISOString(),
    });

    revalidatePath("/training");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
