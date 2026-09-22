// Developed by VertexAgent.io
// Project: DirectCare Hub - Compliance Engine

import { z } from 'zod';

export const AuditLogSchema = z.object({
  shift_id: z.string(),
  task_id: z.string(),
  task_title: z.string(),
  action_type: z.enum(['task_completed', 'task_reverted', 'task_modified']),
  performed_by_role: z.enum(['employer', 'attendant', 'system']),
  previous_state: z.boolean(),
  new_state: z.boolean(),
  timestamp: z.any(), // Accepts Firestore FieldValue.serverTimestamp()
  cryptographic_hash: z.string().optional().describe("Optional: SHA-256 hash of the payload for extreme audit parity.")
});

export type AuditLogEntry = z.infer<typeof AuditLogSchema>;
