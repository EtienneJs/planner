"use client";

import dynamic from "next/dynamic";

const EventsCalendar = dynamic(
  () =>
    import("./events-calendar").then((m) => m.EventsCalendar),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[560px] items-center justify-center rounded-xl border bg-muted/30 text-sm text-muted-foreground">
        Loading calendar…
      </div>
    ),
  }
);

export function EventsCalendarShell() {
  return <EventsCalendar />;
}
