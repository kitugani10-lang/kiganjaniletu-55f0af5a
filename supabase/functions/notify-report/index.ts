import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId, postId, commentId, reason, reporterUsername, contentUrl } = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get admin emails
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(JSON.stringify({ error: "No admins found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminIds = adminRoles.map((r) => r.user_id);

    // Get admin emails from auth
    const adminEmails: string[] = [];
    for (const id of adminIds) {
      const { data } = await supabase.auth.admin.getUserById(id);
      if (data?.user?.email) {
        adminEmails.push(data.user.email);
      }
    }

    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ error: "No admin emails found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = commentId ? "comment" : "post";
    const subject = `⚠️ New Report: ${contentType} reported on Kanisa Kiganjani`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #c53030;">⚠️ Content Reported</h2>
        <p>A ${contentType} has been reported by <strong>${reporterUsername || "a user"}</strong>.</p>
        <div style="background: #f7fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Content Type:</strong> ${contentType}</p>
          ${postId ? `<p><strong>Post ID:</strong> ${postId}</p>` : ""}
          ${commentId ? `<p><strong>Comment ID:</strong> ${commentId}</p>` : ""}
        </div>
        ${contentUrl ? `<p><a href="${contentUrl}" style="color: #3182ce; text-decoration: underline;">View the reported content →</a></p>` : ""}
        <p style="color: #718096; font-size: 14px; margin-top: 24px;">
          Please review this report in the Moderation panel.
        </p>
      </div>
    `;

    // Send to all admins
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Kanisa Kiganjani <onboarding@resend.dev>",
        to: adminEmails,
        subject,
        html,
      }),
    });

    const resData = await res.json();

    return new Response(JSON.stringify({ success: true, data: resData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
