'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function HeroCarousel({ movies }: { movies: any[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!movies.length) return;
    const timer = setInterval(() => setIndex((p) => (p + 1) % Math.min(movies.length, 5)), 8000);
    return () => clearInterval(timer);
  }, [movies]);

  if (!movies.length) return <div className="h-screen bg-surface nexus-skeleton" />;
  const hero = movies[index];
  const type = hero.media_type === 'tv' || hero.first_air_date ? 'tv' : 'movie';

  return (
    <div className="relative h-[95vh] w-full overflow-hidden group bg-surface">
      <AnimatePresence mode="popLayout">
        <motion.div key={hero.id} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease:[0.16, 1, 0.3, 1] }} className="absolute inset-0">   
            <Image src={`https://image.tmdb.org/t/p/original${hero.backdrop_path}`} fill priority className="object-cover object-top opacity-80" alt={hero.title || hero.name} />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
            <div className="absolute top-[30%] left-6 md:left-12 max-w-5xl z-20">
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8, ease:[0.16, 1, 0.3, 1] }}>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand px-4 py-1.5 rounded-lg shadow-brand-glow font-black text-[10px] tracking-[0.4em] uppercase">
                           <Sparkles className="w-3 h-3"/> TOP SELECTION
                        </span>
                        <span className="text-yellow-500 font-black text-xs tracking-widest">⭐ {hero.vote_average.toFixed(1)}</span>
                    </div>
                    <h1 className="font-nexus text-6xl md:text-[9rem] text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] leading-[0.9] mb-8">{hero.title || hero.name}</h1>
                    <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-10 max-w-3xl font-medium leading-relaxed">{hero.overview}</p>
                    <div className="flex gap-4">
                        <Link href={`/movie/${hero.id}?type=${type}`} className="btn-nexus bg-brand text-white shadow-brand-glow w-[200px]">
                            <Play className="fill-current w-4 h-4"/> INITIATE FEED
                        </Link>
                        <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="btn-nexus bg-white/5 border border-white/10 hover:bg-white/10 w-[200px]">
                            <Info className="w-4 h-4"/> DIAGNOSTICS
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
