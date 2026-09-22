// Developed by VertexAgent.io
// Project: DirectCare Hub - Shift Bidding Module

import { z } from 'zod';

export const ShiftBidSchema = z.object({
  shift_id: z.string(),
  attendant_id: z.string(),
  proposed_rate: z.number().optional().describe("Agreed hourly rate for the shift"),
  attendant_notes: z.string().max(250).optional().describe("Optional message from attendant regarding availability"),
  status: z.enum(['pending', 'accepted', 'declined']).default('pending'),
  submitted_at: z.any(),
});

export type ShiftBid = z.infer<typeof ShiftBidSchema>;
