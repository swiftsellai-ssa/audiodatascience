"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { PlayerProvider } from "@/components/player-provider";
import { AudioPlayer } from "@/components/audio-player";
import type { ModuleWithChildren } from "@/lib/types";

type AppShellProps = {
  curriculum: ModuleWithChildren[];
  completedIds: string[];
  error: string | null;
  children: ReactNode;
};

export function AppShell({ curriculum, completedIds, error, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <PlayerProvider curriculum={curriculum} initialCompletedIds={completedIds}>
      <div className="flex h-dvh flex-col bg-gray-50 text-gray-900">
        <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-1.5 text-gray-700 hover:bg-gray-50"
            aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold tracking-tight">Audio Data Science</span>
        </header>

        <div className="relative flex min-h-0 flex-1">
          {mobileOpen ? (
            <button
              type="button"
              className="absolute inset-0 z-20 bg-black/20 lg:hidden"
              aria-label="Închide meniul"
              onClick={() => setMobileOpen(false)}
            />
          ) : null}

          <aside
            className={`absolute inset-y-0 left-0 z-30 w-80 overflow-y-auto border-r border-gray-100 bg-white transition-transform lg:static lg:translate-x-0 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <Sidebar
              curriculum={curriculum}
              error={error}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>

        <AudioPlayer />
      </div>
    </PlayerProvider>
  );
}
