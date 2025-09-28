import { z } from "zod";

export const eventSchema = z.object({
  user: z.string().min(1, "User is required").optional(),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  startDate: z.date().optional(),
  startTime: z.object({ hour: z.number(), minute: z.number() }).optional(),
  endDate: z.date().optional(),
  endTime: z.object({ hour: z.number(), minute: z.number() }).optional(),
  color: z.enum(["blue", "green", "red", "yellow", "purple", "orange", "gray"]).optional(),
  goalId: z.string().optional(),
  goalName: z.string().optional(),
  // Goal editing fields
  goalAmount: z.number().min(0.01, "Amount must be greater than 0").optional(),
  goalTargetDate: z.string().min(1, "Target date is required").optional(),
  goalDescription: z.string().optional(),
});

export const goalEditSchema = z.object({
  goalName: z.string().min(1, "Goal name is required"),
  goalAmount: z.number().min(0.01, "Amount must be greater than 0"),
  goalTargetDate: z.string().min(1, "Target date is required"),
  goalDescription: z.string().optional(),
});

export const combinedFormSchema = z.union([eventSchema, goalEditSchema]);

export type TEventFormData = z.infer<typeof eventSchema>;
export type TGoalEditFormData = z.infer<typeof goalEditSchema>;
export type TCombinedFormData = TEventFormData & Partial<TGoalEditFormData>;
