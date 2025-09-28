import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ClientContainer } from "@/calendar/components/client-container";
import { ChangeBadgeVariantInput } from "@/calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/calendar/components/change-working-hours-input";
import { getEvents, getUsers } from "@/calendar/requests";

export default async function Page() {
  const [events, users] = await Promise.all([getEvents(), getUsers()]);

  return (
    <CalendarProvider users={users} events={events}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
        <ClientContainer view="month" />

        <div className="mt-4 flex flex-col gap-6">
          <ChangeBadgeVariantInput />
          <ChangeVisibleHoursInput />
          <ChangeWorkingHoursInput />
        </div>
      </div>
    </CalendarProvider>
  );
}
