// Developed by VertexAgent.io
// Project: DirectCare Hub - Firebase Gen 2 Cloud Function: Runbook Task Seeder

import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export const seedShiftTasks = onDocumentUpdated(
  {
    document: "shifts/{shiftId}",
    region: "northamerica-northeast1", // Deployed near Hamilton/Toronto for lowest latency
  }, 
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const beforeData = snapshot.before.data();
    const afterData = snapshot.after.data();

    // 1. Idempotency Check: Only trigger EXACTLY when the status flips to 'assigned'
    if (beforeData.status === 'assigned' || afterData.status !== 'assigned') {
      return; 
    }

    const shiftId = event.params.shiftId;
    const employerId = afterData.employer_id;
    const shiftType = afterData.shift_type || 'morning_routine'; // Fallback to morning

    try {
      // 2. Fetch the Employer's customized master template
      // e.g., users/{employerId}/runbook_templates/morning_routine
      const templateRef = db.collection('users').doc(employerId).collection('runbook_templates').doc(shiftType);
      const templateDoc = await templateRef.get();

      if (!templateDoc.exists) {
        console.log(`No ${shiftType} template found for employer: ${employerId}`);
        return;
      }

      // We expect the template document to hold an array of standard tasks
      const masterTasks = templateDoc.data()?.tasks || [];
      if (masterTasks.length === 0) return;

      // 3. Prepare a Firestore Batched Write
      // A batch ensures all tasks are written at once, preventing the UI from rendering a partial list
      const batch = db.batch();
      const tasksSubcollection = db.collection('shifts').doc(shiftId).collection('tasks');

      masterTasks.forEach((task: { title: string, scheduled_time: string }, index: number) => {
        const newTaskRef = tasksSubcollection.doc(); // Auto-generate an ID for the new subcollection doc
        
        batch.set(newTaskRef, {
          title: task.title,
          scheduled_time: task.scheduled_time,
          is_completed: false,
          completed_at: null,
          completed_by_role: null,
          order: index + 1 // Preserve the chronological order of the master template
        });
      });

      // 4. Commit the batch write to the database
      await batch.commit();
      
      console.log(`Successfully seeded ${masterTasks.length} tasks for shift: ${shiftId}`);

    } catch (error) {
      console.error("Failed to seed runbook tasks:", error);
    }
  }
);
