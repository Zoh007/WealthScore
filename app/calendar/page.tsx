import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ClientContainer } from "@/calendar/components/client-container";
import { getEvents, getUsers } from "@/calendar/requests";

export default async function Page() {
  const [events, users] = await Promise.all([getEvents(), getUsers()]);

  return (
    <CalendarProvider users={users} events={events}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
        <ClientContainer view="month" />
      </div>
    </CalendarProvider>
  );
}
