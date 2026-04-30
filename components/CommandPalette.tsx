'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Play, TerminalSquare } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const[query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const debouncedQuery = useDebounce(query, 400);
  const router = useRouter();

  useEffect(() => {
    if (!debouncedQuery) { setResults([]); return; }
    fetch(`/api/tmdb?endpoint=/search/multi&query=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json()).then(d => setResults(d.results?.slice(0, 6) || []));
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
      <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-3xl bg-surface/80" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ ease:[0.16, 1, 0.3, 1], duration: 0.4 }}
          onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl bg-surface-card border border-white/10 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1),_0_0_40px_rgba(229,9,20,0.1)] overflow-hidden">
          
          <div className="flex items-center px-6 py-2 border-b border-white/5 bg-black/40">
            <Search className="w-5 h-5 text-brand" />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="QUERY NETWORK DIRECTORY..." 
              className="w-full bg-transparent border-none text-white px-6 py-6 outline-none font-nexus text-2xl placeholder:text-gray-700"/>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-brand/20 rounded-xl transition-all"><X className="w-5 h-5"/></button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-4 bg-surface-card">
            {!query && (
                <div className="py-16 text-center text-gray-600 flex flex-col items-center gap-4">
                    <TerminalSquare className="w-12 h-12 opacity-50 text-brand" />
                    <p className="font-nexus text-xl tracking-[0.2em]">TERMINAL AWAITING INPUT</p>
                </div>
            )}
            
            {results.map((m, idx) => {
              const type = m.media_type === 'tv' || m.first_air_date ? 'tv' : 'movie';
              return (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                 key={m.id} onClick={() => { router.push(`/movie/${m.id}?type=${type}`); onClose(); }} 
                 className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-[1.5rem] cursor-pointer group transition-all border border-transparent hover:border-white/5">
                <Image src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : `https://ui-avatars.com/api/?name=${m.title || m.name}&background=0a0a0f&color=333`} alt={m.title || m.name} width={48} height={64} className="w-12 h-16 rounded-xl object-cover shadow-lg grayscale group-hover:grayscale-0 transition-all" />
                <div className="flex-1">
                  <h4 className="font-nexus text-2xl text-white group-hover:text-brand transition-colors">{m.title || m.name}</h4>
                  <p className="text-[10px] text-gray-500 font-black tracking-widest">{m.release_date?.split('-')[0] || m.first_air_date?.split('-')[0]} • ⭐ {m.vote_average?.toFixed(1)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand text-brand flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </motion.div>
            )})}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
