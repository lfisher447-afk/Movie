'use client';
import { useEffect, useState } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MovieCardSkeleton } from '@/components/Skeleton';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { ChevronRight } from 'lucide-react';

export default function Home() {
  const[trending, setTrending] = useState<any[]>([]);
  const [netflixScrape, setNetflixScrape] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  
  const { watchlist, history } = useStore();
  const isMounted = useMounted(); // Safe Hydration Integration

  useEffect(() => {
    fetch('/api/tmdb?endpoint=/trending/movie/week').then(r => r.json()).then(d => setTrending(d.results ||[]));
    fetch('/api/tmdb?endpoint=/discover/movie&with_networks=213').then(r => r.json()).then(d => setNetflixScrape(d.results ||[]));
    fetch('/api/tmdb?endpoint=/movie/top_rated').then(r => r.json()).then(d => setTopRated(d.results || []));
  },[]);

  return (
    <div className="bg-surface pb-32">
       <HeroCarousel movies={trending} />

       <div className="max-w-[1800px] mx-auto px-6 md:px-12 -mt-32 relative z-20 space-y-20 flex flex-col">
         {/* Only renders user-specific local storage states once the window object is mounted safely */}
         {isMounted && history.length > 0 && <MovieRow title="Continue Watching" movies={history} isSpecial />}
         {isMounted && watchlist.length > 0 && <MovieRow title="Your Watchlist Vault" movies={watchlist} />}
         
         <MovieRow title="Trending Universally" movies={trending.slice(5)} loading={trending.length === 0} />
         <MovieRow title="Award-Winning Epics" movies={topRated} loading={topRated.length === 0} />
         <MovieRow title="Action Packed" movies={netflixScrape} loading={netflixScrape.length === 0} />
       </div>
    </div>
  );
}

function MovieRow({ title, movies, isSpecial=false, loading=false }: { title: string, movies: any[], isSpecial?: boolean, loading?: boolean }) {
    if (!loading && !movies.length) return null;
    return (
        <div className="w-full relative group/row">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-4xl font-display font-black uppercase flex items-center gap-4 text-white drop-shadow-lg">
                    {isSpecial && <span className="w-2 h-10 bg-brand rounded-full shadow-[0_0_15px_rgba(229,9,20,0.8)] block"></span>}
                    {!isSpecial && <span className="w-2 h-8 bg-gray-600 block rounded-full"></span>}
                    {title}
                </h2>
                <div className="text-brand font-bold text-sm uppercase opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center cursor-pointer">Explore All <ChevronRight className="w-4 h-4"/></div>
            </div>
            <div className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-visible custom-scrollbar pb-10 px-2 scroll-smooth">
                {loading ? Array(10).fill(0).map((_,i) => <MovieCardSkeleton key={i} />) : movies.map(movie => (
                    <div key={movie.id} className="snap-start shrink-0"><MovieCard movie={movie} /></div>
                ))}
            </div>
        </div>
    )
}
