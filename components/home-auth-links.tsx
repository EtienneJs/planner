"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeAuthLinks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
        Sign in
      </Link>
      <Link
        href="/register"
        className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
      >
        Create account
      </Link>
    </div>
  );
}
