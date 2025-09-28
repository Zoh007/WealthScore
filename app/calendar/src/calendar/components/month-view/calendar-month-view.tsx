"use client";

import { useMemo, useEffect, useRef } from "react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useFinancialData } from "@/hooks/use-financial-data";
import { useGoals } from "@/hooks/use-goals";

import { DayCell } from "@/calendar/components/month-view/day-cell";

import { getCalendarCells, calculateMonthEventPositions } from "@/calendar/helpers";
import { groupTransactionsByDate, aggregateTransactions, toDateKey } from "@/calendar/transactions";
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import type { Goal } from "@/hooks/use-goals";

import type { IEvent } from "@/calendar/interfaces";

interface GoalProgress extends Goal {
  status: 'on-track' | 'needs-attention' | 'at-risk' | 'overdue';
  message: string;
  color: string;
  monthsRemaining: number;
  monthlyAmountNeeded: string;
  currentMonthlySavings: string;
}

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar();
  const { data: financialData, refreshData } = useFinancialData();
  const { goals } = useGoals();

  const transactions = useMemo(() => {
    // combine deposits, purchases, bills into a unified shape
    const txs = [
      ...(financialData.deposits || []).map(d => ({ ...d, type: "deposit" as const, date: d.date })),
      ...(financialData.purchases || []).map(p => ({ ...p, type: "purchase" as const, date: p.date })),
      ...(financialData.bills || []).map(b => ({ ...b, type: "bill" as const, date: b.date })),
    ];

    return txs;
  }, [financialData]);

  // Ensure we have fresh data when the month view mounts
  useEffect(() => {
    if (refreshData) refreshData();
  }, [refreshData]);

  const groupedTransactions = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

  // only include transactions that fall within the selected month
  const transactionsInMonth = useMemo(() => {
    try {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      return transactions.filter(t => {
        if (!t?.date) return false;
        try {
          const dt = parseISO(t.date);
          return isWithinInterval(dt, { start, end });
        } catch (e) {
          return t.date.slice(0, 7) === `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
        }
      });
    } catch (e) {
      return [];
    }
  }, [transactions, selectedDate]);

  const monthAgg = useMemo(() => aggregateTransactions(transactionsInMonth), [transactionsInMonth]);

  // Calculate goal progress interpretation
  const goalInterpretation = useMemo((): GoalProgress[] | null => {
    if (!goals.length) return null;

    const netMonthlyIncome = monthAgg.totalDeposits - monthAgg.totalPayments;
    
    return goals.map((goal): GoalProgress => {
      const targetDate = new Date(goal.targetDate);
      const now = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      // Calculate months remaining to target date
      const monthsRemaining = Math.max(0, 
        (targetDate.getFullYear() - now.getFullYear()) * 12 + 
        (targetDate.getMonth() - now.getMonth())
      );
      
      if (monthsRemaining === 0) {
        return {
          ...goal,
          status: 'overdue',
          message: 'Goal deadline has passed',
          color: 'text-red-600',
          monthsRemaining,
          monthlyAmountNeeded: '0',
          currentMonthlySavings: netMonthlyIncome.toFixed(0)
        };
      }
      
      const monthlyAmountNeeded = goal.amount / monthsRemaining;
      
      let status: 'on-track' | 'needs-attention' | 'at-risk' | 'overdue';
      let message: string;
      let color: string;
      
      if (netMonthlyIncome <= 0) {
        status = 'at-risk';
        message = `Currently spending more than earning. Need to save $${monthlyAmountNeeded.toFixed(0)}/month`;
        color = 'text-red-600';
      } else if (netMonthlyIncome >= monthlyAmountNeeded) {
        status = 'on-track';
        message = `On track! You're saving $${netMonthlyIncome.toFixed(0)}/month vs $${monthlyAmountNeeded.toFixed(0)} needed`;
        color = 'text-green-600';
      } else if (netMonthlyIncome >= monthlyAmountNeeded * 0.7) {
        status = 'needs-attention';
        message = `Close but need $${(monthlyAmountNeeded - netMonthlyIncome).toFixed(0)} more per month`;
        color = 'text-yellow-600';
      } else {
        status = 'at-risk';
        message = `Behind by $${(monthlyAmountNeeded - netMonthlyIncome).toFixed(0)}/month. Consider adjusting timeline`;
        color = 'text-red-600';
      }
      
      return {
        ...goal,
        status,
        message,
        color,
        monthsRemaining,
        monthlyAmountNeeded: monthlyAmountNeeded.toFixed(0),
        currentMonthlySavings: netMonthlyIncome.toFixed(0)
      };
    });
  }, [goals, monthAgg, selectedDate]);

  const allEvents = [...multiDayEvents, ...singleDayEvents];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  // Debug refs to inspect computed widths at runtime
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const sampleCellRef = useRef<HTMLDivElement | null>(null);
  const maxObservedWidth = useRef<number>(0);

  useEffect(() => {
    // small delay to allow layout to settle
    const t = setTimeout(() => {
      try {
        const container = containerRef.current;
        const grid = gridRef.current;
        const sample = sampleCellRef.current;

        const containerRect = container?.getBoundingClientRect();
        const gridRect = grid?.getBoundingClientRect();
        const sampleRect = sample?.getBoundingClientRect();

        // Adaptive min-width: remember the widest grid seen and apply as inline minWidth
        if (gridRect && container) {
          const gw = Math.round(gridRect.width);
          if (gw > (maxObservedWidth.current || 0)) {
            maxObservedWidth.current = gw;
            try {
              container.style.minWidth = `${maxObservedWidth.current}px`;
              // eslint-disable-next-line no-console
              console.log('[calendar-debug] applied dynamic minWidth', maxObservedWidth.current);
            } catch (e) {
              // eslint-disable-next-line no-console
              console.warn('[calendar-debug] failed to set inline minWidth', e);
            }
          }
        }

        // Helper to log ancestor chain with computed styles
        const logAncestors = (el: Element | null, label: string) => {
          if (!el) return;
          // eslint-disable-next-line no-console
          console.groupCollapsed(`[calendar-debug] Ancestors for ${label}`);
          let node: Element | null = el as Element | null;
          let depth = 0;
          while (node) {
            try {
              const rect = node.getBoundingClientRect();
              const cs = window.getComputedStyle(node);
              // eslint-disable-next-line no-console
              console.log({
                depth,
                tag: node.tagName,
                class: node.className,
                rect: { w: Math.round(rect.width), h: Math.round(rect.height) },
                clientWidth: (node as HTMLElement).clientWidth,
                offsetWidth: (node as HTMLElement).offsetWidth,
                computedWidth: cs.width,
                paddingLeft: cs.paddingLeft,
                paddingRight: cs.paddingRight,
                marginLeft: cs.marginLeft,
                marginRight: cs.marginRight,
                overflowX: cs.overflowX,
                boxSizing: cs.boxSizing,
              });
            } catch (e) {
              // eslint-disable-next-line no-console
              console.warn('[calendar-debug] ancestor read error', e);
            }

            node = node.parentElement;
            depth += 1;
          }
          // eslint-disable-next-line no-console
          console.groupEnd();
        };

        // Structured, single-line summary for easy copy/paste
        const makeAncestorSummary = (el: Element | null) => {
          const out: Array<any> = [];
          let node: Element | null = el;
          while (node) {
            try {
              const rect = node.getBoundingClientRect();
              const cs = window.getComputedStyle(node);
              out.push({ tag: node.tagName, cls: node.className, w: Math.round(rect.width), clientW: (node as HTMLElement).clientWidth, computedW: cs.width, overflowX: cs.overflowX });
            } catch (e) {
              out.push({ tag: node.tagName, cls: node.className, error: String(e) });
            }
            node = node.parentElement;
          }
          return out;
        };

        const summary = {
          selectedDate: selectedDate.toISOString(),
          windowInnerWidth: window.innerWidth,
          documentClientWidth: document.documentElement.clientWidth,
          containerRect: containerRect ? { w: Math.round(containerRect.width), h: Math.round(containerRect.height) } : null,
          gridRect: gridRect ? { w: Math.round(gridRect.width), h: Math.round(gridRect.height) } : null,
          sampleRect: sampleRect ? { w: Math.round(sampleRect.width), h: Math.round(sampleRect.height) } : null,
          containerAncestors: makeAncestorSummary(container),
          gridAncestors: makeAncestorSummary(grid),
          sampleAncestors: makeAncestorSummary(sample),
        };

        // eslint-disable-next-line no-console
        console.log("[calendar-debug-summary]", summary);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[calendar-debug] error reading rects", e);
      }
    }, 120);

    return () => clearTimeout(t);
  }, [selectedDate]);

  const eventPositions = useMemo(
    () => calculateMonthEventPositions(multiDayEvents, singleDayEvents, selectedDate),
    [multiDayEvents, singleDayEvents, selectedDate]
  );

  return (
  // containerRef used for debugging widths in the browser console
  <div ref={containerRef as any} className="w-full">
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map(day => (
          <div key={day} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

  {/* grid with fixed 6 rows (6*7=42 cells) and equal columns so layout doesn't shift */}
  <div ref={gridRef as any} className="grid grid-cols-7 grid-rows-6 overflow-hidden w-full">
        {cells.map((cell, idx) => (
          <DayCell
            key={cell.date.toISOString()}
            cell={cell}
            events={allEvents}
            eventPositions={eventPositions}
            transactionsForDate={groupedTransactions[toDateKey(cell.date)]}
            // attach a sample ref to the first cell so we can measure a day cell
            {...(idx === 0 ? { ref: sampleCellRef } : {})}
          />
        ))}
      </div>

      <div className="mt-4 p-4 border-t">
        <h3 className="text-sm font-semibold">Month Analysis</h3>
        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
          <div className="col-span-1 p-2 rounded-md border">
            <div className="text-xs font-medium text-muted-foreground">Deposits</div>
            <div className="mt-1">Total: <span className="font-bold text-green-600">${monthAgg.totalDeposits.toFixed(2)}</span></div>
            <div>Count: <span className="font-bold">{monthAgg.depositCount}</span></div>
            {monthAgg.depositCount > 0 && (
              <div>Avg: <span className="font-bold text-green-600">${monthAgg.avgDeposit.toFixed(2)}</span></div>
            )}
          </div>
          
          <div className="col-span-1 p-2 rounded-md border">
            <div className="text-xs font-medium text-muted-foreground">Payments</div>
            <div className="mt-1">Total: <span className="font-bold text-red-600">${monthAgg.totalPayments.toFixed(2)}</span></div>
            <div>Count: <span className="font-bold">{monthAgg.paymentCount}</span></div>
            {monthAgg.paymentCount > 0 && (
              <div>Avg: <span className="font-bold text-red-600">${monthAgg.avgPayment.toFixed(2)}</span></div>
            )}
          </div>
          
          <div className="col-span-1 p-2 rounded-md border">
            <div className="text-xs font-medium text-muted-foreground">Summary</div>
            <div className="mt-1">Total transactions: <span className="font-bold">{monthAgg.count}</span></div>
            <div>Net avg: <span className={`font-bold ${monthAgg.netAvgPerTransaction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${monthAgg.netAvgPerTransaction.toFixed(2)}
            </span></div>
          </div>
        </div>
        
        {/* Goal Progress Interpretation */}
        {goalInterpretation && goalInterpretation.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-3">Goal Progress Analysis</h4>
            <div className="space-y-3">
              {goalInterpretation.map((goalProgress) => (
                <div key={goalProgress.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{goalProgress.name}</h5>
                    <div className="text-xs text-gray-500">
                      Target: ${goalProgress.amount.toLocaleString()} by {new Date(goalProgress.targetDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex-1">
                      <div className="text-gray-600">
                        Need: <span className="font-semibold">${goalProgress.monthlyAmountNeeded}/month</span>
                      </div>
                      <div className="text-gray-600">
                        Current: <span className="font-semibold">${goalProgress.currentMonthlySavings}/month</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-gray-600">
                        Months left: <span className="font-semibold">{goalProgress.monthsRemaining}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-2 text-xs font-medium ${goalProgress.color}`}>
                    {goalProgress.message}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          goalProgress.status === 'on-track' ? 'bg-green-500' :
                          goalProgress.status === 'needs-attention' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, Math.max(0, 
                            parseFloat(goalProgress.monthlyAmountNeeded) > 0 ? 
                            (parseFloat(goalProgress.currentMonthlySavings) / parseFloat(goalProgress.monthlyAmountNeeded)) * 100 
                            : 0
                          ))}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>$0</span>
                      <span>${goalProgress.monthlyAmountNeeded} needed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {goals.length === 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-center py-4 text-gray-500 text-sm">
              <p>No financial goals set.</p>
              <p className="text-xs mt-1">Visit the Planning section to create goals and see progress analysis here.</p>
            </div>
          </div>
        )}

        {/* Show message when no transactions but goals exist */}
        {goalInterpretation && goalInterpretation.length > 0 && monthAgg.count === 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-center py-4 text-gray-500 text-sm">
              <p>No transactions this month to analyze goal progress.</p>
              <p className="text-xs mt-1">Add some financial data to see how you're tracking toward your goals.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
