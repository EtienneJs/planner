import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist_Mono, Nunito } from "next/font/google";
import { Providers } from "@/components/providers";
import type { Locale } from "@/components/language-provider";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Planner",
  description: "Plan events, products, and purchases",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("planner-locale")?.value;
  const initialLocale: Locale | undefined =
    raw === "es" || raw === "en" ? raw : undefined;

  return (
    <html lang={initialLocale ?? "en"} suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
