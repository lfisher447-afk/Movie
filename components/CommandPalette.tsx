'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Play, TrendingUp } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const debouncedQuery = useDebounce(query, 400);
  const router = useRouter();

  useEffect(() => {
    if (!debouncedQuery) { setResults([]); return; }
    fetch(`/api/tmdb?endpoint=/search/movie&query=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json()).then(d => setResults(d.results?.slice(0, 5) || []));
  }, [debouncedQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); isOpen ? onClose() : document.dispatchEvent(new CustomEvent('open-cmd')); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  },[isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-surface-light border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          <div className="flex items-center px-4 border-b border-white/10">
            <Search className="w-5 h-5 text-gray-400" />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search movies, actors, or genres..." 
              className="w-full bg-transparent border-none text-white px-4 py-5 outline-none text-lg placeholder:text-gray-600"/>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400"/></button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
            {!query && <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3"><TrendingUp className="w-8 h-8 opacity-50"/> Type to search Omnimux Database</div>}
            
            {results.map((m) => (
              <div key={m.id} onClick={() => { router.push(`/movie/${m.id}`); onClose(); }} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl cursor-pointer group transition-all">
                <img src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'https://via.placeholder.com/92x138'} className="w-12 h-16 rounded object-cover shadow-lg" />
                <div className="flex-1">
                  <h4 className="text-white font-bold group-hover:text-brand transition">{m.title}</h4>
                  <p className="text-sm text-gray-400">{m.release_date?.split('-')[0]} • ⭐ {m.vote_average?.toFixed(1)}</p>
                </div>
                <Play className="w-5 h-5 text-brand opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
