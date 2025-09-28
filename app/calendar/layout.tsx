import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./../globals.css";

import { CalendarProvider } from "@/calendar/contexts/calendar-context";

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
          </div>
        </CalendarProvider>
      </div>
    </SidebarProvider>
  );
}
