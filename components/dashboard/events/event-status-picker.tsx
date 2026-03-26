"use client";

import { ChevronDown } from "lucide-react";

import type { EventStatus } from "@/lib/types/event";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type EventStatusPickerProps = {
  id?: string;
  value: EventStatus;
  onChange: (value: EventStatus) => void;
  disabled?: boolean;
};

export function EventStatusPicker({
  id,
  value,
  onChange,
  disabled,
}: EventStatusPickerProps) {
  const { t } = useLanguage();

  function labelFor(s: EventStatus): string {
    switch (s) {
      case "NOT_COMPLETED":
        return t("events.statusNotCompleted");
      case "COMPLETED":
        return t("events.statusCompleted");
      default:
        return t("events.statusPending");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <button
            type="button"
            id={id}
            className={cn(
              "flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input px-2.5 py-1 text-left text-sm text-foreground",
              "bg-background outline-none transition-colors",
              "dark:border-border/90 dark:bg-card",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "dark:focus-visible:ring-ring/40",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          />
        }
      >
        <span className="min-w-0 flex-1 truncate">{labelFor(value)}</span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground opacity-80"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-[100] min-w-[var(--anchor-width)]"
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v) => onChange(v as EventStatus)}
        >
          <DropdownMenuRadioItem value="PENDING">
            {t("events.statusPending")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="NOT_COMPLETED">
            {t("events.statusNotCompleted")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="COMPLETED">
            {t("events.statusCompleted")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
