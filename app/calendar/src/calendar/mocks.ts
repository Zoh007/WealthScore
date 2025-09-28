import type { TEventColor } from '@/calendar/types';
import type { IEvent, IUser } from '@/calendar/interfaces';

// Single user: Nathan
export const USERS_MOCK: IUser[] = [
  {
    id: 'nathan-001',
    name: 'Nathan',
    picturePath: null,
  },
];

const COLORS: TEventColor[] = ['red', 'green', 'blue', 'purple', 'orange'];

// Helper to format ISO date for a local date (keeps time when provided)
const iso = (d: Date) => d.toISOString();

// Build a set of finance-focused events around today for Nathan
const now = new Date();
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const CALENDAR_ITENS_MOCK: IEvent[] = [
  // Paycheck (every two weeks example - represented as individual occurrences in mocks)
  {
    id: 1,
    startDate: iso(new Date(startOfToday.getTime() - 14 * 24 * 60 * 60 * 1000)),
    endDate: iso(new Date(startOfToday.getTime() - 14 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)),
    title: 'Payday',
    color: 'green',
    description: 'Direct deposit from employer',
    user: USERS_MOCK[0],
    kind: 'payday',
    amount: 2500.0,
    accountId: 'checking-001',
    paidDates: [],
  },
  {
    id: 2,
    startDate: iso(new Date(startOfToday.getTime())),
    endDate: iso(new Date(startOfToday.getTime() + 60 * 60 * 1000)),
    title: 'Payday',
    color: 'green',
    description: 'Direct deposit from employer',
    user: USERS_MOCK[0],
    kind: 'payday',
    amount: 2500.0,
    accountId: 'checking-001',
    paidDates: [],
  },
  // Rent (monthly)
  {
    id: 3,
    startDate: iso(new Date(now.getFullYear(), now.getMonth(), 1, 9, 0, 0)),
    endDate: iso(new Date(now.getFullYear(), now.getMonth(), 1, 10, 0, 0)),
    title: 'Rent',
    color: 'red',
    description: 'Monthly rent payment',
    user: USERS_MOCK[0],
    kind: 'bill',
    amount: -1200.0,
    accountId: 'checking-001',
    paidDates: [],
  },
  // Credit Card Payment (due on 15th)
  {
    id: 4,
    startDate: iso(new Date(now.getFullYear(), now.getMonth(), 15, 12, 0, 0)),
    endDate: iso(new Date(now.getFullYear(), now.getMonth(), 15, 13, 0, 0)),
    title: 'Credit Card Due',
    color: 'red',
    description: 'Credit card minimum due',
    user: USERS_MOCK[0],
    kind: 'bill',
    amount: -250.0,
    accountId: 'credit-001',
    paidDates: [],
  },
  // Streaming subscription
  {
    id: 5,
    startDate: iso(new Date(now.getFullYear(), now.getMonth(), 5, 8, 0, 0)),
    endDate: iso(new Date(now.getFullYear(), now.getMonth(), 5, 9, 0, 0)),
    title: 'Streaming Subscription',
    color: 'purple',
    description: 'Monthly subscription charge',
    user: USERS_MOCK[0],
    kind: 'subscription',
    amount: -12.99,
    accountId: 'credit-001',
    paidDates: [],
  },
  // Savings transfer (scheduled)
  {
    id: 6,
    startDate: iso(new Date(now.getFullYear(), now.getMonth(), 10, 7, 30, 0)),
    endDate: iso(new Date(now.getFullYear(), now.getMonth(), 10, 8, 0, 0)),
    title: 'Transfer to Savings',
    color: 'blue',
    description: 'Automatic savings transfer',
    user: USERS_MOCK[0],
    kind: 'transfer',
    amount: -300.0,
    accountId: 'checking-001',
    paidDates: [],
  },
  // Utility Bill
  {
    id: 7,
    startDate: iso(new Date(now.getFullYear(), now.getMonth(), 20, 9, 0, 0)),
    endDate: iso(new Date(now.getFullYear(), now.getMonth(), 20, 10, 0, 0)),
    title: 'Utilities',
    color: 'red',
    description: 'Electricity and water bill',
    user: USERS_MOCK[0],
    kind: 'bill',
    amount: -180.0,
    accountId: 'checking-001',
    paidDates: [],
  },
  // Another payday in two weeks
  {
    id: 8,
    startDate: iso(new Date(startOfToday.getTime() + 14 * 24 * 60 * 60 * 1000)),
    endDate: iso(new Date(startOfToday.getTime() + 14 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)),
    title: 'Payday',
    color: 'green',
    description: 'Direct deposit from employer',
    user: USERS_MOCK[0],
    kind: 'payday',
    amount: 2500.0,
    accountId: 'checking-001',
    paidDates: [],
  },
];

export { CALENDAR_ITENS_MOCK };
