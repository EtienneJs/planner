"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validations/auth";
import { useLanguage } from "@/components/language-provider";

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

export function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const rawCallback = searchParams.get("callbackUrl");
  const safeCallback =
    rawCallback &&
    rawCallback.startsWith("/") &&
    !rawCallback.startsWith("//")
      ? rawCallback
      : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("login.invalidData"));
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setError(t("login.invalidCredentials"));
      return;
    }

    router.push(safeCallback);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border/60 bg-card/95 shadow-lg shadow-primary/[0.04] backdrop-blur-sm dark:shadow-primary/[0.08]">
      <CardHeader className="space-y-1.5 pb-2">
        <CardTitle className="font-heading text-2xl tracking-[0.03em]">
          {t("login.title")}
        </CardTitle>
        <CardDescription>{t("login.description")}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          {justRegistered ? (
            <p className="text-sm text-muted-foreground" role="status">
              {t("login.registeredHint")}
            </p>
          ) : null}
          {error ? (
            <p
              className="text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="login-email">{t("login.email")}</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="login-password">{t("login.password")}</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto">
            {loading ? t("login.signingIn") : t("login.submit")}
          </Button>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "inline-flex w-full justify-center sm:w-auto"
            )}
          >
            {t("login.createAccountLink")}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
