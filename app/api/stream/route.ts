import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "movie";
  const tmdbId = searchParams.get("id");

  if (!tmdbId)
    return NextResponse.json(
      { error: "Missing Media Nexus ID" },
      { status: 400 }
    );

  // 20+ Ultra-resilient multi-node infrastructure
  const sources = [
    {
      name: "NEXUS-01 (Direct/Fast)",
      url: `https://vidsrc.to/embed/${type}/${tmdbId}`,
      quality: "4K HDR",
    },
    {
      name: "NEXUS-02 (Vip/Auto)",
      url: `https://vidsrc.vip/embed/${type}/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-03 (Pro/Auto)",
      url: `https://vidsrc.pro/embed/${type}/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-04 (Me/Beta)",
      url: `https://vidsrc.me/embed/${type}?tmdb=${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-05 (Net/Stable)",
      url: `https://vidsrc.net/embed/${type}/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-06 (In/Backup)",
      url: `https://vidsrc.in/embed/${type}/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-07 (Pm/Alt)",
      url: `https://vidsrc.pm/embed/${type}/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-08 (Xyz/Alt)",
      url: `https://vidsrc.xyz/embed/${type}/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-09 (Icu/Alt)",
      url: `https://vidsrc.icu/embed/${type}/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-10 (VidLink/Direct)",
      url: `https://vidlink.pro/${type}/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-11 (Smashy/HQ)",
      url: `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-12 (Multi/Fallback)",
      url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
      quality: "720P",
    },
    {
      name: "NEXUS-13 (AutoEmbed/Fast)",
      url: `https://autoembed.to/${type}/tmdb/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-14 (2Embed/Classic)",
      url: `https://www.2embed.cc/embed/${tmdbId}`,
      quality: "720P",
    },
    {
      name: "NEXUS-15 (SuperEmbed/Auto)",
      url: `https://superembed.stream/${type}?tmdb=${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-16 (MoviesAPI/Alt)",
      url: `https://moviesapi.club/${type}/${tmdbId}`,
      quality: "720P",
    },
    {
      name: "NEXUS-17 (BlackVid/Direct)",
      url: `https://blackvid.space/embed?tmdb=${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-18 (Nonton/Indo)",
      url: `https://nonton.pw/embed/${type}/${tmdbId}`,
      quality: "720P",
    },
    {
      name: "NEXUS-19 (Gdrive/Raw)",
      url: `https://databasegdriveplayer.co/player.php?tmdb=${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-20 (VidCloud/Fast)",
      url: `https://vidcloud.ru/embed/${type}/${tmdbId}`,
      quality: "720P",
    },
    {
      name: "NEXUS-21 (FlixHQ/HQ)",
      url: `https://flixhq.to/embed/${type}/${tmdbId}`,
      quality: "1080P",
    },
    {
      name: "NEXUS-22 (EmbedSe/Backup)",
      url: `https://embedse.com/${type}/${tmdbId}`,
      quality: "720P",
    },
  ];

  return NextResponse.json(
    {
      success: true,
      mediaId: tmdbId,
      sources: sources,
      encrypted: true,
      timestamp: Date.now(),
    },
    {
      headers: { "Cache-Control": "public, s-maxage=86400" }, // Cache streams for 24 hrs
    }
  );
}
