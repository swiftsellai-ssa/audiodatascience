import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { PwaRegister } from "@/components/pwa-register";
import { getCompletedSubchapterIds, getCurriculum } from "@/lib/curriculum";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audio Data Science",
  description: "Curriculă tehnică audio: module, capitole și reguli esențiale.",
  applicationName: "Audio Data Science",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lecții",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f9fafb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [{ data, error }, completedIds] = await Promise.all([
    getCurriculum(),
    getCompletedSubchapterIds(),
  ]);

  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <AppShell
          curriculum={data}
          completedIds={[...completedIds]}
          error={error}
        >
          {children}
        </AppShell>
        <PwaRegister />
      </body>
    </html>
  );
}
