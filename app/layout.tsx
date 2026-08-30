import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
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
      </body>
    </html>
  );
}
