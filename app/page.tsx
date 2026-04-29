'use client';
// app/page.tsx — OMNIMUX HOME · v4.0
import { useEffect, useState, useRef, useCallback } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MovieCardSkeleton } from '@/components/Skeleton';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ChevronRight, TrendingUp, Star, Clock, Bookmark, Zap,
  Globe, Film, Flame, Award, RefreshCw, ChevronLeft, ChevronDown,
  Play, Eye, BarChart2, Sparkles,
} from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── GENRE SPOTLIGHT ──────────────────────────────────────────────────────────
const SPOTLIGHT_GENRES = [
  { id: 28, name: 'Action', icon: '⚡', color: 'from-orange-600 to-red-600' },
  { id: 27, name: 'Horror', icon: '💀', color: 'from-purple-800 to-black' },
  { id: 878, name: 'Sci-Fi', icon: '🛸', color: 'from-blue-700 to-cyan-500' },
  { id: 35, name: 'Comedy', icon: '😂', color: 'from-yellow-500 to-orange-400' },
  { id: 18, name: 'Drama', icon: '🎭', color: 'from-pink-700 to-rose-500' },
  { id: 12, name: 'Adventure', icon: '🗺️', color: 'from-green-700 to-emerald-500' },
];

// ─── LIVE STATS TICKER ────────────────────────────────────────────────────────
function LiveStatsTicker() {
  const stats = [
    { label: 'STREAMS_TODAY', value: '2.4M', icon: <Play className="w-3 h-3" /> },
    { label: 'ACTIVE_NODES', value: '18,392', icon: <Globe className="w-3 h-3" /> },
    { label: 'WATCH_PARTIES', value: '847', icon: <Eye className="w-3 h-3" /> },
    { label: 'VAULTS_SECURED', value: '94K', icon: <Bookmark className="w-3 h-3" /> },
    { label: 'TITLES_INDEXED', value: '850K+', icon: <Film className="w-3 h-3" /> },
    { label: 'LATENCY_AVG', value: '12ms', icon: <Zap className="w-3 h-3" /> },
  ];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-black/40 backdrop-blur-xl py-3 mb-12">
      <div className="flex gap-16 animate-[ticker_25s_linear_infinite] whitespace-nowrap">
        {[...stats, ...stats, ...stats].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[9px] font-black tracking-[0.25em] text-gray-500 shrink-0">
            <span className="text-brand">{s.icon}</span>
            <span>{s.label}</span>
            <span className="text-white ml-1">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GENRE SPOTLIGHT RAIL ─────────────────────────────────────────────────────
function GenreSpotlight() {
  return (
    <SectionWrapper title="GENRE NEXUS" icon={<Sparkles className="w-5 h-5 text-brand" />} delay={0}>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {SPOTLIGHT_GENRES.map((g, i) => (
          <motion.a
            key={g.id}
            href={`/discover?genre=${g.id}`}
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }} viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -4 }}
            className={`relative h-24 rounded-2xl bg-gradient-to-br ${g.color} flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden group border border-white/10 shadow-lg`}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            <span className="text-2xl relative z-10">{g.icon}</span>
            <span className="text-[9px] font-black tracking-[0.2em] text-white/90 relative z-10">{g.name.toUpperCase()}</span>
          </motion.a>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ─── MOOD RECOMMENDATION ENGINE ───────────────────────────────────────────────
const MOODS = [
  { label: 'HYPED', emoji: '🔥', genre: '28', q: 'action' },
  { label: 'CHILLED', emoji: '🌊', genre: '18', q: 'relaxing' },
  { label: 'SCARED', emoji: '👁️', genre: '27', q: 'horror' },
  { label: 'INSPIRED', emoji: '✨', genre: '18', q: 'inspiring' },
  { label: 'LAUGHING', emoji: '😭', genre: '35', q: 'comedy' },
  { label: 'CURIOUS', emoji: '🛸', genre: '878', q: 'sci-fi' },
];

function MoodEngine() {
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const { data, isLoading } = useSWR(
    selectedMood ? `/api/tmdb?endpoint=/discover/movie&with_genres=${selectedMood.genre}&sort_by=vote_average.desc&vote_count.gte=500` : null,
    fetcher
  );

  return (
    <SectionWrapper title="MOOD_ENGINE" icon={<BarChart2 className="w-5 h-5 text-brand" />} delay={0.1}>
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-black/30">
        <p className="text-[10px] font-black tracking-[0.3em] text-gray-500 mb-6">HOW ARE YOU FEELING? INITIALIZING NEURAL MATCH...</p>
        <div className="flex flex-wrap gap-3 mb-8">
          {MOODS.map(m => (
            <motion.button key={m.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(selectedMood?.label === m.label ? null : m)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] border transition-all flex items-center gap-2 ${selectedMood?.label === m.label ? 'bg-brand border-brand text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]' : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'}`}>
              <span>{m.emoji}</span> {m.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedMood && (
            <motion.div key={selectedMood.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4">
                {isLoading ? Array(6).fill(0).map((_, i) => <MovieCardSkeleton key={i} />) :
                  data?.results?.slice(0, 10).map((m: any) => (
                    <div key={m.id} className="shrink-0"><MovieCard movie={m} /></div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}

// ─── LIVE BOX OFFICE LEADERBOARD ─────────────────────────────────────────────
function BoxOfficeLeaderboard() {
  const { data } = useSWR('/api/tmdb?endpoint=/movie/now_playing', fetcher);
  const movies = data?.results?.slice(0, 8) || [];

  return (
    <SectionWrapper title="BOX_OFFICE_LIVE" icon={<Award className="w-5 h-5 text-brand" />} delay={0.15}>
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden bg-black/30">
        {movies.map((m: any, i: number) => (
          <Link href={`/movie/${m.id}`} key={m.id}>
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }} viewport={{ once: true }}
              className="flex items-center gap-6 px-8 py-5 border-b border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
            >
              <span className={`font-display text-4xl w-12 text-center flex-shrink-0 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                {i + 1}
              </span>
              <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} className="w-12 h-16 object-cover rounded-xl flex-shrink-0 shadow-lg" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm truncate group-hover:text-brand transition-colors">{m.title}</p>
                <p className="text-gray-600 text-[9px] font-black tracking-[0.2em] mt-1">{m.release_date?.split('-')[0]} · ⭐ {m.vote_average?.toFixed(1)}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} whileInView={{ width: `${(m.popularity / (movies[0]?.popularity || 1)) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.8 }} viewport={{ once: true }}
                    className="h-full bg-gradient-to-r from-brand to-orange-500 rounded-full"
                  />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-brand transition-colors" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ─── UPCOMING RELEASES COUNTDOWN ──────────────────────────────────────────────
function UpcomingReleases() {
  const { data } = useSWR('/api/tmdb?endpoint=/movie/upcoming', fetcher);
  const upcoming = data?.results?.slice(0, 6) || [];

  return (
    <SectionWrapper title="INCOMING_TRANSMISSIONS" icon={<Clock className="w-5 h-5 text-brand" />} delay={0.2}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {upcoming.map((m: any, i: number) => {
          const releaseDate = new Date(m.release_date);
          const daysUntil = Math.max(0, Math.floor((releaseDate.getTime() - Date.now()) / 86400000));
          return (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Link href={`/movie/${m.id}`} className="block group">
                <div className="relative rounded-2xl overflow-hidden aspect-[2/3] mb-3 border border-white/5 shadow-xl">
                  <img src={`https://image.tmdb.org/t/p/w342${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={m.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    {daysUntil === 0 ? (
                      <span className="bg-brand text-white text-[8px] font-black tracking-[0.2em] px-2 py-1 rounded-lg">OUT NOW</span>
                    ) : (
                      <span className="bg-black/70 text-white text-[8px] font-black tracking-[0.15em] px-2 py-1 rounded-lg backdrop-blur">
                        {daysUntil}D AWAY
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-white text-[10px] font-black tracking-wide truncate">{m.title}</p>
                <p className="text-gray-600 text-[9px] font-black tracking-[0.15em]">{m.release_date}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// ─── FEATURED COLLECTION BANNER ───────────────────────────────────────────────
function CollectionBanner() {
  const { data } = useSWR('/api/tmdb?endpoint=/movie/top_rated&page=3', fetcher);
  const featured = data?.results?.[0];
  if (!featured) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative rounded-3xl overflow-hidden h-[280px] group cursor-pointer border border-white/5"
    >
      <Link href={`/movie/${featured.id}`}>
        <img
          src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          alt={featured.title}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-12">
          <div className="text-[9px] font-black tracking-[0.3em] text-brand mb-3">FEATURED TRANSMISSION</div>
          <h3 className="font-display text-5xl md:text-6xl text-white mb-3">{featured.title}</h3>
          <p className="text-gray-300 text-xs max-w-md line-clamp-2 mb-6">{featured.overview}</p>
          <div className="flex items-center gap-4">
            <motion.span whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-brand px-6 py-3 rounded-2xl text-white font-black text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(229,9,20,0.5)]">
              <Play className="w-4 h-4 fill-current" /> STREAM NOW
            </motion.span>
            <span className="text-[9px] font-black tracking-[0.2em] text-yellow-400">⭐ {featured.vote_average?.toFixed(1)} · {featured.release_date?.split('-')[0]}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── CONTINUE WATCHING — ENHANCED ─────────────────────────────────────────────
function ContinueWatchingRow({ movies }: { movies: any[] }) {
  return (
    <SectionWrapper
      title="CONTINUE WATCHING"
      icon={<Play className="w-5 h-5 text-brand" />}
      accent
      delay={0}
    >
      <div className="flex gap-4 md:gap-6 overflow-x-auto custom-scrollbar pb-4 scroll-smooth">
        {movies.map((movie, i) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="snap-start shrink-0 relative group/item"
          >
            <MovieCard movie={movie} />
            {/* Progress bar for watched items */}
            <div className="absolute bottom-[88px] left-0 right-0 px-1">
              <div className="h-1 bg-black/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full"
                  style={{ width: `${Math.random() * 80 + 10}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function SectionWrapper({
  title, icon, children, accent = false, delay = 0, exploreHref
}: {
  title: string; icon?: React.ReactNode; children: React.ReactNode;
  accent?: boolean; delay?: number; exploreHref?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="w-full relative group/row"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-3xl font-display font-black uppercase flex items-center gap-3 text-white drop-shadow-lg tracking-wider">
          {accent && <span className="w-1.5 h-10 bg-brand rounded-full shadow-[0_0_15px_rgba(229,9,20,0.8)] block" />}
          {!accent && icon && <span className="opacity-80">{icon}</span>}
          {title}
        </h2>
        {exploreHref && (
          <Link href={exploreHref}
            className="text-brand font-black text-[10px] uppercase opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 tracking-[0.2em]">
            EXPLORE ALL <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

// ─── STANDARD MOVIE ROW ───────────────────────────────────────────────────────
function MovieRow({
  title, movies, isSpecial = false, loading = false,
  icon, exploreHref, delay = 0,
}: {
  title: string; movies: any[]; isSpecial?: boolean; loading?: boolean;
  icon?: React.ReactNode; exploreHref?: string; delay?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
    setCanScrollRight(scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 600 : -600, behavior: 'smooth' });
  };

  if (!loading && !movies.length) return null;

  return (
    <SectionWrapper title={title} icon={icon} accent={isSpecial} delay={delay} exploreHref={exploreHref}>
      <div className="relative">
        {/* Scroll Buttons */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 bg-black/80 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl hover:bg-brand transition-all shadow-2xl">
              <ChevronLeft className="w-4 h-4 text-white" />
            </motion.button>
          )}
          {canScrollRight && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 bg-black/80 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl hover:bg-brand transition-all shadow-2xl">
              <ChevronRight className="w-4 h-4 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Gradient edges */}
        {canScrollLeft && <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />}
        {canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-5 overflow-x-auto overflow-y-visible custom-scrollbar pb-10 px-2 scroll-smooth snap-x"
        >
          {loading
            ? Array(10).fill(0).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                viewport={{ once: true }}
                className="snap-start shrink-0"
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

// ─── RANDOM DISCOVERY CTA ──────────────────────────────────────────────────────
function RandomDiscoveryCTA() {
  const [randomId, setRandomId] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const { data } = useSWR('/api/tmdb?endpoint=/movie/popular&page=5', fetcher);

  const spin = () => {
    setSpinning(true);
    setTimeout(() => {
      const movies = data?.results || [];
      const pick = movies[Math.floor(Math.random() * movies.length)];
      setRandomId(pick?.id || null);
      setSpinning(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-panel rounded-3xl border border-white/5 p-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-brand/5 to-transparent"
    >
      <div>
        <h3 className="font-display text-4xl text-white tracking-widest mb-2">FEELING ADVENTUROUS?</h3>
        <p className="text-gray-500 text-[10px] font-black tracking-[0.3em]">LET THE NEXUS CHOOSE YOUR NEXT WATCH</p>
      </div>
      <div className="flex items-center gap-4">
        {randomId && (
          <Link href={`/movie/${randomId}`}
            className="px-6 py-3 rounded-2xl bg-white/10 text-white text-[10px] font-black tracking-[0.2em] border border-white/10 hover:bg-white/20 transition-all">
            OPEN SELECTION →
          </Link>
        )}
        <motion.button onClick={spin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-8 py-4 rounded-2xl bg-brand text-white font-black text-[10px] tracking-[0.2em] flex items-center gap-3 shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:shadow-[0_0_50px_rgba(229,9,20,0.6)] transition-all">
          <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? 'CALCULATING...' : 'RANDOM DECRYPT'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── HOME PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [netflixScrape, setNetflixScrape] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any[]>([]);
  const [tvTrending, setTvTrending] = useState<any[]>([]);

  const { watchlist, history } = useStore();
  const isMounted = useMounted();

  useEffect(() => {
    const load = async () => {
      const [t, n, tr, np, tv] = await Promise.all([
        fetch('/api/tmdb?endpoint=/trending/movie/week').then(r => r.json()),
        fetch('/api/tmdb?endpoint=/discover/movie&with_networks=213').then(r => r.json()),
        fetch('/api/tmdb?endpoint=/movie/top_rated').then(r => r.json()),
        fetch('/api/tmdb?endpoint=/movie/now_playing').then(r => r.json()),
        fetch('/api/tmdb?endpoint=/trending/tv/week').then(r => r.json()),
      ]);
      setTrending(t.results || []);
      setNetflixScrape(n.results || []);
      setTopRated(tr.results || []);
      setNowPlaying(np.results || []);
      setTvTrending(tv.results || []);
    };
    load();
  }, []);

  return (
    <div className="bg-surface pb-32 overflow-hidden">
      {/* HERO */}
      <HeroCarousel movies={trending} />

      {/* MAIN CONTENT */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 -mt-32 relative z-20 space-y-20 flex flex-col">

        {/* Live stats */}
        <LiveStatsTicker />

        {/* User-specific rows */}
        {isMounted && history.length > 0 && (
          <ContinueWatchingRow movies={history} />
        )}
        {isMounted && watchlist.length > 0 && (
          <MovieRow
            title="YOUR WATCHLIST VAULT"
            movies={watchlist}
            icon={<Bookmark className="w-5 h-5 text-brand" />}
            exploreHref="/vault"
          />
        )}

        {/* Genre grid */}
        <GenreSpotlight />

        {/* Trending */}
        <MovieRow
          title="TRENDING UNIVERSALLY"
          movies={trending.slice(5)}
          loading={trending.length === 0}
          icon={<TrendingUp className="w-5 h-5 text-brand" />}
          exploreHref="/discover"
          delay={0.05}
        />

        {/* Featured banner */}
        <CollectionBanner />

        {/* Box office */}
        <BoxOfficeLeaderboard />

        {/* Now playing */}
        <MovieRow
          title="LIVE TRANSMISSIONS"
          movies={nowPlaying}
          loading={nowPlaying.length === 0}
          icon={<Flame className="w-5 h-5 text-brand" />}
          exploreHref="/discover"
          delay={0.05}
        />

        {/* Mood engine */}
        <MoodEngine />

        {/* Award winning */}
        <MovieRow
          title="AWARD-WINNING EPICS"
          movies={topRated}
          loading={topRated.length === 0}
          icon={<Award className="w-5 h-5 text-brand" />}
          exploreHref="/discover?sort=top_rated"
          delay={0.05}
        />

        {/* Upcoming */}
        <UpcomingReleases />

        {/* TV */}
        <MovieRow
          title="TELEVISION NETWORK"
          movies={tvTrending}
          loading={tvTrending.length === 0}
          icon={<Globe className="w-5 h-5 text-brand" />}
          delay={0.05}
        />

        {/* Action packed */}
        <MovieRow
          title="HIGH-OCTANE FACTION"
          movies={netflixScrape}
          loading={netflixScrape.length === 0}
          icon={<Zap className="w-5 h-5 text-brand" />}
          delay={0.05}
        />

        {/* Random CTA */}
        <RandomDiscoveryCTA />
      </div>
    </div>
  );
}
