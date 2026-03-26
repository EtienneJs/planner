"use client";

import { EventsCalendarShell } from "@/components/dashboard/events/events-calendar-shell";
import { useLanguage } from "@/components/language-provider";

export function EventsPageContent() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("events.pageTitle")}
        </h1>
        <p className="text-muted-foreground">{t("events.pageIntro")}</p>
      </div>
      <EventsCalendarShell />
    </div>
  );
}
