"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { IEvent } from "@/calendar/interfaces";

export function useAddEvent() {
  const { setLocalEvents } = useCalendar();

  const addEvent = async (event: IEvent) => {
    // For demo purposes, we'll add the event locally
    // In a real app, this would make an API call
    try {
      const newEvent = {
        ...event,
        id: Date.now(), // Ensure we have a unique ID
      };
      
      setLocalEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      console.error("Failed to add event:", error);
      throw new Error("Failed to add event");
    }
  };

  return { addEvent };
}
