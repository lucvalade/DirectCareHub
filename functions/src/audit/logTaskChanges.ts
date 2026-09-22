// Developed by VertexAgent.io
// Project: DirectCare Hub - Cloud Function: Audit Log Interceptor

import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

export const logRunbookTaskChanges = onDocumentUpdated(
  {
    document: "shifts/{shiftId}/tasks/{taskId}",
    region: "northamerica-northeast1",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const beforeData = snapshot.before.data();
    const afterData = snapshot.after.data();

    // 1. Detect if the completion status actually changed
    if (beforeData.is_completed === afterData.is_completed) {
      return; // Ignore updates that didn't change the checkbox state (e.g., text edits)
    }

    const isNowCompleted = afterData.is_completed;
    const actionType = isNowCompleted ? 'task_completed' : 'task_reverted';
    
    // Fallback to 'system' if the client failed to pass the role
    const actingRole = afterData.completed_by_role || 'system'; 

    // 2. Construct the strict audit payload
    const auditPayload = {
      shift_id: event.params.shiftId,
      task_id: event.params.taskId,
      task_title: afterData.title,
      action_type: actionType,
      performed_by_role: actingRole,
      previous_state: beforeData.is_completed,
      new_state: isNowCompleted,
      timestamp: FieldValue.serverTimestamp(),
    };

    try {
      // 3. Write to a centralized, top-level audit collection
      // Storing this outside the 'shifts' collection makes it easier to lock down via Security Rules
      await db.collection('compliance_audit_logs').add(auditPayload);
      
      console.log(`Audit log secured for Task: ${event.params.taskId} (${actionType})`);
    } catch (error) {
      console.error("CRITICAL: Failed to write audit log", error);
    }
  }
);
