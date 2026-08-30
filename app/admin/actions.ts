"use server";

import { redirect } from "next/navigation";
import { isAdminUnlocked, setAdminCookie } from "@/lib/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function unlockAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Parolă greșită." };
  }

  await setAdminCookie();
  redirect("/admin");
}

export async function saveLesson(input: {
  moduleId: string | null;
  moduleTitle: string | null;
  chapterId: string | null;
  chapterTitle: string | null;
  title: string;
  content_rules: string[];
}) {
  if (!(await isAdminUnlocked())) {
    return { error: "Neautorizat." };
  }

  const env = getSupabaseEnv();
  if (!env) {
    return { error: "Lipsește configurația Supabase." };
  }

  const response = await fetch(`${env.url}/functions/v1/create-lesson`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.anonKey}`,
      apikey: env.anonKey,
      "Content-Type": "application/json",
      "x-admin-password": process.env.ADMIN_PASSWORD ?? "",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => ({}))) as {
    id?: string;
    error?: string;
  };

  if (!response.ok || data.error || !data.id) {
    return { error: data.error ?? "Nu am putut salva lecția." };
  }

  return { id: data.id };
}
