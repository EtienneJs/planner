"use client";

import { useTranslation } from "@/components/language-provider";

type Props = {
  email: string | null | undefined;
  userId: string | null | undefined;
};

export function DashboardOverview({ email, userId }: Props) {
  const { t } = useTranslation();
  const display = email ?? userId ?? "";

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-2xl font-semibold tracking-[0.04em] md:text-3xl">
        {t("dashboard.overviewTitle")}
      </h1>
      <p className="max-w-2xl leading-relaxed text-muted-foreground">
        {t("dashboard.overviewSignedIn")}{" "}
        <span className="font-medium text-foreground">{display}</span>.{" "}
        {t("dashboard.overviewHint")}
      </p>
    </div>
  );
}
