// middleware.js (Versi Debugging)

export const config = {
  matcher: "/blog/:path*", // Kita fokuskan hanya ke halaman blog untuk sementara
};

export default function middleware(request) {
  const userAgent = request.headers.get("user-agent") || "";

  // Daftar kata kunci bot yang lebih luas untuk memastikan terdeteksi
  const botUserAgents =
    /bot|facebook|embed|got|firefox\/92|firefox\/38|curl|wget|whatsapp|twitter|telegram|discord/i;

  if (botUserAgents.test(userAgent)) {
    // Ini adalah bot, kita alihkan ke Prerender.io
    const prerenderUrl = `https://service.prerender.io/${request.url}`;
    const headers = new Headers(request.headers);
    headers.set("X-Prerender-Token", process.env.PRERENDER_TOKEN);

    // LOG PENTING #1: Jika ini muncul, berarti bot terdeteksi
    console.log(`✅ BOT DETECTED: ${userAgent}`);
    console.log(`➡️  Redirecting to: ${prerenderUrl}`);

    return fetch(prerenderUrl, {
      headers: headers,
      redirect: "manual",
    });
  }

  // LOG PENTING #2: Jika ini yang muncul, berarti pengunjung adalah manusia biasa
  console.log(`👤 USER DETECTED: ${userAgent}`);

  // Jika bukan bot, biarkan Vercel melanjutkan seperti biasa
  return;
}
