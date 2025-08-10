export default async function handler(req, res) {
  const { slug } = req.query || {};
  const ua = String(req.headers["user-agent"] || "").toLowerCase();
  const isBot =
    /(facebookexternalhit|whatsapp|twitterbot|bot|crawler|spider)/i.test(ua);

  if (!slug) return res.status(400).send("Bad request");

  try {
    // Fetch post dari Supabase REST API
    const url = `${
      process.env.VITE_SUPABASE_URL
    }/rest/v1/posts?select=title,cover_image_url,slug&slug=eq.${encodeURIComponent(
      slug
    )}&is_published=eq.true`;
    const r = await fetch(url, {
      headers: {
        apikey: process.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    const [post] = await r.json();
    if (!post)
      return isBot ? res.status(404).send("Not found") : res.redirect(302, "/");

    const site = "https://deniirahman.my.id";
    const postUrl = `${site}/blog/${post.slug}`;
    const title = post.title || "Blog";
    const desc = `Baca artikel "${post.title}" di deniirahman.my.id`;
    const image = post.cover_image_url || `${site}/og-default.png`;

    if (!isBot) {
      // User biasa → redirect ke SPA
      return res.redirect(302, `/?post=${encodeURIComponent(post.slug)}`);
    }

    // Bot → render HTML dengan meta tag OG
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<link rel="canonical" href="${postUrl}">
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${postUrl}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${image}">
</head>
<body>Loading...</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
}

function esc(s = "") {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}
