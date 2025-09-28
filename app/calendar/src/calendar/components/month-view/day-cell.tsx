"use client";

import { useMemo } from "react";
import { isToday, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import { EventBullet } from "@/calendar/components/month-view/event-bullet";
import { DroppableDayCell } from "@/calendar/components/dnd/droppable-day-cell";
import { MonthEventBadge } from "@/calendar/components/month-view/month-event-badge";

import { cn } from "@/lib/utils";
import { getMonthCellEvents } from "@/calendar/helpers";

import type { ICalendarCell, IEvent } from "@/calendar/interfaces";
import type { TTransaction } from "@/calendar/transactions";

interface IProps {
  cell: ICalendarCell;
  events: IEvent[];
  eventPositions: Record<string, number>;
  transactionsForDate?: TTransaction[];
}

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, events, eventPositions, transactionsForDate }: IProps) {
  const { day, currentMonth, date } = cell;
  const router = useRouter();
  const { setSelectedDate } = useCalendar();

  const cellEvents = useMemo(() => getMonthCellEvents(date, events, eventPositions), [date, events, eventPositions]);
  const isSunday = date.getDay() === 0;

  return (
    <DroppableDayCell cell={cell}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setSelectedDate(startOfDay(date));
          router.push('/calendar/day-view');
        }}
        className={cn("flex h-full flex-col gap-1 border-l border-t py-1.5 lg:py-2 cursor-pointer hover:bg-muted/30 min-w-0", isSunday && "border-l-0")}
      >
        <span
          className={cn(
            "h-6 px-1 text-xs font-semibold lg:px-2",
            !currentMonth && "opacity-20",
            isToday(date) && "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground"
          )}
        >
          {day}
        </span>

        <div className={cn("flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0 min-w-0", !currentMonth && "opacity-50")}>
          {[0, 1, 2].map(position => {
            const event = cellEvents.find(e => e.position === position);
            const eventKey = event ? `event-${event.id}-${position}` : `empty-${position}`;

            return (
              <div key={eventKey} className="lg:flex-1">
                {event && (
                  <>
                    <EventBullet className="lg:hidden" color={event.color} />
                    <div className="min-w-0">
                      <MonthEventBadge className="hidden lg:flex" event={event} cellDate={startOfDay(date)} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Transaction markers */}
        {transactionsForDate && transactionsForDate.length > 0 && (
          <div className="flex items-center gap-1 px-1">
            <div className="flex items-center gap-1">
              {transactionsForDate.some(t => t.type === "deposit") && <span className="inline-block w-2 h-2 rounded-full bg-green-500" />}
              {transactionsForDate.some(t => t.type === "purchase" || t.type === "bill") && <span className="inline-block w-2 h-2 rounded-full bg-red-500" />}
            </div>
            <div className="text-xs text-muted-foreground">{transactionsForDate.length}</div>
          </div>
        )}

        {cellEvents.length > MAX_VISIBLE_EVENTS && (
          <p className={cn("h-4.5 px-1.5 text-xs font-semibold text-muted-foreground", !currentMonth && "opacity-50")}>
            <span className="sm:hidden">+{cellEvents.length - MAX_VISIBLE_EVENTS}</span>
            <span className="hidden sm:inline"> {cellEvents.length - MAX_VISIBLE_EVENTS} more...</span>
          </p>
        )}
      </div>
    </DroppableDayCell>
  );
}
