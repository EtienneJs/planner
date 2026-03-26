"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeAuthLinks() {
  const { status } = useSession();
  const { t } = useLanguage();

  if (status === "authenticated") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
          {t("home.goToDashboard")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
        {t("home.signIn")}
      </Link>
      <Link
        href="/register"
        className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
      >
        {t("home.createAccount")}
      </Link>
    </div>
  );
}
