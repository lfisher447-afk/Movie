'use client';

// app/page.tsx — OMNIMUX HOME · v7.0 (THE ULTIMATE SINGULARITY EDITION)
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  ChevronRight, ChevronLeft, TrendingUp, Bookmark, Globe, 
  Film, Flame, Award, Zap, Play, Eye, BarChart2, RefreshCw, 
  Sparkles, Clock, Search, Activity, ShieldCheck, Heart
} from 'lucide-react';

// External & Internal Hooks/Components
import { MovieCard } from '@/components/MovieCard';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MovieCardSkeleton } from '@/components/Skeleton';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { fetcher } from '@/lib/utils';

// ─── TYPES & INTERFACES ───────────────────────────────────────────────────────
interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  popularity?: number; // Fixed: Made optional for MediaItem compatibility
  overview?: string;   // Fixed: Made optional for MediaItem compatibility
  media_type?: 'movie' | 'tv';
  watchProgress?: number;
}

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
  delay?: number;
  exploreHref?: string;
}

// ─── CONSTANTS & REGISTRIES ───────────────────────────────────────────────────
const ALL_GENRES = [
  { id: 28, name: 'Action', icon: '⚡', color: 'from-red-600 to-orange-600' },
  { id: 12, name: 'Adventure', icon: '🗺️', color: 'from-emerald-500 to-teal-700' },
  { id: 16, name: 'Animation', icon: '🎨', color: 'from-pink-400 to-purple-600' },
  { id: 35, name: 'Comedy', icon: '😂', color: 'from-yellow-400 to-orange-500' },
  { id: 80, name: 'Crime', icon: '🕵️', color: 'from-slate-700 to-black' },
  { id: 99, name: 'Docu', icon: '🎥', color: 'from-blue-900 to-indigo-900' },
  { id: 18, name: 'Drama', icon: '🎭', color: 'from-rose-700 to-rose-950' },
  { id: 10751, name: 'Family', icon: '👨‍👩‍👧', color: 'from-green-400 to-blue-500' },
  { id: 14, name: 'Fantasy', icon: '🔮', color: 'from-violet-600 to-fuchsia-600' },
  { id: 36, name: 'History', icon: '📜', color: 'from-amber-800 to-yellow-900' },
  { id: 27, name: 'Horror', icon: '💀', color: 'from-purple-900 to-black' },
  { id: 10402, name: 'Music', icon: '🎵', color: 'from-cyan-400 to-blue-600' },
  { id: 9648, name: 'Mystery', icon: '🔍', color: 'from-indigo-800 to-gray-900' },
  { id: 10749, name: 'Romance', icon: '💖', color: 'from-pink-500 to-red-500' },
  { id: 878, name: 'Sci-Fi', icon: '🛸', color: 'from-blue-600 to-cyan-400' },
  { id: 10770, name: 'TV Movie', icon: '📺', color: 'from-gray-500 to-slate-700' },
  { id: 53, name: 'Thriller', icon: '🔪', color: 'from-red-900 to-black' },
  { id: 10752, name: 'War', icon: '⚔️', color: 'from-olive-700 to-stone-900' },
  { id: 37, name: 'Western', icon: '🤠', color: 'from-orange-800 to-amber-900' },
];

const MOODS = [
  { label: 'HYPED', emoji: '🔥', genre: '28', color: '#E50914' },
  { label: 'CEREBRAL', emoji: '🧠', genre: '878', color: '#00D1FF' },
  { label: 'MELANCHOLY', emoji: '🌧️', genre: '18', color: '#FF007A' },
  { label: 'TERRIFIED', emoji: '👁️', genre: '27', color: '#A000FF' },
  { label: 'LAUGHING', emoji: '😂', genre: '35', color: '#FFB800' },
];

// ─── FLOATING UI OVERLAYS ─────────────────────────────────────────────────────

function NeuralSearchBar() {
  return (
    <div className="fixed top-6 right-12 z-[100] hidden lg:block">
      <div className="relative group">
        <div className="absolute inset-0 bg-brand/20 blur-xl group-hover:bg-brand/40 transition-all rounded-full" />
        <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full flex items-center px-6 py-3 gap-4 cursor-text hover:border-brand/50 transition-all shadow-2xl">
          <Search className="w-4 h-4 text-brand" />
          <input 
            type="text" 
            placeholder="NEURAL SEARCH..." 
            className="bg-transparent border-none outline-none text-[10px] font-black tracking-widest text-white w-48 placeholder:text-gray-600 focus:w-64 transition-all"
          />
          <div className="flex gap-1">
            <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400">⌘</span>
            <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400">K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveStatsTicker() {
  const stats = useMemo(() => [
    { label: 'NODE_STATUS', value: 'OPTIMAL', icon: <Activity className="w-3 h-3" /> },
    { label: 'ENCRYPTION', value: 'AES-256', icon: <ShieldCheck className="w-3 h-3" /> },
    { label: 'BITRATE', value: '84MBPS', icon: <Zap className="w-3 h-3" /> },
    { label: 'USERS_LIVE', value: '184.2K', icon: <Eye className="w-3 h-3" /> },
    { label: 'TITLES_INDEXED', value: '850K+', icon: <Film className="w-3 h-3" /> },
    { label: 'CROWD_VIBE', value: '98% POSITIVE', icon: <Heart className="w-3 h-3" /> },
  ], []);

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-black/40 backdrop-blur-3xl py-4 mb-20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <div className="flex gap-20 animate-[ticker_40s_linear_infinite] whitespace-nowrap">
        {[...stats, ...stats, ...stats, ...stats].map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-[10px] font-black tracking-[0.3em] text-gray-500 shrink-0">
            <span className="text-brand animate-pulse drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]">{s.icon}</span>
            <span>{s.label}</span>
            <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] ml-1">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CORE LAYOUT COMPONENTS ───────────────────────────────────────────────────

function SectionWrapper({ title, icon, children, accent = false, delay = 0, exploreHref }: SectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, delay, ease: [0.19, 1, 0.22, 1] }}
      className="w-full relative mb-28 group/row"
    >
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 px-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             <span className="text-brand text-[10px] font-black tracking-[0.5em] opacity-80 flex items-center gap-2">
               <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
               OMNIMUX_UPLINK
             </span>
             <div className="h-[1px] w-12 bg-brand/30" />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase flex items-center gap-4 text-white tracking-tighter drop-shadow-xl">
            {accent && <div className="w-1.5 h-12 bg-brand rounded-full shadow-[0_0_20px_#E50914]" />}
            {!accent && icon && <span className="opacity-80 p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">{icon}</span>}
            {title}
          </h2>
        </div>
        {exploreHref && (
          <Link href={exploreHref} className="opacity-0 group-hover/row:opacity-100 transition-all duration-300 translate-x-4 group-hover/row:translate-x-0 text-brand hover:text-white text-[10px] font-black tracking-[0.3em] flex items-center gap-2 hover:drop-shadow-[0_0_10px_rgba(229,9,20,0.8)] pb-2">
            EXPLORE_ALL <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

// ─── FEATURED MODULES ─────────────────────────────────────────────────────────

function FullGenreNexus() {
  return (
    <SectionWrapper title="NEURAL_NEXUS" icon={<Sparkles className="w-6 h-6 text-brand" />} delay={0.1}>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-3">
        {ALL_GENRES.map((g, i) => (
          <Link href={`/discover?genre=${g.id}`} key={g.id}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: 20 }} 
              whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 100 }} 
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -6, zIndex: 10 }}
              className={`relative h-28 rounded-2xl bg-gradient-to-br ${g.color} p-[1px] group overflow-hidden shadow-2xl`}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors duration-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_50%)] transition-opacity duration-500" />
              <div className="relative h-full w-full bg-black/30 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
                <span className="text-3xl relative z-10 drop-shadow-md group-hover:scale-125 transition-transform duration-500">{g.icon}</span>
                <span className="text-[9px] font-black tracking-[0.25em] text-white/90 relative z-10 drop-shadow-md">{g.name.toUpperCase()}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}

function BoxOfficeLeaderboard() {
  const { data } = useSWR('/api/tmdb?endpoint=/movie/now_playing', fetcher);
  const movies: Movie[] = data?.results?.slice(0, 6) || [];

  return (
    <SectionWrapper title="MOMENTUM_LEADERBOARD" icon={<Award className="w-6 h-6 text-brand" />} delay={0.15}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {movies.map((m, i) => (
          <Link href={`/movie/${m.id}`} key={m.id}>
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="group relative bg-black/40 border border-white/5 backdrop-blur-xl rounded-3xl p-6 flex items-center gap-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer shadow-xl overflow-hidden"
            >
              {/* Giant Background Number */}
              <span className="font-display text-8xl text-white/5 group-hover:text-brand/10 transition-colors absolute right-4 -bottom-4 italic select-none pointer-events-none">
                #{i+1}
              </span>
              
              <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} className="w-16 h-24 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] z-10 group-hover:scale-105 transition-transform" alt={m.title} />
              
              <div className="flex-1 z-10 min-w-0">
                <h4 className="text-white font-black text-lg md:text-xl mb-1 truncate group-hover:text-brand transition-colors drop-shadow-md">{m.title}</h4>
                <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-gray-400 mt-2">
                  <span className="bg-white/5 px-2 py-1 rounded-md border border-white/10">⭐ {m.vote_average?.toFixed(1)}</span>
                  <span>{m.release_date?.split('-')[0]}</span>
                </div>
                <div className="w-full max-w-[200px] h-1.5 bg-black/50 rounded-full mt-4 overflow-hidden border border-white/5">
                  <motion.div 
                     initial={{ width: 0 }}
                     // Fixed: Added fallbacks (|| 0 and || 1) to prevent TypeScript errors since popularity is optional
                     whileInView={{ width: `${((m.popularity || 0) / (movies[0]?.popularity || 1)) * 100}%` }}
                     transition={{ delay: 0.4 + i * 0.1, duration: 1, ease: "easeOut" }}
                     className="h-full bg-gradient-to-r from-brand to-orange-500 shadow-[0_0_10px_rgba(229,9,20,0.8)]"
                  />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}

function MoodEngine() {
  const [active, setActive] = useState<typeof MOODS[0] | null>(null);
  const { data, isLoading } = useSWR(active ? `/api/tmdb?endpoint=/discover/movie&with_genres=${active.genre}&sort_by=popularity.desc` : null, fetcher);

  return (
    <SectionWrapper title="NEURAL_MOOD_SYNC" icon={<BarChart2 className="w-6 h-6 text-brand" />} delay={0.2}>
       <div className="bg-gradient-to-b from-white/5 to-black/60 border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl backdrop-blur-2xl">
         {/* Dynamic Glow */}
         <div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none blur-[120px] transition-all duration-1000 ease-in-out" 
           style={{ background: active ? `radial-gradient(circle, ${active.color}, transparent 60%)` : 'transparent' }} 
         />
         
         <p className="text-[10px] font-black tracking-[0.3em] text-brand mb-8 flex items-center gap-2 relative z-10">
          <span className="w-2 h-2 bg-brand rounded-full animate-pulse" /> CALIBRATING BIO-METRICS...
         </p>

         <div className="flex flex-wrap gap-4 mb-10 relative z-10">
           {MOODS.map(m => (
             <motion.button 
                key={m.label} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActive(active?.label === m.label ? null : m)}
                className={`px-8 py-4 rounded-2xl text-[11px] font-black tracking-[0.3em] transition-all duration-300 flex items-center gap-3 border backdrop-blur-md
                  ${active?.label === m.label 
                    ? 'bg-brand border-brand text-white shadow-[0_0_40px_rgba(229,9,20,0.5)] scale-105' 
                    : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10'}`}
             >
               <span className="text-xl drop-shadow-md">{m.emoji}</span> {m.label}
             </motion.button>
           ))}
         </div>

         <AnimatePresence mode="wait">
          {active && (
            <motion.div key={active.label} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative z-10">
              <div className="flex gap-4 md:gap-6 overflow-x-auto custom-scrollbar pb-6 pt-2 scroll-smooth snap-x">
                {isLoading ? Array(6).fill(0).map((_, i) => <MovieCardSkeleton key={i} />) :
                  data?.results?.slice(0, 10).map((m: Movie) => (
                    <div key={m.id} className="shrink-0 snap-start"><MovieCard movie={m} /></div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
       </div>
    </SectionWrapper>
  );
}

function CollectionBanner() {
  const { data } = useSWR('/api/tmdb?endpoint=/movie/top_rated&page=3', fetcher);
  const featured: Movie = data?.results?.[0];
  if (!featured) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }} viewport={{ once: true }}
      className="relative rounded-[3rem] overflow-hidden h-[400px] group cursor-pointer border border-white/10 mb-28 shadow-2xl"
    >
      <Link href={`/movie/${featured.id}`}>
        <img
          src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          alt={featured.title}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 w-full md:w-2/3">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] bg-brand/20 border border-brand/50 px-3 py-1 rounded-full font-black tracking-[0.4em] text-brand backdrop-blur-md">
              ARCHIVE HIGHLIGHT
            </span>
          </div>
          <h3 className="font-display text-4xl md:text-7xl text-white mb-6 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] tracking-tighter">{featured.title}</h3>
          <p className="text-gray-300 text-sm md:text-base max-w-xl line-clamp-2 md:line-clamp-3 mb-8 leading-relaxed font-medium drop-shadow-md">{featured.overview}</p>
          <div className="flex items-center gap-6">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-brand px-8 py-4 rounded-2xl text-white font-black text-[11px] tracking-[0.2em] shadow-[0_0_30px_rgba(229,9,20,0.6)] hover:shadow-[0_0_50px_rgba(229,9,20,0.9)] transition-shadow">
              <Play className="w-5 h-5 fill-current" /> INITIATE STREAM
            </motion.span>
            <span className="text-[11px] font-black tracking-[0.2em] text-yellow-400 bg-black/60 px-5 py-3 rounded-2xl backdrop-blur-xl border border-white/10">
              ⭐ {featured.vote_average?.toFixed(1)} <span className="mx-2 text-white/20">|</span> {featured.release_date?.split('-')[0]}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function UpcomingReleases() {
  const { data } = useSWR('/api/tmdb?endpoint=/movie/upcoming', fetcher);
  const upcoming: Movie[] = data?.results?.slice(0, 6) || [];

  return (
    <SectionWrapper title="INCOMING_TRANSMISSIONS" icon={<Clock className="w-6 h-6 text-brand" />} delay={0.25}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {upcoming.map((m, i) => {
          const releaseDate = new Date(m.release_date || '');
          const daysUntil = Math.max(0, Math.floor((releaseDate.getTime() - Date.now()) / 86400000));
          return (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring' }} viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="group cursor-pointer"
            >
              <Link href={`/movie/${m.id}`} className="block">
                <div className="relative rounded-2xl overflow-hidden aspect-[2/3] mb-4 border border-white/10 shadow-2xl">
                  <img src={`https://image.tmdb.org/t/p/w342${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={m.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    {daysUntil === 0 ? (
                      <span className="bg-brand text-white text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(229,9,20,0.8)]">OUT NOW</span>
                    ) : (
                      <span className="bg-black/80 border border-white/20 text-white text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-lg backdrop-blur-md">
                        {daysUntil}D AWAY
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-white text-xs font-black tracking-widest truncate text-center drop-shadow-md">{m.title}</p>
                <p className="text-brand text-[9px] font-black tracking-[0.2em] text-center mt-1">{m.release_date}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

function RandomDiscoveryCTA() {
  const [randomId, setRandomId] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const { data } = useSWR('/api/tmdb?endpoint=/movie/popular&page=5', fetcher);

  const spin = () => {
    setSpinning(true);
    setRandomId(null);
    setTimeout(() => {
      const movies = data?.results || [];
      const pick = movies[Math.floor(Math.random() * movies.length)];
      setRandomId(pick?.id || null);
      setSpinning(false);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="glass-panel rounded-[3rem] border border-white/10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-r from-brand/10 via-black/40 to-black/80 shadow-2xl relative overflow-hidden mt-12"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="z-10 text-center md:text-left">
        <h3 className="font-display text-4xl md:text-6xl text-white tracking-widest mb-4 drop-shadow-lg">FEELING ADVENTUROUS?</h3>
        <p className="text-gray-400 text-[11px] font-black tracking-[0.4em] uppercase">LET THE OMNIMUX NEURAL-NET CHOOSE YOUR FATE</p>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4 z-10 w-full md:w-auto">
        <AnimatePresence mode="popLayout">
          {randomId && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <Link href={`/movie/${randomId}`} className="px-8 py-5 rounded-2xl bg-white/10 text-white text-[11px] font-black tracking-[0.2em] border border-white/20 hover:bg-white/20 hover:scale-105 transition-all backdrop-blur-md flex items-center justify-center w-full md:w-auto shadow-xl">
                ACCESS FILE →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button onClick={spin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={spinning}
          className="px-10 py-5 rounded-2xl bg-brand text-white font-black text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(229,9,20,0.5)] hover:shadow-[0_0_60px_rgba(229,9,20,0.8)] transition-all w-full md:w-auto disabled:opacity-70 disabled:cursor-not-allowed">
          <RefreshCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? 'COMPUTING MATRICES...' : 'RANDOM DECRYPT'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── REUSABLE CINEMATIC MOVIE ROW ─────────────────────────────────────────────

function MovieRow({ title, movies, isSpecial = false, loading = false, icon, exploreHref, delay = 0, showProgress = false }: SectionProps & { movies: Movie[], isSpecial?: boolean, loading?: boolean, showProgress?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
    setCanScrollRight(scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const clientWidth = scrollRef.current?.clientWidth || 800;
    scrollRef.current?.scrollBy({ left: dir === 'right' ? clientWidth * 0.75 : -(clientWidth * 0.75), behavior: 'smooth' });
  };

  useEffect(() => { checkScroll(); }, [movies, checkScroll]);

  if (!loading && !movies.length) return null;

  return (
    <SectionWrapper title={title} icon={icon} accent={isSpecial} delay={delay} exploreHref={exploreHref}>
      <div className="relative group/slider">
        {/* Cinematic Navigation Controls */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onClick={() => scroll('left')}
              className="absolute left-0 md:left-4 top-[40%] -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 bg-black/80 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-2xl hover:bg-brand hover:border-brand hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-0 group-hover/slider:opacity-100">
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.button>
          )}
          {canScrollRight && (
            <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onClick={() => scroll('right')}
              className="absolute right-0 md:right-4 top-[40%] -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 bg-black/80 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-2xl hover:bg-brand hover:border-brand hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-0 group-hover/slider:opacity-100">
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Cinematic Edge Fades */}
        {canScrollLeft && <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-surface to-transparent z-20 pointer-events-none transition-opacity" />}
        {canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-surface to-transparent z-20 pointer-events-none transition-opacity" />}

        <div ref={scrollRef} onScroll={checkScroll} className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-visible custom-scrollbar pb-10 scroll-smooth snap-x px-2">
          {loading
            ? Array(10).fill(0).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie, i) => (
              <motion.div key={movie.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: Math.min(i * 0.05, 0.4), ease: 'easeOut' }} viewport={{ once: true }} className="snap-start shrink-0 relative group/item">
                <MovieCard movie={movie} />
                {(showProgress || movie.watchProgress !== undefined) && (
                  <div className="absolute bottom-[90px] left-2 right-2 z-10">
                    <div className="h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm shadow-xl">
                      <div className="h-full bg-brand rounded-full shadow-[0_0_10px_rgba(229,9,20,1)] transition-all duration-500" style={{ width: `${movie.watchProgress || Math.random() * 80 + 10}%` }} />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

// ─── MAIN PAGE ENTRY POINT ────────────────────────────────────────────────────

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [netflixScrape, setNetflixScrape] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [tvTrending, setTvTrending] = useState<Movie[]>([]);

  const { watchlist, history } = useStore();
  const isMounted = useMounted();

  // Parallax Cinematic Background
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [t, n, tr, np, tv] = await Promise.all([
          fetcher('/api/tmdb?endpoint=/trending/movie/week'),
          fetcher('/api/tmdb?endpoint=/discover/movie&with_watch_providers=8&watch_region=US'),
          fetcher('/api/tmdb?endpoint=/movie/top_rated'),
          fetcher('/api/tmdb?endpoint=/movie/now_playing'),
          fetcher('/api/tmdb?endpoint=/trending/tv/week'),
        ]);
        setTrending(t.results || []); 
        setNetflixScrape(n.results || []); 
        setTopRated(tr.results || []); 
        setNowPlaying(np.results || []); 
        // Map TV shows properly for MovieCards
        setTvTrending((tv.results || []).map((m: any) => ({ ...m, media_type: 'tv', title: m.name || m.title })));
      } catch (error) {
        console.error("OMNIMUX Data Sync Failed:", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="relative bg-surface min-h-screen pb-40 overflow-hidden text-white font-sans selection:bg-brand selection:text-white">
      
      {/* Search Overlay */}
      <NeuralSearchBar />

      {/* Parallax Depth Layer */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[80vh] left-[-15%] w-[130%] h-[120vh] bg-gradient-to-b from-brand/20 via-transparent to-transparent blur-[140px] rotate-12" />
        <div className="absolute top-[220vh] right-[-10%] w-[120%] h-[120vh] bg-gradient-to-b from-blue-600/10 via-transparent to-transparent blur-[140px] -rotate-12" />
      </motion.div>

      {/* Hero Carousel */}
      <HeroCarousel movies={trending} />

      {/* Main Content Layer */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 -mt-40 relative z-20 flex flex-col">
        
        <LiveStatsTicker />

        {/* Personalized Vaults */}
        {/* Fixed: Explicitly typed 'as any[]' to prevent Vercel's strict compiler from throwing mismatched type errors between local interfaces and store types */}
        {isMounted && history.length > 0 && (
          <MovieRow title="RESUME_UPLINK" movies={history as any[]} isSpecial exploreHref="/profile" showProgress delay={0.05} />
        )}
        
        {isMounted && watchlist.length > 0 && (
          <MovieRow title="SECURED_VAULT" movies={watchlist as any[]} icon={<ShieldCheck className="w-6 h-6 text-brand" />} exploreHref="/profile" delay={0.05} />
        )}

        {/* Core Discovery Rails */}
        <FullGenreNexus />

        <MovieRow title="UNIVERSAL_TRENDS" movies={trending.slice(4)} loading={trending.length === 0} icon={<TrendingUp className="w-6 h-6 text-brand" />} exploreHref="/discover" delay={0.05} />
        
        <CollectionBanner />

        <BoxOfficeLeaderboard />

        <MovieRow title="LIVE_TRANSMISSIONS (THEATERS)" movies={nowPlaying} loading={nowPlaying.length === 0} icon={<Flame className="w-6 h-6 text-brand" />} exploreHref="/discover" delay={0.05} />

        <MoodEngine />

        <UpcomingReleases />

        <MovieRow title="CRITICAL_ACCLAIM" movies={topRated} loading={topRated.length === 0} icon={<Award className="w-6 h-6 text-brand" />} exploreHref="/discover?sort=top_rated" delay={0.05} />

        <MovieRow title="TELEVISION_NETWORKS" movies={tvTrending} loading={tvTrending.length === 0} icon={<Globe className="w-6 h-6 text-brand" />} exploreHref="/discover?type=tv" delay={0.05} />

        <MovieRow title="HIGH_OCTANE_FACTION (NETFLIX)" movies={netflixScrape} loading={netflixScrape.length === 0} icon={<Zap className="w-6 h-6 text-brand" />} exploreHref="/discover?provider=8" isSpecial delay={0.05} />

        <RandomDiscoveryCTA />

        {/* Footer Discovery Loop */}
        <div className="mt-32">
          <div className="bg-gradient-to-r from-brand/10 to-transparent p-16 md:p-24 rounded-[4rem] border border-white/5 flex flex-col items-center text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,9,20,0.15),transparent_70%)]" />
            <Sparkles className="w-12 h-12 text-brand mb-6 animate-bounce relative z-10" />
            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6 relative z-10 tracking-tighter">END OF THE SCROLL.</h2>
            <p className="text-gray-400 font-black tracking-[0.4em] mb-10 text-[10px] md:text-xs relative z-10">RE-INITIALIZE DISCOVERY ARCHIVE?</p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="relative z-10 bg-brand text-white px-12 py-5 rounded-2xl font-black tracking-[0.2em] text-[11px] hover:scale-110 transition-transform duration-300 shadow-[0_0_40px_rgba(229,9,20,0.6)]"
            >
              RE-SYNC TO TOP
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
