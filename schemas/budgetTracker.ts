// Developed by VertexAgent.io
// Project: DirectCare Hub - Budget & Burn-Rate Engine

import { z } from 'zod';

export const BudgetAllocationSchema = z.object({
  employer_id: z.string(),
  quarter_id: z.string().describe("e.g., 'Q3-2026'"),
  total_allocated_funds: z.number().describe("Total provincial funding provided for the quarter"),
  total_spent_funds: z.number().describe("Cumulative payroll and overtime disbursements to date"),
  projected_exhaustion_date: z.string().nullable().describe("Projected date when funds will hit zero based on current burn rate"),
  alert_status: z.enum(['healthy', 'warning', 'critical']),
  last_updated: z.any(),
});

export type BudgetAllocation = z.infer<typeof BudgetAllocationSchema>;
