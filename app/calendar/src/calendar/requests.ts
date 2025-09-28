import { CALENDAR_ITENS_MOCK, USERS_MOCK } from "@/calendar/mocks";
import { MOCK_BILLS } from "@/app/calendar/src/calendar/mock-bills";
import { promises as fs } from "fs";
import path from "path";
import { parseISO, addDays } from "date-fns";
import type { IEvent } from "@/calendar/interfaces";

// Base URL for API requests
const API_BASE_URL = '/api';

const DATA_PATH = path.join(process.cwd(), "data", "calendar-events.json");

async function readData() {
  try {
    const content = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

// Define a type for bill data
interface Bill {
  _id?: string;
  amount?: number;
  payment_amount?: number;
  description?: string;
  nickname?: string;
  payee?: string;
  date?: string;
  upcoming_payment_date?: string;
  payment_date?: string;
  status?: string;
  recurring_date?: number;
}

// Function to convert bill transactions to calendar events
function billsToCalendarEvents(bills: Bill[]): IEvent[] {
  // Default system user for bills
  const systemUser = {
    id: 'system',
    name: 'System',
    picturePath: null,
  };

  // Start IDs from a high number to avoid conflicts with existing events
  const startId = 10000;
  
  return bills.map((bill, index) => {
    try {
      // Parse date from bill
      const billDate = bill.date 
        ? parseISO(bill.date) 
        : (bill.upcoming_payment_date 
            ? parseISO(bill.upcoming_payment_date) 
            : (bill.payment_date 
                ? parseISO(bill.payment_date) 
                : new Date()));
      
      // Determine if this is a recurring bill
      const isRecurring = Boolean(bill.recurring_date);
      
      // Create a calendar event for the bill
      return {
        id: startId + index,
        startDate: billDate.toISOString(),
        endDate: addDays(billDate, 1).toISOString(), // Make it an all-day event
        title: `${isRecurring ? '🔄' : '🧾'} ${bill.description || bill.nickname || bill.payee || 'Bill Payment'} - $${Math.abs(bill.amount || bill.payment_amount || 0).toFixed(2)}`,
        color: isRecurring ? 'purple' as const : 'gray' as const, // Purple for recurring, gray for one-time
        description: `${isRecurring ? 'Recurring bill' : 'Bill payment'} due: ${bill.description || bill.nickname || bill.payee || 'Unknown'}\nAmount: $${Math.abs(bill.amount || bill.payment_amount || 0).toFixed(2)}\nStatus: ${bill.status || 'pending'}${isRecurring ? `\nRecurs: Monthly on day ${bill.recurring_date}` : ''}`,
        user: systemUser,
        kind: 'bill' as const,
        amount: -(Math.abs(bill.amount || bill.payment_amount || 0)), // Make amount negative for outflows
        accountId: bill._id,
        allDay: true,
        // If recurring_date is present, add recurrence info
        recurrence: bill.recurring_date ? `Monthly on day ${bill.recurring_date}` : null,
      } as IEvent;
    } catch (e) {
      console.error('Failed to convert bill to calendar event:', e);
      return null as unknown as IEvent; // This will be filtered out
    }
  }).filter(event => event !== null); // Filter out null events
}

// Function to fetch bills from the enterprise API
async function fetchEnterpriseBills(): Promise<Bill[]> {
  try {
    // Fetch from our debug endpoint to ensure we get good test data
    const response = await fetch(`${API_BASE_URL}/enterprise/bills-debug`);
    if (!response.ok) {
      console.error('Failed to fetch enterprise bills:', response.status);
      return MOCK_BILLS;
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data].filter(Boolean);
  } catch (error) {
    console.error('Error fetching enterprise bills:', error);
    return MOCK_BILLS;
  }
}

export const getEvents = async () => {
  const data = await readData();
  
  // Fetch real enterprise bills from API
  const enterpriseBills = await fetchEnterpriseBills();
  console.log(`Fetched ${enterpriseBills.length} enterprise bills for calendar`);
  
  // Convert bills to calendar events
  const billEvents = billsToCalendarEvents(enterpriseBills);
  console.log(`Created ${billEvents.length} calendar events from bills`);
  
  // Combine standard events with bill events
  if (data && Array.isArray(data.events)) {
    return [...data.events, ...billEvents];
  }
  
  // Return only the real bill events from the API, not the mock calendar events
  return [...billEvents];
};

export const getUsers = async () => {
  const data = await readData();
  if (data && Array.isArray(data.users)) return data.users;
  return USERS_MOCK;
};
