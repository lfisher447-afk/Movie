'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Vercel Serverless proxy targeting TMDB
    fetch('/api/tmdb?endpoint=/trending/movie/week').then(r => r.json()).then(d => setTrending(d.results ||[]));
    fetch('/api/tmdb?endpoint=/movie/top_rated').then(r => r.json()).then(d => setTopRated(d.results || []));
  },[]);

  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
        setIndex(prev => (prev + 1) % 5); // Rotate top 5
    }, 7000);
    return () => clearInterval(interval);
  }, [trending]);

  if (trending.length === 0) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand border-t-transparent animate-spin rounded-full"></div></div>;

  const hero = trending[index];

  return (
    <div className="pb-20">
      <AnimatePresence mode="popLayout">
        <motion.div key={hero.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="relative h-[85vh] w-full overflow-hidden">
            <img src={`https://image.tmdb.org/t/p/original${hero.backdrop_path}`} className="w-full h-full object-cover scale-105" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
            
            <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-5xl z-10 pt-20">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-brand text-white px-3 py-1 rounded-sm text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(229,9,20,0.5)]">Trending #1</span>
                        <div className="flex items-center gap-1 text-yellow-500 font-bold bg-white/10 px-3 py-1 rounded-sm backdrop-blur"><Star className="w-4 h-4 fill-current"/> {hero.vote_average.toFixed(1)}</div>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-display font-bold leading-none mb-6 drop-shadow-2xl uppercase tracking-tighter">{hero.title || hero.name}</h1>
                    <p className="text-gray-300 text-base md:text-xl line-clamp-3 mb-10 leading-relaxed max-w-2xl font-medium text-shadow">{hero.overview}</p>
                    
                    <div className="flex flex-wrap gap-4">
                        <Link href={`/movie/${hero.id}`} className="bg-brand hover:bg-white hover:text-brand transition-colors text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-2xl shadow-brand/30 text-lg">
                        <Play className="fill-current w-5 h-5"/> Stream Now
                        </Link>
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-colors text-lg">
                        <Info className="w-5 h-5"/> Details
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
      </AnimatePresence>

      {/* Row Component Mapping */}
      <div className="px-6 md:px-16 -mt-20 relative z-20 space-y-12">
         <MovieRow title="Continuing Watching (Popular)" movies={trending.slice(5)} />
         <MovieRow title="Highest Rated Masterpieces" movies={topRated} />
      </div>
    </div>
  );
}

function MovieRow({ title, movies }: { title: string, movies: any[] }) {
    if(!movies.length) return null;
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><span className="w-1.5 h-6 bg-brand rounded-full block"></span> {title}</h2>
            <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-8 px-2">
                {movies.map(movie => (
                    <Link href={`/movie/${movie.id}`} key={movie.id} className="min-w-[160px] md:min-w-[220px] group relative rounded-xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-300 hover:-translate-y-3 hover:shadow-brand/20">
                        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-500" alt="Poster"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                            <h3 className="font-bold text-white line-clamp-1 mb-1">{movie.title || movie.name}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-brand font-bold text-xs">Watch</span>
                                <span className="flex items-center text-xs text-yellow-500"><Star className="w-3 h-3 fill-current mr-1"/> {movie.vote_average?.toFixed(1)}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
