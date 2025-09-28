"use client";

import { useMemo, useEffect, useRef } from "react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useFinancialData } from "@/hooks/use-financial-data";

import { DayCell } from "@/calendar/components/month-view/day-cell";

import { getCalendarCells, calculateMonthEventPositions } from "@/calendar/helpers";
import { groupTransactionsByDate, aggregateTransactions, toDateKey } from "@/calendar/transactions";
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar();
  const { data: financialData, refreshData } = useFinancialData();

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
        <div className="mt-2 flex gap-6 text-sm">
          <div>Total deposits: <span className="font-bold">${monthAgg.totalDeposits.toFixed(2)}</span></div>
          <div>Total payments: <span className="font-bold">${monthAgg.totalPayments.toFixed(2)}</span></div>
          <div>Transactions: <span className="font-bold">{monthAgg.count}</span></div>
          <div>Average: <span className="font-bold">${monthAgg.avg.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
