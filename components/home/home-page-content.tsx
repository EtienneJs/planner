"use client";

import { Suspense } from "react";

import { HomeAuthLinks } from "@/components/home-auth-links";
import { PublicThemeCorner } from "@/components/public-theme-corner";
import { useLanguage } from "@/components/language-provider";

export function HomePageContent() {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-12 overflow-hidden bg-gradient-to-b from-background via-muted/40 to-background p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,oklch(0.55_0.06_200/0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,oklch(0.72_0.08_85/0.06),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.35_0.04_260/0.07)_0.5px,transparent_1.5px)] bg-[length:26px_26px] opacity-70 dark:bg-[radial-gradient(circle_at_center,oklch(0.96_0.02_95/0.06)_0.5px,transparent_1.5px)] dark:opacity-100"
      />
      <PublicThemeCorner />
      <div className="relative z-10 flex max-w-lg flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-5">
          <span
            aria-hidden
            className="block h-px w-10 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          />
          <h1 className="font-heading text-4xl font-semibold tracking-[0.04em] text-foreground md:text-5xl">
            {t("home.title")}
          </h1>
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("home.subtitle")}
          </p>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="relative z-10 h-10 w-48 animate-pulse rounded-xl bg-muted/80" />
        }
      >
        <div className="relative z-10">
          <HomeAuthLinks />
        </div>
      </Suspense>
    </div>
  );
}
