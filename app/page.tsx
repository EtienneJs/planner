import { HomeAuthLinks } from "@/components/home-auth-links";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/30 p-6">
      <div className="flex max-w-lg flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Planner
        </h1>
        <p className="text-muted-foreground">
          Sign in to manage your events, products, and purchases.
        </p>
      </div>
      <HomeAuthLinks />
    </div>
  );
}
