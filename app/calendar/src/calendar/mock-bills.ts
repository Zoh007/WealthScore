import { addDays, format } from 'date-fns';

/**
 * Mock bills data to use if the API doesn't return any data
 * Recurring bills will appear as purple calendar events (with recurring_date)
 * One-time bills will appear as gray calendar events
 */
export const MOCK_BILLS = [
  // RECURRING BILLS (with recurring_date)
  {
    _id: 'mock-bill-1',
    amount: 1200,
    description: 'Rent Payment',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'bill' as const,
    status: 'pending',
    payee: 'Landlord Properties LLC',
    recurring_date: 1, // 1st of the month
    nickname: 'Monthly Rent',
  },
  {
    _id: 'mock-bill-2',
    amount: 89.99,
    description: 'Internet Service',
    date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    type: 'bill' as const,
    status: 'pending',
    payee: 'Fast Internet Co',
    recurring_date: 15, // 15th of the month
  },
  {
    _id: 'mock-bill-3',
    amount: 120.45,
    description: 'Electricity Bill',
    date: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
    type: 'bill' as const,
    status: 'pending',
    payee: 'Power Company',
    recurring_date: 20, // 20th of the month
  },
  {
    _id: 'mock-bill-4',
    amount: 45.00,
    description: 'Water Bill',
    date: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
    type: 'bill' as const,
    status: 'pending',
    payee: 'Municipal Water',
    recurring_date: 25, // 25th of the month
    nickname: 'City Water Service',
  },
  
  // ONE-TIME BILLS (without recurring_date)
  {
    _id: 'mock-bill-5',
    amount: 299.99,
    description: 'New Phone Purchase',
    date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    type: 'bill' as const,
    status: 'pending',
    payee: 'Mobile Store',
    nickname: 'Phone Bill',
  },
  {
    _id: 'mock-bill-6',
    amount: 79.99,
    description: 'Car Repair',
    date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    type: 'bill' as const,
    status: 'pending',
    payee: 'Auto Shop',
  },
  // Additional bills
  {
    _id: 'mock-bill-5',
    amount: 89.99,
    description: 'Phone Bill',
    date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    type: 'bill' as const,
    status: 'pending',
    payee: 'Mobile Carrier',
    recurring_date: 7,
    nickname: 'Mobile Phone Service',
  },
  {
    _id: 'mock-bill-6',
    amount: 135.50,
    description: 'Car Insurance',
    date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    type: 'bill' as const,
    status: 'pending',
    payee: 'Insurance Company',
    recurring_date: 3,
    nickname: 'Auto Insurance Premium',
  },
  {
    _id: 'mock-bill-7',
    amount: 49.99,
    description: 'Gym Membership',
    date: format(addDays(new Date(), -2), 'yyyy-MM-dd'), // Recently passed due
    type: 'bill' as const,
    status: 'pending',
    payee: 'Fitness Center',
    recurring_date: 26,
    nickname: 'Monthly Gym Fee',
  },
];