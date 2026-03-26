"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import allLocales from "@fullcalendar/core/locales-all";

import type { CalendarEvent, EventStatus } from "@/lib/types/event";
import { useTranslation } from "@/components/language-provider";
import { EventStatusPicker } from "@/components/dashboard/events/event-status-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ApiEnvelope<T> = { message: string; data?: T; details?: unknown };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseDatetimeLocal(s: string): Date {
  return new Date(s);
}

function fcStatusClass(s: EventStatus): string {
  switch (s) {
    case "NOT_COMPLETED":
      return "fc-event-status-not-completed";
    case "COMPLETED":
      return "fc-event-status-completed";
    default:
      return "fc-event-status-pending";
  }
}

function coerceEventStatus(raw: unknown): EventStatus {
  if (raw === "NOT_COMPLETED" || raw === "COMPLETED" || raw === "PENDING") {
    return raw;
  }
  return "PENDING";
}

function mapToFcEvents(rows: CalendarEvent[]): EventInput[] {
  return rows.map((e) => {
    const st = e.status ?? "PENDING";
    return {
      id: e.id,
      title: e.title,
      start: e.startTime,
      end: e.endTime,
      classNames: [fcStatusClass(st)],
      extendedProps: {
        description: e.description,
        status: st,
      },
    };
  });
}

/** Tiempo restante hasta el fin: "2 h 3 m 10 s" (o "0 h 0 m 0 s" si ya terminó). */
function formatRemainingUntilEnd(remainingMs: number): string {
  if (remainingMs <= 0) return "0 h 0 m 0 s";
  const totalSec = Math.floor(remainingMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h} h ${m} m ${s} s`;
}

export function EventsCalendar() {
  const { t, locale } = useTranslation();
  const [fcEvents, setFcEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<EventStatus>("PENDING");
  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const renderEventContent = useCallback(
    (arg: EventContentArg) => {
      const title = arg.event.title ?? "";
      const end = arg.event.end;
      if (!end) {
        return (
          <div className="fc-custom-event flex min-w-0 items-center gap-1 overflow-hidden">
            <span className="fc-event-title truncate">{title}</span>
          </div>
        );
      }
      const countdown = formatRemainingUntilEnd(end.getTime() - nowTick);
      return (
        <div className="fc-custom-event flex min-w-0 items-baseline gap-1.5 overflow-hidden px-0.5 py-px sm:gap-2">
          <span className="fc-event-title min-w-0 flex-1 truncate">{title}</span>
          <span className="shrink-0 whitespace-nowrap font-mono text-[0.65rem] leading-tight opacity-90 tabular-nums sm:text-xs">
            {countdown}
          </span>
        </div>
      );
    },
    [nowTick]
  );

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const json = (await parseJson(res)) as ApiEnvelope<CalendarEvent[]>;
      if (!res.ok) {
        setError(json.message ?? t("events.loadFailed"));
        setFcEvents([]);
        return;
      }
      const rows = Array.isArray(json.data) ? json.data : [];
      setFcEvents(mapToFcEvents(rows));
    } catch {
      setError(t("events.loadFailed"));
      setFcEvents([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const calendarPlugins = useMemo(
    () => [
      dayGridPlugin,
      timeGridPlugin,
      multiMonthPlugin,
      interactionPlugin,
      listPlugin,
    ],
    []
  );

  function openCreateFromSelect(arg: DateSelectArg) {
    setEditing(null);
    setTitle("");
    setDescription("");
    setStatus("PENDING");
    setStartStr(toDatetimeLocalValue(arg.start));
    setEndStr(toDatetimeLocalValue(arg.end));
    setFormError(null);
    setDialogOpen(true);
    arg.view.calendar.unselect();
  }

  function openEditFromEvent(ev: CalendarEvent) {
    setEditing(ev);
    setTitle(ev.title);
    setDescription(ev.description);
    setStatus(ev.status ?? "PENDING");
    setStartStr(toDatetimeLocalValue(new Date(ev.startTime)));
    setEndStr(toDatetimeLocalValue(new Date(ev.endTime)));
    setFormError(null);
    setDialogOpen(true);
  }

  const handleEventClick = useCallback((info: EventClickArg) => {
    info.jsEvent.preventDefault();
    if (!info.event.id) return;
    const ext = info.event.extendedProps as {
      description?: string;
      status?: unknown;
    };
    const start = info.event.start;
    const end = info.event.end ?? start;
    if (!start) return;
    openEditFromEvent({
      id: String(info.event.id),
      title: info.event.title ?? "",
      description: ext.description ?? "",
      status: coerceEventStatus(ext.status),
      startTime: start instanceof Date ? start.toISOString() : String(start),
      endTime: end instanceof Date ? end.toISOString() : String(start),
      userId: "",
    });
  }, []);

  async function handleSave() {
    setFormError(null);
    const trimmedTitle = title.trim();
    const d = description.trim();
    if (!trimmedTitle) {
      setFormError(t("events.errTitleRequired"));
      return;
    }
    if (!d) {
      setFormError(t("events.errDescriptionRequired"));
      return;
    }
    const start = parseDatetimeLocal(startStr);
    const end = parseDatetimeLocal(endStr);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setFormError(t("events.errInvalidRange"));
      return;
    }
    if (end <= start) {
      setFormError(t("events.errEndAfterStart"));
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/events/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedTitle,
            description: d,
            status,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          }),
        });
        const json = (await parseJson(res)) as ApiEnvelope<CalendarEvent>;
        if (!res.ok) {
          setFormError(json.message ?? t("events.updateFailed"));
          return;
        }
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedTitle,
            description: d,
            status,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          }),
        });
        const json = (await parseJson(res)) as ApiEnvelope<CalendarEvent>;
        if (!res.ok) {
          setFormError(json.message ?? t("events.createFailed"));
          return;
        }
      }
      setDialogOpen(false);
      await load();
    } catch {
      setFormError(t("events.genericError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = (await parseJson(res)) as ApiEnvelope<unknown>;
        setError(json.message ?? t("events.deleteFailed"));
        return;
      }
      setDeleteTarget(null);
      setDialogOpen(false);
      await load();
    } catch {
      setError(t("events.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="fc-theme-standard min-h-[560px] rounded-xl border bg-card p-2 md:p-4">
        {loading ? (
          <div className="flex h-[560px] items-center justify-center text-sm text-muted-foreground">
            {t("events.loadingCalendar")}
          </div>
        ) : (
          <FullCalendar
            locales={allLocales}
            locale={locale === "es" ? "es" : "en"}
            plugins={calendarPlugins}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "multiMonthYear,dayGridMonth,timeGridWeek,listYear",
            }}
            height="auto"
            contentHeight={520}
            editable={false}
            selectable
            selectMirror
            dayMaxEvents
            weekends
            events={fcEvents}
            displayEventTime={false}
            eventContent={renderEventContent}
            select={openCreateFromSelect}
            eventClick={handleEventClick}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            nowIndicator
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("events.editEvent") : t("events.newEvent")}
            </DialogTitle>
            <DialogDescription>{t("events.dialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="ev-title">{t("events.labelTitle")}</Label>
              <Input
                id="ev-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ev-desc">{t("events.labelDescription")}</Label>
              <Textarea
                id="ev-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ev-status">{t("events.labelStatus")}</Label>
              <EventStatusPicker
                id="ev-status"
                value={status}
                onChange={setStatus}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ev-start">{t("events.labelStart")}</Label>
              <Input
                id="ev-start"
                type="datetime-local"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ev-end">{t("events.labelEnd")}</Label>
              <Input
                id="ev-end"
                type="datetime-local"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            {editing ? (
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:mr-auto sm:w-auto"
                onClick={() => {
                  setDeleteTarget(editing);
                }}
              >
                {t("events.delete")}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("events.cancel")}
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving
                  ? t("events.saving")
                  : editing
                    ? t("events.save")
                    : t("events.create")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("events.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? t("events.deleteDescription", { title: deleteTarget.title })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("events.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              {deleting ? t("events.deleting") : t("events.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
