import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const allowedOrigins = new Set([
  "https://portal.prayerhour.online",
  "https://portal-oomh.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function headers(origin: string | null) {
  const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : "https://portal.prayerhour.online";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

function json(body: Record<string, unknown>, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(origin) });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Submission service is not configured" }, 500, origin);
  }

  const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await authClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Invalid upload session" }, 401, origin);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400, origin);
  }

  const refCode = text(payload.refCode, 32).toUpperCase();
  const required = ["entryType", "leadName", "phone", "email", "school", "location", "form", "ageGroup"];
  if (!/^OOH-[A-Z0-9]{7}$/.test(refCode) || required.some((key) => !text(payload[key], 500))) {
    return json({ error: "Required submission details are missing" }, 400, origin);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await serviceClient.from("submissions").insert({
    ref_code: refCode,
    user_id: userData.user.id,
    entry_type: text(payload.entryType, 100),
    lead_name: text(payload.leadName, 200),
    phone: text(payload.phone, 80),
    email: text(payload.email, 320),
    school: text(payload.school, 300),
    location: text(payload.location, 200),
    form: text(payload.form, 200),
    other_names: text(payload.otherNames, 500) || null,
    age_group: text(payload.ageGroup, 50),
    guardian_name: text(payload.guardianName, 200) || null,
    guardian_phone: text(payload.guardianPhone, 80) || null,
    video_path: text(payload.videoPath, 500) || null,
    video_link: text(payload.videoLink, 1000) || null,
    file_name: text(payload.fileName, 300) || null,
    file_size_mb: Number.isFinite(Number(payload.fileSizeMB)) ? Number(payload.fileSizeMB) : null,
    duration: text(payload.duration, 30) || null,
  }).select("id").single();

  if (error || !data) {
    console.error("record submission failed", error);
    return json({ error: "Could not save the submission" }, 500, origin);
  }

  return json({ ok: true, id: data.id }, 200, origin);
});
