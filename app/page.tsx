'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, BookmarkPlus } from 'lucide-react';
import Link from 'next/link';
import { MovieCard } from '@/components/MovieCard';
import { useStore } from '@/store/useStore';

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [action, setAction] = useState<any[]>([]);
  const[index, setIndex] = useState(0);
  const { watchlist } = useStore();

  useEffect(() => {
    fetch('/api/tmdb?endpoint=/trending/movie/week').then(r => r.json()).then(d => setTrending(d.results ||[]));
    fetch('/api/tmdb?endpoint=/discover/movie&with_genres=28').then(r => r.json()).then(d => setAction(d.results || []));
  },[]);

  useEffect(() => {
    if (trending.length === 0) return;
    const i = setInterval(() => setIndex(p => (p + 1) % 5), 8000);
    return () => clearInterval(i);
  }, [trending]);

  if (!trending.length) return <div className="h-screen grid flex items-center justify-center"><div className="w-16 h-16 border-4 border-brand border-t-transparent animate-spin rounded-full"></div></div>;

  const hero = trending[index];

  return (
    <div className="pb-24">
      <AnimatePresence mode="popLayout">
        <motion.div key={hero.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="relative h-[90vh] w-full overflow-hidden">
            <img src={`https://image.tmdb.org/t/p/original${hero.backdrop_path}`} className="w-full h-full object-cover scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
            
            <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-6xl z-10 pt-24">
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="bg-brand text-white px-4 py-1.5 rounded-md text-xs font-black tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(229,9,20,0.4)]">Top Pick</span>
                        <div className="flex items-center gap-2 text-yellow-400 font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10"><Star className="w-4 h-4 fill-current"/> {(hero.vote_average || 0).toFixed(1)} Rating</div>
                    </div>
                    <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-display font-black leading-[0.85] mb-6 drop-shadow-2xl uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">{hero.title || hero.name}</h1>
                    <p className="text-gray-300 text-lg md:text-xl line-clamp-3 mb-10 leading-relaxed max-w-2xl font-medium text-shadow">{hero.overview}</p>
                    
                    <div className="flex items-center flex-wrap gap-5">
                        <Link href={`/movie/${hero.id}`} className="bg-brand hover:scale-105 active:scale-95 transition-all text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 shadow-[0_0_40px_rgba(229,9,20,0.5)] text-lg">
                            <Play className="fill-current w-6 h-6"/> Watch Now
                        </Link>
                        <button className="bg-white/10 hover:bg-white/25 active:scale-95 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all text-lg">
                            <Info className="w-6 h-6"/> More Info
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
      </AnimatePresence>

      <div className="px-6 md:px-16 -mt-32 relative z-20 space-y-14 flex flex-col">
         {watchlist.length > 0 && <MovieRow title="Your Watchlist" movies={watchlist} />}
         <MovieRow title="Trending This Week" movies={trending.slice(5)} />
         <MovieRow title="Action Blockbusters" movies={action} />
      </div>
    </div>
  );
}

function MovieRow({ title, movies }: { title: string, movies: any[] }) {
    if(!movies.length) return null;
    return (
        <div className="w-full group/row">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-white">
                <span className="w-1.5 h-8 bg-brand rounded-full block shadow-[0_0_10px_rgba(229,9,20,0.8)]"></span> {title}
            </h2>
            <div className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-visible scrollbar-hide pb-8 px-2 snap-x">
                {movies.map(movie => (
                    <div className="snap-start" key={movie.id}><MovieCard movie={movie} /></div>
                ))}
            </div>
        </div>
    )
}
