import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateLessonBody = {
  moduleId?: string | null;
  moduleTitle?: string | null;
  chapterId?: string | null;
  chapterTitle?: string | null;
  title?: string;
  content_rules?: unknown;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function asRuleList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function nextSequence(
  supabase: ReturnType<typeof createClient>,
  table: "modules" | "chapters" | "subchapters",
  parentColumn?: "module_id" | "chapter_id",
  parentId?: string,
) {
  let query = supabase.from(table).select("sequence_order").order("sequence_order", {
    ascending: false,
  }).limit(1);

  if (parentColumn && parentId) {
    query = query.eq(parentColumn, parentId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data?.[0]?.sequence_order ?? 0) + 1;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as CreateLessonBody;
    const title = body.title?.trim() ?? "";
    const rules = asRuleList(body.content_rules);

    if (!title) {
      return jsonResponse({ error: "Titlul lecției este obligatoriu." }, 400);
    }

    if (rules.length === 0) {
      return jsonResponse({ error: "Adaugă cel puțin o regulă." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Lipsește SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY." }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let moduleId = body.moduleId?.trim() || "";
    let chapterId = body.chapterId?.trim() || "";

    if (!moduleId) {
      const moduleTitle = body.moduleTitle?.trim() ?? "";
      if (!moduleTitle) {
        return jsonResponse({ error: "Alege un modul sau scrie un modul nou." }, 400);
      }

      const sequence_order = await nextSequence(supabase, "modules");
      const { data, error } = await supabase
        .from("modules")
        .insert({ title: moduleTitle, sequence_order })
        .select("id")
        .single();

      if (error || !data) {
        throw error ?? new Error("Modulul nu a putut fi creat.");
      }

      moduleId = data.id;
    }

    if (!chapterId) {
      const chapterTitle = body.chapterTitle?.trim() ?? "";
      if (!chapterTitle) {
        return jsonResponse({ error: "Alege un capitol sau scrie un capitol nou." }, 400);
      }

      const sequence_order = await nextSequence(supabase, "chapters", "module_id", moduleId);
      const { data, error } = await supabase
        .from("chapters")
        .insert({ module_id: moduleId, title: chapterTitle, sequence_order })
        .select("id")
        .single();

      if (error || !data) {
        throw error ?? new Error("Capitolul nu a putut fi creat.");
      }

      chapterId = data.id;
    }

    const sequence_order = await nextSequence(supabase, "subchapters", "chapter_id", chapterId);
    const { data, error } = await supabase
      .from("subchapters")
      .insert({
        chapter_id: chapterId,
        title,
        content_rules: rules,
        sequence_order,
      })
      .select("id, title")
      .single();

    if (error || !data) {
      throw error ?? new Error("Lecția nu a putut fi salvată.");
    }

    return jsonResponse({ success: true, id: data.id, title: data.title });
  } catch (error) {
    return jsonResponse({ error: errorMessage(error) }, 500);
  }
});
