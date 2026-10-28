import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const bucket = "challenge-videos";
const allowedOrigins = new Set([
  "https://portal.prayerhour.online",
  "https://portal-oomh.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function headers(origin: string | null) {
  const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : "https://portal-oomh.vercel.app";
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
    return json({ error: "Upload service is not configured" }, 500, origin);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Invalid upload session" }, 401, origin);

  let payload: { refCode?: unknown; fileName?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400, origin);
  }

  const refCode = typeof payload.refCode === "string" ? payload.refCode.trim().toUpperCase() : "";
  const fileName = typeof payload.fileName === "string" ? payload.fileName.trim() : "";
  if (!/^OOH-[A-Z0-9]{7}$/.test(refCode)) return json({ error: "Invalid reference code" }, 400, origin);
  if (!fileName || fileName.length > 180 || fileName.includes("\\") || fileName.includes("/")) {
    return json({ error: "Invalid file name" }, 400, origin);
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const extension = safeName.slice(safeName.lastIndexOf(".")).toLowerCase();
  if (![".mp4", ".mov", ".m4v", ".webm"].includes(extension)) {
    return json({ error: "Unsupported video type" }, 400, origin);
  }

  const path = `entries/${userData.user.id}/${refCode}-${crypto.randomUUID()}-${safeName}`;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await adminClient.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data?.path || !data.token) {
    console.error("createSignedUploadUrl failed", error);
    return json({ error: "Could not create upload URL" }, 500, origin);
  }

  return json({ path: data.path, token: data.token }, 200, origin);
});
