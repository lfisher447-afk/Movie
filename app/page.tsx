'use client';
import { useEffect, useState } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MovieCardSkeleton } from '@/components/Skeleton';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, TrendingUp, Bookmark, Globe, Film, Flame, Award, Zap, Play, Eye, BarChart2, RefreshCw } from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';
import { fetcher } from '@/lib/utils';
// ... MOODS AND SPOTLIGHT_GENRES remain the same as previous file ...

function LiveStatsTicker() {
  const stats =[
    { label: 'NETWORK_PING', value: '12ms', icon: <Zap className="w-3 h-3" /> },
    { label: 'ACTIVE_NODES', value: 'SIMULATED', icon: <Globe className="w-3 h-3" /> },
    { label: 'WATCH_PARTIES', value: 'GLOBAL', icon: <Eye className="w-3 h-3" /> },
    { label: 'VAULTS_SECURED', value: 'ENCRYPTED', icon: <Bookmark className="w-3 h-3" /> },
    { label: 'TITLES_INDEXED', value: '850K+', icon: <Film className="w-3 h-3" /> },
    { label: 'STREAM_STATUS', value: 'NOMINAL', icon: <Play className="w-3 h-3" /> },
  ];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-black/40 backdrop-blur-xl py-3 mb-12">
      <div className="flex gap-16 animate-[ticker_25s_linear_infinite] whitespace-nowrap">
        {[...stats, ...stats, ...stats].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[9px] font-black tracking-[0.25em] text-gray-500 shrink-0">
            <span className="text-brand">{s.icon}</span><span>{s.label}</span><span className="text-white ml-1">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContinueWatchingRow({ movies }: { movies: any[] }) {
  return (
    <div className="mb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-3xl font-display font-black uppercase text-white drop-shadow-lg tracking-wider flex items-center gap-3">
            <span className="w-1.5 h-10 bg-brand rounded-full shadow-[0_0_15px_rgba(229,9,20,0.8)] block" /> CONTINUE WATCHING
        </h2>
      </div>
      <div className="flex gap-4 md:gap-6 overflow-x-auto custom-scrollbar pb-4 scroll-smooth">
        {movies.map((movie, i) => (
          <motion.div key={movie.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="snap-start shrink-0 relative group/item">
            <MovieCard movie={movie} />
            <div className="absolute bottom-[88px] left-0 right-0 px-1">
              <div className="h-1 bg-black/60 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${movie.watchProgress || 0}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Ensure MovieRow correctly routes "Vault" exploration to Profile instead to avoid Dead 404 Routes.
function MovieRow({ title, movies, loading = false, icon, exploreHref, delay = 0 }: any) {
  if (!loading && !movies.length) return null;
  return (
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay }} viewport={{ once:true }} className="w-full relative group/row mb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-3xl font-display font-black uppercase flex items-center gap-3 text-white drop-shadow-lg tracking-wider">
           {icon && <span className="opacity-80">{icon}</span>} {title}
        </h2>
        {exploreHref && (
          <Link href={exploreHref} className="text-brand font-black text-[10px] uppercase opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 tracking-[0.2em]">
            EXPLORE ALL <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      <div className="flex gap-4 md:gap-5 overflow-x-auto custom-scrollbar pb-10 px-2 scroll-smooth snap-x">
          {loading ? Array(10).fill(0).map((_, i) => <MovieCardSkeleton key={i} />) : movies.map((movie: any, i: number) => (
              <motion.div key={movie.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }} viewport={{ once: true }} className="snap-start shrink-0">
                <MovieCard movie={movie} />
              </motion.div>
            ))}
      </div>
    </motion.section>
  );
}

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const[netflixScrape, setNetflixScrape] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any[]>([]);
  const [tvTrending, setTvTrending] = useState<any[]>([]);

  const { watchlist, history } = useStore();
  const isMounted = useMounted();

  useEffect(() => {
    const load = async () => {
      const [t, n, tr, np, tv] = await Promise.all([
        fetcher('/api/tmdb?endpoint=/trending/movie/week'),
        fetcher('/api/tmdb?endpoint=/discover/movie&with_watch_providers=8&watch_region=US'),
        fetcher('/api/tmdb?endpoint=/movie/top_rated'),
        fetcher('/api/tmdb?endpoint=/movie/now_playing'),
        fetcher('/api/tmdb?endpoint=/trending/tv/week'),
      ]);
      setTrending(t.results || []); setNetflixScrape(n.results ||[]); setTopRated(tr.results || []); setNowPlaying(np.results || []); setTvTrending(tv.results ||[]);
    };
    load();
  },[]);

  return (
    <div className="bg-surface pb-32 overflow-hidden">
      <HeroCarousel movies={trending} />
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 -mt-32 relative z-20 flex flex-col">
        <LiveStatsTicker />
        {isMounted && history.length > 0 && <ContinueWatchingRow movies={history} />}
        {isMounted && watchlist.length > 0 && <MovieRow title="YOUR WATCHLIST VAULT" movies={watchlist} icon={<Bookmark className="w-5 h-5 text-brand" />} exploreHref="/profile" />}
        <MovieRow title="TRENDING UNIVERSALLY" movies={trending.slice(5)} loading={trending.length === 0} icon={<TrendingUp className="w-5 h-5 text-brand" />} exploreHref="/discover" delay={0.05} />
        <MovieRow title="TELEVISION NETWORK" movies={tvTrending.map(m => ({...m, media_type: 'tv'}))} loading={tvTrending.length === 0} icon={<Globe className="w-5 h-5 text-brand" />} delay={0.05} />
        <MovieRow title="HIGH-OCTANE FACTION (NETFLIX)" movies={netflixScrape} loading={netflixScrape.length === 0} icon={<Zap className="w-5 h-5 text-brand" />} delay={0.05} />
      </div>
    </div>
  );
}
