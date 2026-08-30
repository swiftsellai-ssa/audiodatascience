import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

function getBrowserSupabase() {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  return createBrowserClient(env.url, env.anonKey);
}

let cachedUserId: string | null | undefined;

export async function getCurrentUserId(): Promise<string | null> {
  if (cachedUserId !== undefined) {
    return cachedUserId;
  }

  const supabase = getBrowserSupabase();
  if (!supabase) {
    cachedUserId = null;
    return null;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    cachedUserId = user?.id ?? null;
    return cachedUserId;
  } catch {
    cachedUserId = null;
    return null;
  }
}

export async function fetchLastPosition(subchapterId: string): Promise<number> {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    return 0;
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return 0;
    }

    const { data, error } = await supabase
      .from("user_progress")
      .select("last_position_seconds")
      .eq("user_id", userId)
      .eq("subchapter_id", subchapterId)
      .maybeSingle();

    if (error || !data) {
      return 0;
    }

    return Math.max(0, data.last_position_seconds ?? 0);
  } catch {
    return 0;
  }
}

export async function saveProgress(
  subchapterId: string,
  lastPositionSeconds: number,
  isCompleted?: boolean,
): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    return;
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return;
    }

    const payload: {
      user_id: string;
      subchapter_id: string;
      last_position_seconds: number;
      is_completed?: boolean;
    } = {
      user_id: userId,
      subchapter_id: subchapterId,
      last_position_seconds: Math.max(0, Math.floor(lastPositionSeconds)),
    };

    if (isCompleted) {
      payload.is_completed = true;
    }

    await supabase.from("user_progress").upsert(payload, {
      onConflict: "user_id,subchapter_id",
    });
  } catch {
    // Persistently failing saves should not interrupt playback.
  }
}
