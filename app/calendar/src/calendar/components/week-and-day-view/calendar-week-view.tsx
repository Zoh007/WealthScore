import { startOfWeek, addDays, format, parseISO, isSameDay, areIntervalsOverlapping, isWithinInterval } from "date-fns";
import { useEffect } from "react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useFinancialData } from "@/hooks/use-financial-data";

import { ScrollArea } from "@/components/ui/scroll-area";

import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import { EventBlock } from "@/calendar/components/week-and-day-view/event-block";
import { DroppableTimeBlock } from "@/calendar/components/dnd/droppable-time-block";
import { CalendarTimeline } from "@/calendar/components/week-and-day-view/calendar-time-line";
import { WeekViewMultiDayEventsRow } from "@/calendar/components/week-and-day-view/week-view-multi-day-events-row";

import { cn } from "@/lib/utils";
import { groupEvents, getEventBlockStyle, isWorkingHour, getVisibleHours } from "@/calendar/helpers";
import { groupTransactionsByDate, aggregateTransactions } from "@/calendar/transactions";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarWeekView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, workingHours, visibleHours } = useCalendar();
  const { data: financialData, refreshData } = useFinancialData();

  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(visibleHours, singleDayEvents);

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Ensure we have fresh data when the week view mounts
  useEffect(() => {
    if (refreshData) refreshData();
  }, [refreshData]);

  // Collect transactions for the week
  const allTx = [
    ...(financialData.deposits || []).map(d => ({ ...d, type: "deposit" as const, date: d.date })),
    ...(financialData.purchases || []).map(p => ({ ...p, type: "purchase" as const, date: p.date })),
    ...(financialData.bills || []).map(b => ({ ...b, type: "bill" as const, date: b.date })),
  ];

  const weekStartDate = weekStart;
  const weekEndDate = addDays(weekStart, 6);

  const transactionsInWeek = allTx.filter(tx => {
    if (!tx?.date) return false;
    try {
      const dt = parseISO(tx.date);
      return isWithinInterval(dt, { start: weekStartDate, end: weekEndDate });
    } catch (e) {
      return false;
    }
  });

  const weekAgg = aggregateTransactions(transactionsInWeek as any);

  // Debug: log week range and sample transactions to troubleshoot aggregation
  try {
    // eslint-disable-next-line no-console
    console.log('[week-analytics-debug] weekStart:', weekStartDate.toISOString(), 'weekEnd:', weekEndDate.toISOString());
    // eslint-disable-next-line no-console
    console.log('[week-analytics-debug] total transactions fetched:', allTx.length, 'in week:', transactionsInWeek.length);
  // eslint-disable-next-line no-console
  console.log('[week-analytics-debug] sample txs:', (transactionsInWeek || []).slice(0, 6).map(t => ({ date: t.date, parsed: t.date ? (() => { try { return parseISO(t.date as string).toISOString(); } catch { return 'invalid' } })() : 'missing', amount: t.amount, type: t.type })));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[week-analytics-debug] debug error', e);
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden">
        <p>Weekly view is not available on smaller devices.</p>
        <p>Please switch to daily or monthly view.</p>
      </div>

      <div className="hidden flex-col sm:flex">
        <div className="flex">
          <div className="flex flex-1 flex-col">
            <WeekViewMultiDayEventsRow selectedDate={selectedDate} multiDayEvents={multiDayEvents} />

            {/* Week header */}
            <div className="relative z-20 flex border-b">
              <div className="w-18"></div>
              <div className="grid flex-1 grid-cols-7 divide-x border-l">
                {weekDays.map((day, index) => (
                  <span key={index} className="py-2 text-center text-xs font-medium text-muted-foreground">
                    {format(day, "EE")} <span className="ml-1 font-semibold text-foreground">{format(day, "d")}</span>
                  </span>
                ))}
              </div>
            </div>

            <ScrollArea className="h-[736px]" type="always">
              <div className="flex overflow-hidden">
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

                {/* Week grid */}
                <div className="relative flex-1 border-l">
                  <div className="grid grid-cols-7 divide-x">
                    {weekDays.map((day, dayIndex) => {
                      const dayEvents = singleDayEvents.filter(event => isSameDay(parseISO(event.startDate), day) || isSameDay(parseISO(event.endDate), day));
                      const groupedEvents = groupEvents(dayEvents);

                      return (
                        <div key={dayIndex} className="relative">
                          {hours.map((hour, index) => {
                            const isDisabled = !isWorkingHour(day, hour, workingHours);

                            return (
                              <div key={hour} className={cn("relative", isDisabled && "bg-calendar-disabled-hour")} style={{ height: "96px" }}>
                                {index !== 0 && <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>}

                                <DroppableTimeBlock date={day} hour={hour} minute={0}>
                                  <AddEventDialog startDate={day} startTime={{ hour, minute: 0 }}>
                                    <div className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                                  </AddEventDialog>
                                </DroppableTimeBlock>

                                <DroppableTimeBlock date={day} hour={hour} minute={15}>
                                  <AddEventDialog startDate={day} startTime={{ hour, minute: 15 }}>
                                    <div className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                                  </AddEventDialog>
                                </DroppableTimeBlock>

                                <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                                <DroppableTimeBlock date={day} hour={hour} minute={30}>
                                  <AddEventDialog startDate={day} startTime={{ hour, minute: 30 }}>
                                    <div className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                                  </AddEventDialog>
                                </DroppableTimeBlock>

                                <DroppableTimeBlock date={day} hour={hour} minute={45}>
                                  <AddEventDialog startDate={day} startTime={{ hour, minute: 45 }}>
                                    <div className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                                  </AddEventDialog>
                                </DroppableTimeBlock>
                              </div>
                            );
                          })}

                          {groupedEvents.map((group, groupIndex) =>
                            group.map(event => {
                              let style = getEventBlockStyle(event, day, groupIndex, groupedEvents.length, { from: earliestEventHour, to: latestEventHour });
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
                      );
                    })}
                  </div>

                  <CalendarTimeline firstVisibleHour={earliestEventHour} lastVisibleHour={latestEventHour} />
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right column: weekly transactions summary */}
          <div className="hidden w-96 flex-col gap-4 border-l p-4 lg:flex">
            <div>
              <h4 className="text-sm font-semibold">Week Analysis</h4>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                <div>Total deposits: <span className="font-bold">${weekAgg.totalDeposits.toFixed(2)}</span></div>
                <div>Total payments: <span className="font-bold">${weekAgg.totalPayments.toFixed(2)}</span></div>
                <div>Transactions: <span className="font-bold">{weekAgg.count}</span></div>
                <div>Average: <span className="font-bold">${weekAgg.avg.toFixed(2)}</span></div>

                {weekAgg.topMerchants && weekAgg.topMerchants.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-xs font-medium text-muted-foreground">Top merchants</h5>
                    <div className="mt-2 flex flex-col gap-2">
                      {weekAgg.topMerchants.map(m => (
                        <div key={m.name} className="flex items-center justify-between rounded-md border p-2">
                          <div className="text-sm">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.count} • ${m.total.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
