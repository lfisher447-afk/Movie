'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star } from 'lucide-react';
import Link from 'next/link';

export function HeroCarousel({ movies }: { movies: any[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((p) => (p + 1) % Math.min(movies.length, 5)), 8000);
    return () => clearInterval(timer);
  }, [movies]);

  if (!movies.length) return <div className="h-[90vh] bg-surface animation-pulse skeleton-bg" />;
  const hero = movies[index];

  return (
    <div className="relative h-[90vh] w-full overflow-hidden group">
      <AnimatePresence mode="popLayout">
        <motion.div key={hero.id} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: 'easeInOut' }} className="absolute inset-0">
            <img src={`https://image.tmdb.org/t/p/original${hero.backdrop_path}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
            
            <div className="absolute top-1/4 left-6 md:left-16 max-w-4xl z-10">
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="bg-brand text-white px-3 py-1 rounded shadow-[0_0_15px_rgba(229,9,20,0.5)] font-bold text-xs tracking-widest uppercase">Omnimux Exclusive</span>
                        <span className="flex items-center gap-1 text-yellow-400 font-bold bg-black/40 backdrop-blur px-3 py-1 rounded text-sm"><Star className="w-4 h-4 fill-current"/> {hero.vote_average.toFixed(1)}</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-display font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-2xl mb-4 leading-none">{hero.title || hero.name}</h1>
                    <p className="text-gray-300 text-lg line-clamp-3 mb-8 max-w-2xl text-shadow font-medium">{hero.overview}</p>
                    
                    <div className="flex gap-4">
                        <Link href={`/movie/${hero.id}`} className="bg-brand hover:scale-105 active:scale-95 transition-all text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[0_10px_30px_rgba(229,9,20,0.4)] text-lg">
                            <Play className="fill-current w-5 h-5"/> Play Now
                        </Link>
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all">
                            <Info className="w-5 h-5"/> Details
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bars */}
      <div className="absolute bottom-32 left-6 md:left-16 flex gap-2 z-20">
          {movies.slice(0,5).map((_, i) => (
             <div key={i} onClick={() => setIndex(i)} className="h-1.5 w-12 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                 <motion.div initial={{ width: 0 }} animate={{ width: i === index ? '100%' : '0%' }} transition={{ duration: i === index ? 8 : 0 }} className="h-full bg-brand" />
             </div>
          ))}
      </div>
    </div>
  );
}
