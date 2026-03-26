"use client";

import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

/** Esquina fija para páginas públicas (home, login, register). */
export function PublicThemeCorner() {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex justify-end">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-border/60 bg-card/80 p-1 shadow-sm backdrop-blur-md dark:bg-card/70">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}
