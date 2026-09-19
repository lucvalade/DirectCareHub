// Developed by VertexAgent.io 
// Project: DirectCare Hub - Ambient Scribing Module

import { z } from "zod";

export const ShiftScribeSchema = z.object({
  shift_summary: z.string().describe("A professional, 2-3 sentence clinical summary of the shift, written in the third person."),
  care_activities_completed: z.array(z.string()).describe("A list of specific care tasks completed (e.g., 'Arjo ceiling lift transfer', 'Meal preparation', 'Bowel routine')."),
  health_observations: z.object({
    mood_and_behavior: z.string().describe("Observations regarding the employer's mood, energy, or behavior."),
    reported_symptoms: z.array(z.string()).describe("Any physical symptoms mentioned, such as cough, pain, or fatigue. Return an empty array if none."),
    vitals_noted: z.boolean().describe("True if any specific vital signs (temperature, blood pressure) were mentioned.")
  }),
  incidents_or_concerns: z.string().nullable().describe("Details of any accidents, near-misses, or equipment issues. Return null if the shift was routine."),
  action_items_for_next_shift: z.array(z.string()).describe("Tasks or warnings left for the next attendant on duty.")
});

export type ShiftScribeResult = z.infer<typeof ShiftScribeSchema>;
