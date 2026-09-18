// Developed by VertexAgent.io 
// Project: DirectCare Hub - Multi-Jurisdiction Payroll & Compliance Engine

import { z } from "zod";

// ============================================================================
// 1. GLOBAL JURISDICTION RULES (/jurisdictions/{province_code})
// ============================================================================

export const OvertimeRuleSchema = z.object({
  daily_tier1_hours: z.number().nullable(), // e.g., 8 for AB/BC, null for ON
  daily_tier1_rate: z.number().nullable(),  // e.g., 1.5
  daily_tier2_hours: z.number().nullable(), // e.g., 12 for BC, null for AB/ON
  daily_tier2_rate: z.number().nullable(),  // e.g., 2.0 for BC
  weekly_hours: z.number(),                 // e.g., 40 for BC, 44 for AB/ON
  weekly_rate: z.number(),                  // e.g., 1.5
});

export const StatutoryHolidaySchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(), // ISO date string or timestamp
  requires_average_day_pay: z.boolean(), // true for AB/BC
  worked_multiplier: z.number(),         // e.g., 1.5
});

export const WorkersCompSchema = z.object({
  board_name: z.string(), // "WorkSafeBC", "WCB Alberta", "WSIB Ontario"
  default_premium_rate: z.number().min(0), // Percentage rate per $100 of assessable payroll
  assessable_earnings_cap: z.number().nullable(), // Maximum assessable earnings ceiling
});

export const JurisdictionSchema = z.object({
  id: z.enum(["ON", "BC", "AB", "MB", "SK", "NS", "QC"]),
  province_name: z.string(),
  overtime_rules: OvertimeRuleSchema,
  statutory_holidays: z.array(StatHolidaySchemaForTypes()),
  workers_comp: WorkersCompSchema,
  tax_brackets: z.array(
    z.object({
      threshold: z.number(),
      marginal_rate: z.number(),
    })
  ),
});

// Helper for lazy references or direct export
function StatHolidaySchemaForTypes() {
  return StatutoryHolidaySchema;
}

export type Jurisdiction = z.infer<typeof JurisdictionSchema>;

// ============================================================================
// 2. EMPLOYER PROFILE EXPANSION (/users/{employerId})
// ============================================================================

export const EmployerComplianceProfileSchema = z.object({
  jurisdiction_code: z.enum(["ON", "BC", "AB", "MB", "SK", "NS", "QC"]),
  funding_program: z.enum(["CILT", "CSIL", "SMC", "SFMC", "AAD"]),
  cra_business_number: z.string().regex(
    /^\d{9}RP\d{4}$/, 
    "Must be a valid 15-character CRA Payroll Account (e.g., 123456789RP0001)"
  ),
  workers_comp_account: z.string().min(5, "Valid provincial WCB/WSIB account required"),
});

export type EmployerComplianceProfile = z.infer<typeof EmployerComplianceProfileSchema>;

// ============================================================================
// 3. ATTENDANT TAX CONFIGURATION (/users/{attendantId}/tax_profile/{year})
// ============================================================================

export const AttendantTaxConfigSchema = z.object({
  year: z.number().int().min(2024),
  provincial_form_type: z.enum(["TD1ON", "TD1BC", "TD1AB", "TD1MB", "TD1SK", "TD1NS"]),
  federal_claim_amount: z.number().min(0),
  provincial_claim_amount: z.number().min(0),
  additional_tax_withheld: z.number().min(0).default(0), // Box for extra requested deductions
  is_ei_exempt: z.boolean().default(false), // e.g., if the attendant is an immediate family member
});

export type AttendantTaxConfig = z.infer<typeof AttendantTaxConfigSchema>;

// ============================================================================
// 4. IMMUTABLE PAY RUN SNAPSHOTS (/users/{employerId}/pay_runs/{payRunId})
// ============================================================================

export const GrossPayBreakdownSchema = z.object({
  regular_hours: z.number().min(0),
  regular_pay: z.number().min(0),
  overtime_tier1_hours: z.number().min(0).default(0), // 1.5x hours
  overtime_tier1_pay: z.number().min(0).default(0),
  overtime_tier2_hours: z.number().min(0).default(0), // 2.0x hours (BC specific)
  overtime_tier2_pay: z.number().min(0).default(0),
  stat_holiday_hours: z.number().min(0).default(0),
  stat_holiday_average_pay: z.number().min(0).default(0), // 1/20th lookback rule pay
  stat_holiday_premium_pay: z.number().min(0).default(0), // 1.5x worked hours
  vacation_pay_accumulated: z.number().min(0), // 4% or 6% mandatory
  total_gross: z.number().min(0),
});

export const EmployerLiabilitiesSchema = z.object({
  cpp_contribution: z.number().min(0), // Employer matching portion
  ei_contribution: z.number().min(0),  // Employer matching portion (usually 1.4x employee)
  workers_comp_premium: z.number().min(0), // Calculated via active snapshot rate
});

export const PayRunSnapshotSchema = z.object({
  id: z.string(),
  employer_id: z.string(),
  attendant_id: z.string(),
  pay_period_start: z.string(),
  pay_period_end: z.string(),
  
  // Denormalized snapshot: Preserves the exact legal math used on the day the pay run was locked
  applied_jurisdiction_rules: JurisdictionSchema, 
  applied_tax_config: AttendantTaxConfigSchema,
  
  gross_pay_breakdown: GrossPayBreakdownSchema,
  employer_liabilities: EmployerLiabilitiesSchema,
  
  net_pay: z.number().min(0),
  status: z.enum(["draft", "locked", "remitted"]),
  locked_at: z.string().nullable(),
});

export type PayRunSnapshot = z.infer<typeof PayRunSnapshotSchema>;
