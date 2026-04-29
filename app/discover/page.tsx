'use client';
// app/discover/page.tsx — OMNIMUX DISCOVER MATRIX · v4.0
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { MovieCard } from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/Skeleton';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  SlidersHorizontal, Activity, Search, X, Grid3X3, List, TrendingUp,
  Star, Calendar, Clock, Filter, ChevronDown, Sparkles, RefreshCw,
  Eye, Zap, Globe, BarChart2, ChevronUp, Layers,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GENRES = [
  { id: 28, name: 'Action', emoji: '⚡' }, { id: 12, name: 'Adventure', emoji: '🗺️' },
  { id: 16, name: 'Animation', emoji: '🎨' }, { id: 35, name: 'Comedy', emoji: '😂' },
  { id: 80, name: 'Crime', emoji: '🔫' }, { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 14, name: 'Fantasy', emoji: '🧙' }, { id: 27, name: 'Horror', emoji: '💀' },
  { id: 9648, name: 'Mystery', emoji: '🔍' }, { id: 10749, name: 'Romance', emoji: '💘' },
  { id: 878, name: 'Sci-Fi', emoji: '🛸' }, { id: 53, name: 'Thriller', emoji: '😰' },
  { id: 10752, name: 'War', emoji: '⚔️' }, { id: 37, name: 'Western', emoji: '🤠' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'MOST POPULAR', icon: <TrendingUp className="w-3 h-3" /> },
  { value: 'vote_average.desc', label: 'HIGHEST RATED', icon: <Star className="w-3 h-3" /> },
  { value: 'release_date.desc', label: 'NEWEST FIRST', icon: <Calendar className="w-3 h-3" /> },
  { value: 'release_date.asc', label: 'OLDEST FIRST', icon: <Clock className="w-3 h-3" /> },
  { value: 'revenue.desc', label: 'BOX OFFICE KING', icon: <BarChart2 className="w-3 h-3" /> },
  { value: 'vote_count.desc', label: 'MOST REVIEWED', icon: <Eye className="w-3 h-3" /> },
];

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2015', '2010', '2000'];
const RATING_THRESHOLDS = ['9', '8', '7', '6', '5'];
const LANGUAGES = [
  { code: '', label: 'ALL LANGUAGES' }, { code: 'en', label: 'ENGLISH' },
  { code: 'ja', label: 'JAPANESE' }, { code: 'ko', label: 'KOREAN' },
  { code: 'es', label: 'SPANISH' }, { code: 'fr', label: 'FRENCH' },
  { code: 'de', label: 'GERMAN' }, { code: 'hi', label: 'HINDI' },
];

// ─── FILTER STATE ─────────────────────────────────────────────────────────────
interface Filters {
  genres: string[];
  year: string;
  sort: string;
  minRating: string;
  language: string;
  includeAdult: boolean;
  runtime: string;
}

const DEFAULT_FILTERS: Filters = {
  genres: [],
  year: '',
  sort: 'popularity.desc',
  minRating: '',
  language: '',
  includeAdult: false,
  runtime: '',
};

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
function SearchBar({ onResults }: { onResults: (results: any[] | null, query: string) => void }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { onResults(null, ''); return; }
    debounceRef.current = setTimeout(async () => {
      const r = await fetch(`/api/tmdb?endpoint=/search/movie&query=${encodeURIComponent(query)}&include_adult=false`);
      const d = await r.json();
      onResults(d.results || [], query);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <motion.div
      animate={{ width: focused ? '100%' : '280px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative"
    >
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-xl transition-all ${focused ? 'border-brand bg-black/60 shadow-[0_0_20px_rgba(229,9,20,0.15)]' : 'border-white/10 bg-black/40'}`}>
        <Search className={`w-4 h-4 flex-shrink-0 transition-colors ${focused ? 'text-brand' : 'text-gray-500'}`} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="SEARCH TITLES..."
          className="bg-transparent outline-none text-white text-[10px] font-black tracking-[0.2em] placeholder-gray-600 w-full"
        />
        {query && (
          <button onClick={() => setQuery('')} className="flex-shrink-0">
            <X className="w-3.5 h-3.5 text-gray-500 hover:text-white transition-colors" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── ACTIVE FILTERS PILL ROW ──────────────────────────────────────────────────
function ActiveFilterPills({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const pills: { label: string; remove: () => void }[] = [];

  filters.genres.forEach(g => {
    const genre = GENRES.find(x => x.id.toString() === g);
    if (genre) pills.push({ label: genre.name, remove: () => setFilters({ ...filters, genres: filters.genres.filter(x => x !== g) }) });
  });
  if (filters.year) pills.push({ label: filters.year, remove: () => setFilters({ ...filters, year: '' }) });
  if (filters.minRating) pills.push({ label: `★ ${filters.minRating}+`, remove: () => setFilters({ ...filters, minRating: '' }) });
  if (filters.language) {
    const lang = LANGUAGES.find(l => l.code === filters.language);
    if (lang) pills.push({ label: lang.label, remove: () => setFilters({ ...filters, language: '' }) });
  }

  if (!pills.length) return null;

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      className="flex flex-wrap gap-2 px-2 pt-3 border-t border-white/5">
      <span className="text-[9px] font-black tracking-[0.3em] text-gray-600 self-center">ACTIVE_FILTERS:</span>
      {pills.map(p => (
        <motion.button key={p.label} layout initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={p.remove}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand/20 border border-brand/30 text-brand text-[9px] font-black tracking-[0.15em] hover:bg-brand/30 transition-all">
          {p.label} <X className="w-2.5 h-2.5" />
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─── COLLAPSIBLE FILTER SECTION ───────────────────────────────────────────────
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-[9px] font-black tracking-[0.3em] text-gray-500 mb-3 hover:text-gray-300 transition-colors">
        {title}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── VIEW MODES ───────────────────────────────────────────────────────────────
type ViewMode = 'grid' | 'large' | 'list';

function MovieListItem({ movie }: { movie: any }) {
  return (
    <motion.a href={`/movie/${movie.id}`} layout
      whileHover={{ x: 4 }}
      className="flex items-center gap-6 p-4 rounded-2xl border border-white/5 bg-black/20 hover:bg-white/5 hover:border-white/10 transition-all group"
    >
      <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} className="w-14 h-20 object-cover rounded-xl flex-shrink-0 shadow-lg" alt={movie.title} />
      <div className="flex-1 min-w-0">
        <p className="text-white font-black text-sm mb-1 truncate group-hover:text-brand transition-colors">{movie.title}</p>
        <p className="text-gray-600 text-[9px] font-black tracking-[0.2em] mb-2">
          {movie.release_date?.split('-')[0]} · {movie.original_language?.toUpperCase()}
        </p>
        <p className="text-gray-500 text-[10px] line-clamp-2 leading-relaxed">{movie.overview}</p>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
        <span className="text-yellow-400 font-black text-sm">⭐ {movie.vote_average?.toFixed(1)}</span>
        <span className="text-[9px] font-black tracking-[0.2em] text-gray-600">{movie.vote_count?.toLocaleString()} VOTES</span>
        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-brand rounded-full" style={{ width: `${(movie.vote_average / 10) * 100}%` }} />
        </div>
      </div>
    </motion.a>
  );
}

// ─── STATS PANEL ─────────────────────────────────────────────────────────────
function ResultStats({ total, filters }: { total: number; filters: Filters }) {
  return (
    <div className="flex items-center gap-6 text-[9px] font-black tracking-[0.2em] text-gray-600">
      <span className="flex items-center gap-2">
        <Activity className="w-3 h-3 text-brand animate-pulse" />
        <span className="text-white">{total.toLocaleString()}</span> RESULTS
      </span>
      <span className="hidden md:flex items-center gap-2">
        <Layers className="w-3 h-3" />
        {filters.genres.length || 'ALL'} GENRES
      </span>
    </div>
  );
}

// ─── DISCOVER PAGE ─────────────────────────────────────────────────────────────
export default function Discover() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [savedFilters, setSavedFilters] = useState<Filters[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [comparisonList, setComparisonList] = useState<any[]>([]);

  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 200], [0, -20]);

  // Build API URL from filters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({
      endpoint: '/discover/movie',
      sort_by: filters.sort,
      include_adult: 'false',
      'vote_count.gte': '100',
    });
    if (filters.genres.length) params.set('with_genres', filters.genres.join(','));
    if (filters.year) params.set('primary_release_year', filters.year);
    if (filters.minRating) params.set('vote_average.gte', filters.minRating);
    if (filters.language) params.set('with_original_language', filters.language);
    return `/api/tmdb?${params}`;
  }, [filters]);

  // Infinite scroll
  const getKey = (pageIndex: number, prevData: any) => {
    if (prevData && !prevData.results?.length) return null;
    return `${apiUrl}&page=${pageIndex + 1}`;
  };

  const { data: pages, isLoading, setSize, size } = useSWRInfinite(getKey, fetcher, { revalidateFirstPage: false });

  const allMovies = useMemo(() => pages?.flatMap(p => p.results || []) || [], [pages]);
  const totalResults = pages?.[0]?.total_results || 0;
  const hasMore = allMovies.length < totalResults;

  // Infinite scroll observer
  const loaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        setSize(s => s + 1);
      }
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, setSize]);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.genres.length) params.set('genres', filters.genres.join(','));
    if (filters.year) params.set('year', filters.year);
    if (filters.sort !== 'popularity.desc') params.set('sort', filters.sort);
    if (filters.minRating) params.set('rating', filters.minRating);
    window.history.replaceState({}, '', `?${params.toString()}`);
  }, [filters]);

  // Load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const genres = params.get('genres')?.split(',').filter(Boolean) || [];
    const year = params.get('year') || '';
    const sort = params.get('sort') || 'popularity.desc';
    const minRating = params.get('rating') || '';
    if (genres.length || year || sort !== 'popularity.desc' || minRating) {
      setFilters(f => ({ ...f, genres, year, sort, minRating }));
    }
  }, []);

  const toggleGenre = (id: string) => {
    setFilters(f => ({
      ...f,
      genres: f.genres.includes(id) ? f.genres.filter(g => g !== id) : [...f.genres, id],
    }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const saveCurrentFilters = () => setSavedFilters(f => [...f, filters]);

  const displayMovies = searchResults !== null ? searchResults : allMovies;
  const currentSort = SORT_OPTIONS.find(s => s.value === filters.sort) || SORT_OPTIONS[0];
  const hasActiveFilters = filters.genres.length > 0 || !!filters.year || !!filters.minRating || !!filters.language || filters.sort !== 'popularity.desc';

  return (
    <div className="min-h-screen pt-28 pb-40 bg-surface">
      {/* ── PAGE HEADER ── */}
      <motion.div style={{ y: headerY }} className="px-6 max-w-[1800px] mx-auto mb-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <div className="text-[9px] font-black tracking-[0.4em] text-brand mb-3 flex items-center gap-2">
                <Activity className="w-3 h-3 animate-pulse" /> OMNIMUX · DISCOVERY_ENGINE_v4
              </div>
              <h1 className="font-display text-7xl md:text-9xl text-white leading-none tracking-wider">
                DISCOVER<br /><span className="text-brand">MATRIX</span>
              </h1>
              <p className="text-gray-500 font-black tracking-[0.25em] text-[10px] uppercase mt-4">
                Query {(850000).toLocaleString()}+ titles across the global nexus network
              </p>
            </div>

            {/* Quick stats */}
            <div className="hidden xl:grid grid-cols-3 gap-4">
              {[
                { v: totalResults.toLocaleString(), l: 'RESULTS' },
                { v: filters.genres.length || 'ALL', l: 'GENRES' },
                { v: filters.year || 'ALL', l: 'CYCLES' },
              ].map(s => (
                <div key={s.l} className="glass-panel px-6 py-4 rounded-2xl text-center border border-white/5">
                  <div className="font-display text-3xl text-white">{s.v}</div>
                  <div className="text-[8px] font-black tracking-[0.3em] text-gray-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="max-w-[1800px] mx-auto px-6 flex flex-col xl:flex-row gap-8">

        {/* ── SIDEBAR FILTERS ── */}
        <motion.aside
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="xl:w-72 flex-shrink-0 space-y-2"
        >
          {/* Filter header */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 bg-black/30">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-white">
                <SlidersHorizontal className="w-4 h-4 text-brand" /> PARAMETERS
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button onClick={resetFilters}
                    className="text-[9px] font-black tracking-[0.2em] text-brand hover:text-red-400 transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" /> RESET
                  </button>
                )}
                <button onClick={saveCurrentFilters} title="Save filter preset"
                  className="text-[9px] font-black tracking-[0.2em] text-gray-500 hover:text-white transition-colors">
                  SAVE
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Genres */}
              <FilterSection title="GENRE_CLASS">
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <motion.button key={g.id} whileTap={{ scale: 0.95 }}
                      onClick={() => toggleGenre(g.id.toString())}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black tracking-[0.15em] transition-all flex items-center gap-1.5 border ${filters.genres.includes(g.id.toString()) ? 'bg-brand border-brand text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white hover:border-white/15'}`}>
                      <span>{g.emoji}</span> {g.name.toUpperCase()}
                    </motion.button>
                  ))}
                </div>
              </FilterSection>

              {/* Year */}
              <FilterSection title="RELEASE_CYCLE">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setFilters(f => ({ ...f, year: '' }))}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black tracking-[0.15em] border transition-all ${!filters.year ? 'bg-brand border-brand text-white' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>
                    ALL
                  </button>
                  {YEARS.map(y => (
                    <button key={y} onClick={() => setFilters(f => ({ ...f, year: y }))}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black tracking-[0.15em] border transition-all ${filters.year === y ? 'bg-brand border-brand text-white' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Min rating */}
              <FilterSection title="MIN_RATING_THRESHOLD">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setFilters(f => ({ ...f, minRating: '' }))}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black tracking-[0.15em] border transition-all ${!filters.minRating ? 'bg-brand border-brand text-white' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>
                    ANY
                  </button>
                  {RATING_THRESHOLDS.map(r => (
                    <button key={r} onClick={() => setFilters(f => ({ ...f, minRating: r }))}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black tracking-[0.15em] border transition-all ${filters.minRating === r ? 'bg-brand border-brand text-white' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>
                      ★ {r}+
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Language */}
              <FilterSection title="LANGUAGE_NODE">
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => setFilters(f => ({ ...f, language: l.code }))}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black tracking-[0.15em] border transition-all ${filters.language === l.code ? 'bg-brand border-brand text-white' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Adult toggle */}
              <div className="flex items-center justify-between py-2 border-t border-white/5">
                <span className="text-[9px] font-black tracking-[0.2em] text-gray-500">INCLUDE_ADULT</span>
                <button
                  onClick={() => setFilters(f => ({ ...f, includeAdult: !f.includeAdult }))}
                  className={`w-10 h-5 rounded-full transition-all relative ${filters.includeAdult ? 'bg-brand' : 'bg-white/10'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${filters.includeAdult ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Active filter pills */}
            <AnimatePresence>
              {hasActiveFilters && <ActiveFilterPills filters={filters} setFilters={setFilters} />}
            </AnimatePresence>
          </div>

          {/* Saved filter presets */}
          {savedFilters.length > 0 && (
            <div className="glass-panel p-5 rounded-3xl border border-white/5 bg-black/30">
              <div className="text-[9px] font-black tracking-[0.3em] text-gray-500 mb-3">SAVED_PRESETS</div>
              {savedFilters.map((sf, i) => (
                <button key={i} onClick={() => setFilters(sf)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-black/40 border border-white/5 text-[9px] font-black tracking-[0.15em] text-gray-400 hover:text-white hover:border-brand/30 transition-all mb-2">
                  PRESET_{i + 1} · {sf.genres.length} GENRES · {sf.year || 'ALL'}
                </button>
              ))}
            </div>
          )}
        </motion.aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0">

          {/* Controls bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-panel p-4 rounded-3xl border border-white/5 bg-black/30 mb-8 flex flex-wrap items-center gap-4"
          >
            {/* Search */}
            <SearchBar onResults={(r, q) => { setSearchResults(r); setSearchQuery(q); }} />

            <div className="flex-1" />

            {/* Result count */}
            {searchResults === null && <ResultStats total={totalResults} filters={filters} />}
            {searchResults !== null && (
              <span className="text-[9px] font-black tracking-[0.2em] text-gray-500">
                <span className="text-white">{searchResults.length}</span> RESULTS FOR "{searchQuery}"
              </span>
            )}

            {/* Sort */}
            <div className="relative">
              <button onClick={() => setShowSortDropdown(v => !v)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/60 border border-white/5 hover:border-white/15 transition-all text-[10px] font-black tracking-[0.15em] text-gray-400 hover:text-white">
                {currentSort.icon} {currentSort.label}
                <ChevronDown className={`w-3 h-3 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-14 right-0 bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[200px]">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => { setFilters(f => ({ ...f, sort: opt.value })); setShowSortDropdown(false); }}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-[9px] font-black tracking-[0.2em] transition-all ${filters.sort === opt.value ? 'bg-brand/20 text-brand' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View toggles */}
            <div className="flex items-center gap-1 bg-black/60 border border-white/5 rounded-2xl p-1">
              {([['grid', <Grid3X3 className="w-3.5 h-3.5" />], ['large', <Layers className="w-3.5 h-3.5" />], ['list', <List className="w-3.5 h-3.5" />]] as const).map(([mode, icon]) => (
                <button key={mode} onClick={() => setViewMode(mode as ViewMode)}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === mode ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Genre quick-pick horizontal scroll */}
          {!searchResults && (
            <div className="flex gap-2 mb-8 overflow-x-auto custom-scrollbar pb-2">
              <button onClick={() => setFilters(f => ({ ...f, genres: [] }))}
                className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[9px] font-black tracking-[0.2em] border transition-all ${!filters.genres.length ? 'bg-brand border-brand text-white' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>
                ALL GENRES
              </button>
              {GENRES.map(g => (
                <button key={g.id} onClick={() => toggleGenre(g.id.toString())}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-[9px] font-black tracking-[0.2em] border transition-all ${filters.genres.includes(g.id.toString()) ? 'bg-brand border-brand text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>
                  {g.emoji} {g.name.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Results grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${JSON.stringify(filters)}-${searchQuery}-${viewMode}`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {viewMode === 'list' ? (
                <div className="space-y-3">
                  {isLoading ? Array(12).fill(0).map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
                  )) : displayMovies.map((m: any) => <MovieListItem key={m.id} movie={m} />)}
                </div>
              ) : (
                <div className={`grid gap-5 ${viewMode === 'large' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
                  {isLoading ? Array(18).fill(0).map((_, i) => <MovieCardSkeleton key={i} />) :
                    displayMovies.map((m: any, i: number) => (
                      <motion.div key={m.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.5) }}>
                        <MovieCard movie={m} />
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Infinite scroll loader */}
          {searchResults === null && (
            <div ref={loaderRef} className="mt-12 flex flex-col items-center gap-4">
              {isLoading && size > 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-[10px] font-black tracking-[0.3em] text-gray-500">
                  <RefreshCw className="w-4 h-4 text-brand animate-spin" /> DECRYPTING MORE TITLES...
                </motion.div>
              )}
              {!hasMore && allMovies.length > 0 && (
                <div className="text-[9px] font-black tracking-[0.3em] text-gray-600 py-8 border-t border-white/5 w-full text-center">
                  ── END OF TRANSMISSION · {allMovies.length} TITLES DECRYPTED ──
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
