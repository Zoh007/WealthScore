import { startOfWeek, addDays, format, parseISO, isSameDay, areIntervalsOverlapping, isWithinInterval } from "date-fns";
import { useEffect, useMemo } from "react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useFinancialData } from "@/hooks/use-financial-data";
import { useGoals, type Goal } from "@/hooks/use-goals";

import { ScrollArea } from "@/components/ui/scroll-area";

import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import { EventBlock } from "@/calendar/components/week-and-day-view/event-block";
import { DroppableTimeBlock } from "@/calendar/components/dnd/droppable-time-block";
import { CalendarTimeline } from "@/calendar/components/week-and-day-view/calendar-time-line";
import { WeekViewMultiDayEventsRow } from "@/calendar/components/week-and-day-view/week-view-multi-day-events-row";

import { cn } from "@/lib/utils";
import { groupEvents, getEventBlockStyle, isWorkingHour, getVisibleHours } from "@/calendar/helpers";
import { groupTransactionsByDate, aggregateTransactions, toDateKey } from "@/calendar/transactions";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarWeekView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, workingHours, visibleHours } = useCalendar();
  const { data: financialData, refreshData } = useFinancialData();
  const { goals } = useGoals();

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

  // Calculate weekly goal progress
  interface WeeklyGoalProgress extends Goal {
    status: 'on-track' | 'needs-attention' | 'at-risk' | 'overdue';
    message: string;
    color: string;
    weeksRemaining: number;
    weeklyAmountNeeded: string;
    currentWeeklySavings: string;
    weeklyProgress: number; // percentage
  }

  const weeklyGoalAnalysis = useMemo((): WeeklyGoalProgress[] | null => {
    if (!goals.length) return null;

    const netWeeklySavings = weekAgg.totalDeposits - weekAgg.totalPayments;
    
    return goals.map((goal): WeeklyGoalProgress => {
      const targetDate = new Date(goal.targetDate);
      const weekStartDate = startOfWeek(selectedDate);
      
      // Calculate weeks remaining to target date
      const weeksRemaining = Math.max(0, 
        Math.ceil((targetDate.getTime() - weekStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      );
      
      if (weeksRemaining === 0) {
        return {
          ...goal,
          status: 'overdue',
          message: 'Goal deadline has passed',
          color: 'text-red-600',
          weeksRemaining,
          weeklyAmountNeeded: '0',
          currentWeeklySavings: netWeeklySavings.toFixed(0),
          weeklyProgress: 0
        };
      }
      
      const weeklyAmountNeeded = goal.amount / weeksRemaining;
      const weeklyProgress = weeklyAmountNeeded > 0 ? Math.min(100, Math.max(0, (netWeeklySavings / weeklyAmountNeeded) * 100)) : 0;
      
      let status: 'on-track' | 'needs-attention' | 'at-risk';
      let message: string;
      let color: string;
      
      if (netWeeklySavings <= 0) {
        status = 'at-risk';
        message = `This week: spending exceeded income. Need $${weeklyAmountNeeded.toFixed(0)}/week`;
        color = 'text-red-600';
      } else if (netWeeklySavings >= weeklyAmountNeeded) {
        status = 'on-track';
        message = `Great week! Saved $${netWeeklySavings.toFixed(0)} vs $${weeklyAmountNeeded.toFixed(0)} needed`;
        color = 'text-green-600';
      } else if (netWeeklySavings >= weeklyAmountNeeded * 0.7) {
        status = 'needs-attention';
        message = `Good progress, but $${(weeklyAmountNeeded - netWeeklySavings).toFixed(0)} short this week`;
        color = 'text-yellow-600';
      } else {
        status = 'at-risk';
        message = `Behind by $${(weeklyAmountNeeded - netWeeklySavings).toFixed(0)} this week`;
        color = 'text-red-600';
      }
      
      return {
        ...goal,
        status,
        message,
        color,
        weeksRemaining,
        weeklyAmountNeeded: weeklyAmountNeeded.toFixed(0),
        currentWeeklySavings: netWeeklySavings.toFixed(0),
        weeklyProgress
      };
    });
  }, [goals, weekAgg, selectedDate]);

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
                {weekDays.map((day, index) => {
                  const dayKey = toDateKey(day);
                  const dayTransactions = groupTransactionsByDate(allTx as any)[dayKey] || [];
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <span className="py-1 text-center text-xs font-medium text-muted-foreground">
                        {format(day, "EE")} <span className="ml-1 font-semibold text-foreground">{format(day, "d")}</span>
                      </span>
                      {dayTransactions.length > 0 && (
                        <div className="flex items-center gap-1 mb-1">
                          {dayTransactions.some(t => t.type === "deposit") && 
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Deposits" />}
                          {dayTransactions.some(t => t.type === "purchase" || t.type === "bill") && 
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500" title="Payments" />}
                          <span className="text-xs text-muted-foreground">{dayTransactions.length}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                <div className="font-medium text-muted-foreground">Deposits</div>
                <div className="pl-2">
                  <div>Total: <span className="font-bold text-green-600">${weekAgg.totalDeposits.toFixed(2)}</span></div>
                  <div>Count: <span className="font-bold">{weekAgg.depositCount}</span></div>
                  {weekAgg.depositCount > 0 && (
                    <div>Avg per deposit: <span className="font-bold text-green-600">${weekAgg.avgDeposit.toFixed(2)}</span></div>
                  )}
                </div>
                
                <div className="font-medium text-muted-foreground mt-2">Payments</div>
                <div className="pl-2">
                  <div>Total: <span className="font-bold text-red-600">${weekAgg.totalPayments.toFixed(2)}</span></div>
                  <div>Count: <span className="font-bold">{weekAgg.paymentCount}</span></div>
                  {weekAgg.paymentCount > 0 && (
                    <div>Avg per payment: <span className="font-bold text-red-600">${weekAgg.avgPayment.toFixed(2)}</span></div>
                  )}
                </div>
                
                <div className="font-medium text-muted-foreground mt-2">Summary</div>
                <div className="pl-2">
                  <div>Total transactions: <span className="font-bold">{weekAgg.count}</span></div>
                  <div>Net average: <span className={`font-bold ${weekAgg.netAvgPerTransaction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${weekAgg.netAvgPerTransaction.toFixed(2)}
                  </span></div>
                </div>

                {weekAgg.topMerchants && weekAgg.topMerchants.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-xs font-medium text-muted-foreground">Top merchants</h5>
                    <div className="mt-2 flex flex-col gap-2">
                      {weekAgg.topMerchants.map(m => (
                        <div key={m.name} className="flex items-center justify-between rounded-md border p-2">
                          <div className="text-sm">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.count} • ${Math.abs(m.total).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Weekly Goal Progress Analysis */}
                {weeklyGoalAnalysis && weeklyGoalAnalysis.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <h5 className="text-xs font-medium text-muted-foreground mb-3">Weekly Goal Progress</h5>
                    <div className="space-y-3">
                      {weeklyGoalAnalysis.map((goalProgress) => (
                        <div key={goalProgress.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium text-sm">{goalProgress.name}</h6>
                            <div className="text-xs text-gray-500">
                              {goalProgress.weeksRemaining} weeks left
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-2">
                            Target: ${goalProgress.amount.toLocaleString()} by {new Date(goalProgress.targetDate).toLocaleDateString()}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs mb-2">
                            <div>
                              Need: <span className="font-semibold">${goalProgress.weeklyAmountNeeded}/week</span>
                            </div>
                            <div>
                              This week: <span className="font-semibold">${goalProgress.currentWeeklySavings}</span>
                            </div>
                          </div>
                          
                          <div className={`text-xs font-medium mb-2 ${goalProgress.color}`}>
                            {goalProgress.message}
                          </div>
                          
                          {/* Weekly Progress Bar */}
                          <div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  goalProgress.status === 'on-track' ? 'bg-green-500' :
                                  goalProgress.status === 'needs-attention' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(100, goalProgress.weeklyProgress)}%` 
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0%</span>
                              <span>{goalProgress.weeklyProgress.toFixed(0)}%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {goals.length === 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="text-center py-3 text-gray-500 text-xs">
                      <p>No financial goals set.</p>
                      <p className="mt-1">Visit Planning to create goals and track weekly progress.</p>
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
