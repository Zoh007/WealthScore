import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./../globals.css";

import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ChangeBadgeVariantInput } from "@/calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/calendar/components/change-working-hours-input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { getEvents, getUsers } from "@/calendar/requests";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default async function CalendarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [events, users] = await Promise.all([getEvents(), getUsers()]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarTrigger />

        <CalendarProvider users={users} events={events}>
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
            {children}

            <Accordion type="single" collapsible>
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="flex-none gap-2 py-0 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Settings className="size-4" />
                    <p className="text-base font-semibold">Calendar settings</p>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="mt-4 flex flex-col gap-6">
                    <ChangeBadgeVariantInput />
                    <ChangeVisibleHoursInput />
                    <ChangeWorkingHoursInput />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CalendarProvider>
      </div>
    </SidebarProvider>
  );
}
