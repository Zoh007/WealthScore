import { parseISO, addDays } from "date-fns";
import type { IEvent } from "@/calendar/interfaces";

// Transaction type matching the one in use-financial-data.ts
interface Transaction {
  _id?: string;
  amount: number;
  description?: string;
  date?: string;
  type?: 'deposit' | 'purchase' | 'bill' | 'merchant';
  status?: string;
  medium?: string;
  merchant_id?: string;
  payer_id?: string;
  payee_id?: string;
  // Additional fields from enterprise bills API
  payee?: string;
  recurring_date?: number;
  upcoming_payment_date?: string;
  payment_date?: string;
  creation_date?: string;
}

// Default user for bill events
const SYSTEM_USER = {
  id: "system",
  name: "System",
  picturePath: null,
};

/**
 * Converts bill transactions to calendar events
 * @deprecated Use the billsToCalendarEvents function in requests.ts instead
 */
export function billsToEvents(bills: Transaction[]): IEvent[] {
  if (!bills || !Array.isArray(bills)) {
    console.warn('billsToEvents received non-array:', bills);
    return [];
  }

  console.log(`Converting ${bills.length} bills to calendar events`);
  
  return bills
    .filter(bill => {
      // Only include bills with a date
      if (!bill.date) {
        console.warn('Bill missing date:', bill);
        return false;
      }
      return bill.type === 'bill';
    })
    .map((bill, index) => {
      try {
        const billTx = bill;
        // Parse date from bill - add debug logs
        const rawDate = billTx.date || '';
        console.log(`Converting bill: ${billTx.description || billTx.payee || 'Unknown'}, date: ${rawDate}`);
        
        let billDate;
        try {
          billDate = rawDate ? parseISO(rawDate as string) : new Date();
          console.log(`Parsed bill date: ${billDate.toISOString()}`);
        } catch (e) {
          console.error(`Failed to parse bill date: ${rawDate}`, e);
          billDate = new Date(); // Fallback to today
        }
        
        // Create a calendar event for the bill
        const event: IEvent = {
          id: index + 10000, // Use a simple numeric ID to avoid parsing issues
          startDate: billDate.toISOString(),
          endDate: addDays(billDate, 1).toISOString(), // Make it an all-day event
          title: `${billTx.description || 'Bill Payment'} - $${Math.abs(billTx.amount || 0).toFixed(2)}`,
          color: 'red', // Bills are expenses, so red
          description: `Bill payment: ${billTx.description || billTx.payee || 'Unknown payee'}`,
          user: SYSTEM_USER,
          kind: 'bill',
          amount: -(Math.abs(billTx.amount || 0)), // Make amount negative for outflows
          allDay: true,
          // If recurring_date is present, add recurrence info
          recurrence: billTx.recurring_date ? `Monthly on day ${billTx.recurring_date}` : null,
        };
        
        if (billTx.payee) {
          event.description += `\nPayee: ${billTx.payee}`;
        }
        
        if (billTx.status) {
          event.description += `\nStatus: ${billTx.status}`;
        }
        
        return event;
      } catch (e) {
        console.error('Failed to convert bill to event:', e, bill);
        return null;
      }
    })
    .filter(Boolean) as IEvent[]; // Filter out nulls from parsing errors
}