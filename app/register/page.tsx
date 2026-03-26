import { BackToHomeLink } from "@/components/back-to-home-link";
import { RegisterForm } from "@/components/auth/register-form";
import { PublicThemeCorner } from "@/components/public-theme-corner";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-gradient-to-b from-background via-muted/35 to-background p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_50%_at_50%_-25%,oklch(0.5_0.06_200/0.07),transparent_55%)] dark:bg-[radial-gradient(ellipse_85%_50%_at_50%_-25%,oklch(0.72_0.08_85/0.05),transparent_55%)]"
      />
      <PublicThemeCorner />
      <div className="relative z-10 w-full max-w-md">
        <RegisterForm />
      </div>
      <div className="relative z-10">
        <BackToHomeLink messageKey="register.backHome" />
      </div>
    </div>
  );
}
