"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { IEvent } from "@/calendar/interfaces";

export function useAddEvent() {
  const { setLocalEvents } = useCalendar();

  const addEvent = async (event: IEvent) => {
    const res = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (!res.ok) throw new Error("Failed to add event");

    const created = await res.json();
    setLocalEvents(prev => [...prev, created]);
    return created;
  };

  return { addEvent };
}
