import type { TEventColor } from "@/calendar/types";

export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

// Minimal financial-focused event model used by the calendar UI.
export interface IEvent {
  id: number; // keep number to match existing components
  startDate: string; // ISO string
  endDate: string; // ISO string
  title: string;
  color: TEventColor;
  description?: string;
  user: IUser;

  // Financial extensions
  kind?: 'bill' | 'payday' | 'subscription' | 'transfer' | 'reminder' | 'goal' | 'other';
  amount?: number; // positive for inflows, negative for outflows
  accountId?: string; // identifier for related account (optional)
  paidDates?: string[]; // ISO dates of occurrences that were marked paid
  allDay?: boolean;
  recurrence?: string | null; // optional recurrence rule or description
  
  // Goal integration
  goalId?: string; // ID of linked financial goal
  goalName?: string; // Name of linked financial goal for display
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
