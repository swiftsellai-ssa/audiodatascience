import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8?target=denonext";

type LessonRecord = {
  id?: string;
  title?: string;
  content_rules?: unknown;
  audio_url?: string | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function getRecord(payload: unknown): LessonRecord | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, unknown>;
  if (body.record && typeof body.record === "object") {
    return body.record as LessonRecord;
  }
  if (typeof body.id === "string") {
    return body as LessonRecord;
  }
  return null;
}

function rulesToText(contentRules: unknown): string {
  if (Array.isArray(contentRules)) {
    return contentRules.filter((item): item is string => typeof item === "string").join(" ");
  }

  if (typeof contentRules === "string") {
    try {
      const parsed = JSON.parse(contentRules);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string").join(" ");
      }
    } catch {
      return contentRules;
    }
  }

  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = await req.json();
    const record = getRecord(payload);

    if (!record?.id || !record.title) {
      return jsonResponse(
        { error: "Payload invalid: lipsește record.id sau record.title." },
        400,
      );
    }

    if (record.audio_url) {
      return jsonResponse({ success: true, skipped: true, url: record.audio_url });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
    const voiceId = Deno.env.get("ELEVENLABS_VOICE_ID") ?? "fCzs1SZmUEkXVZyBAQem";

    if (!elevenLabsKey) {
      return jsonResponse({ error: "ELEVENLABS_API_KEY lipsește din secrets." }, 500);
    }
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Lipsește SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY." }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const scriptText = `Capitolul: ${record.title}. ${rulesToText(record.content_rules)}`.trim();

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify({
          text: scriptText,
          model_id: "eleven_multilingual_v2",
        }),
      },
    );

    if (!elevenResponse.ok) {
      const details = await elevenResponse.text();
      return jsonResponse(
        { error: `ElevenLabs (${elevenResponse.status}): ${details}` },
        500,
      );
    }

    const audioBytes = new Uint8Array(await elevenResponse.arrayBuffer());
    const fileName = `audio_${record.id}_${Date.now()}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from("lessons_audio")
      .upload(fileName, audioBytes, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      return jsonResponse({ error: `Upload Storage: ${uploadError.message}` }, 500);
    }

    const { data: publicUrlData } = supabase.storage
      .from("lessons_audio")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl.replace(/\?$/, "");

    const { error: updateError } = await supabase
      .from("subchapters")
      .update({ audio_url: publicUrl })
      .eq("id", record.id);

    if (updateError) {
      return jsonResponse({ error: `Update subchapters: ${updateError.message}` }, 500);
    }

    return jsonResponse({ success: true, url: publicUrl });
  } catch (error) {
    return jsonResponse({ error: errorMessage(error) }, 500);
  }
});
