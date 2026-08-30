import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type InsertPayload = {
  record?: {
    id?: string;
    title?: string;
    content_rules?: unknown;
    audio_url?: string | null;
  };
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function asRuleList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as InsertPayload;
    const record = payload.record;

    if (!record?.id || !record.title) {
      return jsonResponse(
        { error: "Payload invalid: lipsește payload.record.id sau payload.record.title." },
        400,
      );
    }

    if (record.audio_url) {
      return jsonResponse({ success: true, skipped: true, url: record.audio_url });
    }

    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const voiceId = Deno.env.get("ELEVENLABS_VOICE_ID") ?? "Rachel";

    if (!elevenLabsKey) {
      return jsonResponse({ error: "ELEVENLABS_API_KEY lipsește din secrets." }, 500);
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        { error: "SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY lipsește din environment." },
        500,
      );
    }

    const scriptText = `Lecția de astăzi: ${record.title}. ${asRuleList(record.content_rules).join(" ")}`.trim();

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

    const audioBuffer = await elevenResponse.arrayBuffer();
    const fileName = `audio_${record.id}_${Date.now()}.mp3`;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error: uploadError } = await supabase.storage
      .from("lessons_audio")
      .upload(fileName, audioBuffer, { contentType: "audio/mpeg", upsert: true });

    if (uploadError) {
      return jsonResponse({ error: `Upload Storage: ${uploadError.message}` }, 500);
    }

    const { data: publicUrlData } = supabase.storage
      .from("lessons_audio")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("subchapters")
      .update({ audio_url: publicUrl })
      .eq("id", record.id);

    if (updateError) {
      return jsonResponse({ error: `Update subchapters: ${updateError.message}` }, 500);
    }

    return jsonResponse({ success: true, url: publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Eroare necunoscută.";
    return jsonResponse({ error: message }, 500);
  }
});
