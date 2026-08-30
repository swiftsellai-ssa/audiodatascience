"use client";

import { useEffect, useState } from "react";

export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isIos, setIsIos] = useState(false);
  const [standalone, setStandalone] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean(navigator.standalone));

    setIsIos(ios && localStorage.getItem("ads-ios-tip") !== "1");
    setStandalone(isStandalone);

    function onPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone) {
    return null;
  }

  if (installEvent) {
    return (
      <button
        type="button"
        onClick={async () => {
          await installEvent.prompt();
          setInstallEvent(null);
        }}
        className="fixed right-4 top-4 z-50 rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow-sm lg:hidden"
      >
        Instalează pe telefon
      </button>
    );
  }

  if (isIos) {
    return (
      <p className="fixed bottom-[96px] left-4 right-4 z-50 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm leading-relaxed text-gray-600 shadow-sm lg:hidden">
        Pe iPhone: Share → <strong>Add to Home Screen</strong>, ca să asculți ca pe o aplicație.{" "}
        <button
          type="button"
          className="font-medium text-gray-900"
          onClick={() => {
            localStorage.setItem("ads-ios-tip", "1");
            setIsIos(false);
          }}
        >
          OK
        </button>
      </p>
    );
  }

  return null;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};
