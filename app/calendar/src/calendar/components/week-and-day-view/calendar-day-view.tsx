import { Calendar, Clock, User } from "lucide-react";
import { parseISO, areIntervalsOverlapping, format } from "date-fns";
import { useEffect } from "react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useFinancialData } from "@/hooks/use-financial-data";
import { groupTransactionsByDate, toDateKey } from "@/calendar/transactions";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SingleCalendar } from "@/components/ui/single-calendar";

import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import { EventBlock } from "@/calendar/components/week-and-day-view/event-block";
import { DroppableTimeBlock } from "@/calendar/components/dnd/droppable-time-block";
import { CalendarTimeline } from "@/calendar/components/week-and-day-view/calendar-time-line";
import { DayViewMultiDayEventsRow } from "@/calendar/components/week-and-day-view/day-view-multi-day-events-row";

import { cn } from "@/lib/utils";
import { groupEvents, getEventBlockStyle, isWorkingHour, getCurrentEvents, getVisibleHours } from "@/calendar/helpers";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarDayView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, setSelectedDate, users, visibleHours, workingHours } = useCalendar();

  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(visibleHours, singleDayEvents);

  const currentEvents = getCurrentEvents(singleDayEvents);

  const dayEvents = singleDayEvents.filter(event => {
    const eventDate = parseISO(event.startDate);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const groupedEvents = groupEvents(dayEvents);

  // Transactions for the selected day
  const { data: financialData, refreshData } = useFinancialData();
  useEffect(() => {
    if (refreshData) refreshData();
  }, [refreshData]);

  const allTx = [
    ...(financialData.deposits || []).map(d => ({ ...d, type: "deposit" as const, date: d.date })),
    ...(financialData.purchases || []).map(p => ({ ...p, type: "purchase" as const, date: p.date })),
    ...(financialData.bills || []).map(b => ({ ...b, type: "bill" as const, date: b.date })),
  ];

  const txMap = groupTransactionsByDate(allTx as any);
  const todaysTx = txMap[toDateKey(selectedDate)] || [];

  return (
    <div className="flex">
      <div className="flex flex-1 flex-col">
        <div>
          <DayViewMultiDayEventsRow selectedDate={selectedDate} multiDayEvents={multiDayEvents} />

          {/* Day header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <span className="flex-1 border-l py-2 text-center text-xs font-medium text-muted-foreground">
              {format(selectedDate, "EE")} <span className="font-semibold text-foreground">{format(selectedDate, "d")}</span>
            </span>
          </div>
        </div>

        <ScrollArea className="h-[800px]" type="always">
          <div className="flex">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: "96px" }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && <span className="text-xs text-muted-foreground">{format(new Date().setHours(hour, 0, 0, 0), "hh a")}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="relative flex-1 border-l">
              <div className="relative">
                {hours.map((hour, index) => {
                  const isDisabled = !isWorkingHour(selectedDate, hour, workingHours);

                  return (
                    <div key={hour} className={cn("relative", isDisabled && "bg-calendar-disabled-hour")} style={{ height: "96px" }}>
                      {index !== 0 && <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>}

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={0}>
                        <AddEventDialog startDate={selectedDate} startTime={{ hour, minute: 0 }}>
                          <div className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                        </AddEventDialog>
                      </DroppableTimeBlock>

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={15}>
                        <AddEventDialog startDate={selectedDate} startTime={{ hour, minute: 15 }}>
                          <div className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                        </AddEventDialog>
                      </DroppableTimeBlock>

                      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={30}>
                        <AddEventDialog startDate={selectedDate} startTime={{ hour, minute: 30 }}>
                          <div className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                        </AddEventDialog>
                      </DroppableTimeBlock>

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={45}>
                        <AddEventDialog startDate={selectedDate} startTime={{ hour, minute: 45 }}>
                          <div className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                        </AddEventDialog>
                      </DroppableTimeBlock>
                    </div>
                  );
                })}

                {groupedEvents.map((group, groupIndex) =>
                  group.map(event => {
                    let style = getEventBlockStyle(event, selectedDate, groupIndex, groupedEvents.length, { from: earliestEventHour, to: latestEventHour });
                    const hasOverlap = groupedEvents.some(
                      (otherGroup, otherIndex) =>
                        otherIndex !== groupIndex &&
                        otherGroup.some(otherEvent =>
                          areIntervalsOverlapping(
                            { start: parseISO(event.startDate), end: parseISO(event.endDate) },
                            { start: parseISO(otherEvent.startDate), end: parseISO(otherEvent.endDate) }
                          )
                        )
                    );

                    if (!hasOverlap) style = { ...style, width: "100%", left: "0%" };

                    return (
                      <div key={event.id} className="absolute p-1" style={style}>
                        <EventBlock event={event} />
                      </div>
                    );
                  })
                )}
              </div>

              <CalendarTimeline firstVisibleHour={earliestEventHour} lastVisibleHour={latestEventHour} />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right column: transactions summary for the selected day */}
      <div className="hidden w-96 flex-col gap-4 border-l p-4 lg:flex">
        <div>
          <h4 className="text-sm font-semibold">Transactions for {format(selectedDate, 'MMM d, yyyy')}</h4>
          <div className="mt-2 flex flex-col gap-2">
            {todaysTx.length === 0 && <div className="text-sm text-muted-foreground">No transactions</div>}
            {todaysTx.map(tx => (
              <div key={tx._id || tx.description} className="flex items-center justify-between rounded-md border p-2">
                <div>
                  <div className="text-sm font-medium">{(tx as any).merchant_name || tx.description || tx.merchant_id || 'Transaction'}</div>
                  <div className="text-xs text-muted-foreground">{tx.type}</div>
                </div>
                <div className={tx.type === 'deposit' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
