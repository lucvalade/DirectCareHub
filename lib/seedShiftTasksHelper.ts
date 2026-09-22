// Developed by VertexAgent.io
// Project: DirectCare Hub - Next.js App Router Runbook Task Seeder Helper

import { adminDb } from '@/lib/firebase-admin';

export async function seedShiftTasksHelper(shiftId: string, employerId: string, shiftType: string = 'morning_routine') {
  try {
    const templateRef = adminDb.collection('users').doc(employerId).collection('runbook_templates').doc(shiftType);
    const templateDoc = await templateRef.get();

    let masterTasks: { title: string; scheduled_time: string }[] = [];

    if (templateDoc.exists) {
      masterTasks = templateDoc.data()?.tasks || [];
    }

    if (masterTasks.length === 0) {
      // Default master tasks if template not created yet
      masterTasks = [
        { title: 'Bowel Routine & Catheter Care', scheduled_time: '08:00 AM' },
        { title: 'Arjo Ceiling Lift Transfer to Wheelchair', scheduled_time: '08:45 AM' },
        { title: 'Morning Medications (See Medisafe Vault)', scheduled_time: '09:15 AM' },
        { title: 'Passive Range of Motion (Upper Limbs)', scheduled_time: '10:30 AM' },
      ];
    }

    const batch = adminDb.batch();
    const tasksSubcollection = adminDb.collection('shifts').doc(shiftId).collection('tasks');

    masterTasks.forEach((task, index) => {
      const newTaskRef = tasksSubcollection.doc(`task_${index + 1}`);
      batch.set(newTaskRef, {
        title: task.title,
        scheduled_time: task.scheduled_time,
        is_completed: false,
        completed_at: null,
        completed_by_role: null,
        order: index + 1
      });
    });

    await batch.commit();
    return { success: true, count: masterTasks.length };
  } catch (error) {
    console.error("Failed to seed runbook tasks via helper:", error);
    return { success: false, error };
  }
}
