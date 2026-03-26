"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/validations/auth";
import { useTranslation } from "@/components/language-provider";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApiErrorBody = {
  message?: string;
  details?: unknown;
};

export function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("register.invalidData"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = (await res.json()) as ApiErrorBody;

      if (!res.ok) {
        setError(body.message ?? t("register.failed"));
        return;
      }

      router.push("/login?registered=1");
      router.refresh();
    } catch {
      setError(t("register.genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border/60 bg-card/95 shadow-lg shadow-primary/[0.04] backdrop-blur-sm dark:shadow-primary/[0.08]">
      <CardHeader className="space-y-1.5 pb-2">
        <CardTitle className="font-heading text-2xl tracking-[0.03em]">
          {t("register.title")}
        </CardTitle>
        <CardDescription>{t("register.description")}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          {error ? (
            <p
              className="text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="register-email">{t("register.email")}</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="register-password">{t("register.password")}</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              {t("register.passwordHint")}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto">
            {loading ? t("register.creating") : t("register.submit")}
          </Button>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "inline-flex w-full justify-center sm:w-auto"
            )}
          >
            {t("register.alreadyHaveAccount")}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
