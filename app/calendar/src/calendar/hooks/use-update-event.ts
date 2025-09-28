import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { IEvent } from "@/calendar/interfaces";

export function useUpdateEvent() {
  const { setLocalEvents } = useCalendar();

  // This is just and example, in a real scenario
  // you would call an API to update the event
  const updateEvent = async (event: IEvent) => {
    const newEvent: IEvent = { ...event };

    newEvent.startDate = new Date(event.startDate).toISOString();
    newEvent.endDate = new Date(event.endDate).toISOString();

    const res = await fetch("/api/calendar/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });

    if (!res.ok) throw new Error("Failed to update event");

    const updated = await res.json();

    setLocalEvents(prev => {
      const index = prev.findIndex(e => e.id === updated.id);
      if (index === -1) return prev;
      return [...prev.slice(0, index), updated, ...prev.slice(index + 1)];
    });
  };

  return { updateEvent };
}
