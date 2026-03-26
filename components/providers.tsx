"use client";

import { SessionProvider } from "next-auth/react";
import {
  LanguageProvider,
  type Locale,
} from "@/components/language-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale | null;
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LanguageProvider initialLocale={initialLocale}>
          <TooltipProvider>{children}</TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
