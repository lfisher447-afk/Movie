import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "movie";
  const tmdbId = searchParams.get("id");

  if (!tmdbId) return NextResponse.json({ error: "Missing Media Nexus ID" }, { status: 400 });

  const sources =[
    { name: "NEXUS-01 (Direct/Fast)", url: `https://vidsrc.to/embed/${type}/${tmdbId}`, quality: "4K HDR" },
    { name: "NEXUS-02 (Vip/Auto)", url: `https://vidsrc.vip/embed/${type}/${tmdbId}`, quality: "1080P" },
    { name: "NEXUS-03 (AutoEmbed)", url: `https://autoembed.to/${type}/tmdb/${tmdbId}`, quality: "1080P" },
    { name: "NEXUS-04 (VidLink)", url: `https://vidlink.pro/${type}/${tmdbId}`, quality: "1080P" }
  ];

  return NextResponse.json(
    { success: true, mediaId: tmdbId, sources: sources, secureConnection: true, timestamp: Date.now() },
    { headers: { "Cache-Control": "public, s-maxage=86400" } }
  );
}
