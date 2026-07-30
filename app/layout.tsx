import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { getAppUrl } from "@/lib/utilities/app-url";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Forge interviews you, designs your system, creates the application, and helps you launch it. AI software engineering for every business.";

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "Forge — Describe your business. Forge builds the software.",
    template: "%s · Forge",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Forge",
    title: "Forge — Describe your business. Forge builds the software.",
    description,
  },
  twitter: {
    card: "summary",
    title: "Forge — Describe your business. Forge builds the software.",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html>
    // before hydration, which React would otherwise report as a mismatch.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
