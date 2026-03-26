"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "@/components/language-provider";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-card/40 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/30">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 opacity-60" />
          <span className="font-heading text-sm tracking-[0.18em] text-muted-foreground">
            {t("dashboard.brand")}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 bg-gradient-to-b from-muted/15 to-transparent p-4 md:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
