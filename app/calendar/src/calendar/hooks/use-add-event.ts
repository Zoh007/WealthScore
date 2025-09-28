"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { IEvent } from "@/calendar/interfaces";

export function useAddEvent() {
  const { setLocalEvents } = useCalendar();

  const addEvent = async (event: IEvent) => {
    console.log("useAddEvent: Attempting to add event:", event);
    
    try {
      const newEvent = {
        ...event,
        id: event.id || Date.now(), // Ensure we have a unique ID
      };
      
      console.log("useAddEvent: Adding event to local state:", newEvent);
      setLocalEvents(prev => {
        const updated = [...prev, newEvent];
        console.log("useAddEvent: Updated events list:", updated);
        return updated;
      });
      
      console.log("useAddEvent: Event added successfully");
      return newEvent;
    } catch (error) {
      console.error("useAddEvent: Failed to add event:", error);
      throw error;
    }
  };

  return { addEvent };
}
