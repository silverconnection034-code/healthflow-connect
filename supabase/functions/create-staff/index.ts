import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the caller is authenticated and is hospital_admin or super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with caller's JWT to verify identity
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) throw new Error("Unauthorized");

    // Check caller role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .maybeSingle();

    if (!callerRole || !["hospital_admin", "super_admin"].includes(callerRole.role)) {
      throw new Error("Only admins can create staff");
    }

    // Get caller's hospital
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("hospital_id")
      .eq("user_id", caller.id)
      .maybeSingle();

    const hospitalId = callerProfile?.hospital_id;
    if (!hospitalId && callerRole.role !== "super_admin") {
      throw new Error("No hospital associated with admin");
    }

    const { email, password, full_name, phone, role } = await req.json();

    if (!email || !password || !full_name || !role) {
      throw new Error("Missing required fields");
    }

    // Create user via admin API (does NOT affect caller's session)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) throw createError;

    // Update profile with hospital_id
    await adminClient
      .from("profiles")
      .update({ hospital_id: hospitalId, full_name, phone: phone || null })
      .eq("user_id", newUser.user.id);

    // Assign role
    await adminClient
      .from("user_roles")
      .insert({ user_id: newUser.user.id, hospital_id: hospitalId, role });

    return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
