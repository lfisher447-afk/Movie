import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Edge rendering for zero cold-boot delays

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
  
  const key = process.env.TMDB_API_KEY;
  const tmdbUrl = new URL(`https://api.themoviedb.org/3${endpoint}`);
  
  tmdbUrl.searchParams.set('api_key', key || '');
  tmdbUrl.searchParams.set('language', 'en-US');
  
  // Forward all other params dynamically
  searchParams.forEach((value, k) => {
    if (k !== 'endpoint') tmdbUrl.searchParams.set(k, value);
  });

  try {
    const res = await fetch(tmdbUrl.toString(), { 
        // Cache globally for 1 hour to prevent API rate limits
        next: { revalidate: 3600 } 
    });
    const data = await res.json();
    return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'TMDB Relay Failed' }, { status: 500 });
  }
}
