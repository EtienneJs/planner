"use client";

import Link from "next/link";

import { useTranslation } from "@/components/language-provider";

type Props = { messageKey: "login.backHome" | "register.backHome" };

export function BackToHomeLink({ messageKey }: Props) {
  const { t } = useTranslation();
  return (
    <p className="text-center text-sm text-muted-foreground">
      <Link
        href="/"
        className="underline underline-offset-4 hover:text-foreground"
      >
        {t(messageKey)}
      </Link>
    </p>
  );
}
