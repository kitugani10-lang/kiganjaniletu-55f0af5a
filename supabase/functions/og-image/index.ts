import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const postId = url.searchParams.get("postId");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Default site-level OG values
  let title = "Kanisa Kiganjani - SDA Community for Spiritual growth, Youth and Learning";
  let description = "Kanisa Kiganjani is an online Seventh-day Adventist community platform where believers, youth, and church members share posts, discuss faith, learn courses, and connect digitally.";
  let imageUrl = "";

  // Get stats for default image
  const { count: postsCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (postId) {
    const { data: post } = await supabase
      .from("posts")
      .select("title, content, image_urls, author:profiles!posts_author_id_fkey(username)")
      .eq("id", postId)
      .single();

    if (post) {
      title = `${post.title} - Kanisa Kiganjani`;
      description = post.content.substring(0, 155) + (post.content.length > 155 ? "..." : "");
      if (post.image_urls && post.image_urls.length > 0) {
        imageUrl = post.image_urls[0];
      }
    }
  }

  // Generate a simple SVG-based OG image
  const statsText = postsCount ? `${postsCount}+ posts shared` : "Join our community";
  
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a365d;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#2d3748;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <text x="600" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="white">Kanisa Kiganjani</text>
    <text x="600" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#cbd5e0">SDA Community for Spiritual Growth</text>
    <text x="600" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#a0aec0">${statsText}</text>
    <rect x="450" y="460" width="300" height="50" rx="25" fill="#3182ce"/>
    <text x="600" y="492" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white">Join Community</text>
  </svg>`;

  // If requesting image directly, return the SVG
  const accept = req.headers.get("accept") || "";
  if (accept.includes("image") || url.pathname.endsWith("/og-image")) {
    return new Response(svg, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // Return HTML with OG tags for crawlers
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
  <meta property="og:type" content="website" />
  ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
</head>
<body></body>
</html>`;

  return new Response(html, {
    headers: { ...corsHeaders, "Content-Type": "text/html", "Cache-Control": "public, max-age=3600" },
  });
});
