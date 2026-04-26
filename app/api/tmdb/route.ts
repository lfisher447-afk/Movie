import { NextResponse } from 'next/server';

// Backend Proxy for TMDB (Hides API Key from Client)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');
  if (!endpoint) return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
  
  const key = process.env.TMDB_API_KEY;
  
  // Construct URL dynamically passing all extra params
  const tmdbUrl = new URL(`https://api.themoviedb.org/3${endpoint}`);
  tmdbUrl.searchParams.set('api_key', key || '');
  tmdbUrl.searchParams.set('language', 'en-US');
  
  searchParams.forEach((value, k) => {
    if (k !== 'endpoint') tmdbUrl.searchParams.set(k, value);
  });

  try {
    const res = await fetch(tmdbUrl.toString(), { next: { revalidate: 3600 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'TMDB Fetch failed' }, { status: 500 });
  }
}
