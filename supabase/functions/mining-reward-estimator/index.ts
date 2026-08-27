import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "https://neocity-miner.vercel.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("SERVER_NOT_CONFIGURED");

    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return new Response(JSON.stringify({ error:"UNAUTHORIZED" }), { status:401, headers:{...corsHeaders,"Content-Type":"application/json"} });

    const admin = createClient(url, serviceKey, { auth:{ autoRefreshToken:false, persistSession:false } });
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error:"UNAUTHORIZED" }), { status:401, headers:{...corsHeaders,"Content-Type":"application/json"} });

    const body = await req.json().catch(() => ({}));
    const hashrate = Number(body.hashrate ?? 0);
    const activeHours = Number(body.active_hours ?? 24);
    if (!Number.isFinite(hashrate) || hashrate <= 0 || hashrate > 100000) throw new Error("HASHRATE_INVALID");
    if (!Number.isFinite(activeHours) || activeHours <= 0 || activeHours > 24) throw new Error("ACTIVE_HOURS_INVALID");

    const { data, error } = await admin.rpc("estimate_mining_reward_v1_1", {
      p_user_id: user.id,
      p_hashrate: hashrate,
      p_active_hours: activeHours
    });
    if (error) throw error;

    return new Response(JSON.stringify(data), { status:200, headers:{...corsHeaders,"Content-Type":"application/json"} });
  } catch (e) {
    return new Response(JSON.stringify({ error:e instanceof Error ? e.message : "ESTIMATOR_FAILED" }), { status:400, headers:{...corsHeaders,"Content-Type":"application/json"} });
  }
});
