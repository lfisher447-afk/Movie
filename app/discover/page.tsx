'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { MovieCard } from '@/components/MovieCard';
import { SlidersHorizontal, Activity } from 'lucide-react';
import { MovieCardSkeleton } from '@/components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const GENRES =[ 
  { id: 28, name: "Action" }, { id: 12, name: "Adventure" }, 
  { id: 16, name: "Animation" }, { id: 35, name: "Comedy" }, 
  { id: 878, name: "Sci-Fi" }, { id: 27, name: "Horror" } 
];

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Discover() {
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('2024');

  // Dynamic parameterized SWR fetching
  const { data, isLoading } = useSWR(
    `/api/tmdb?endpoint=/discover/movie&with_genres=${genre}&primary_release_year=${year}&sort_by=popularity.desc&include_adult=false`, 
    fetcher
  );

  return (
    <div className="min-h-screen pt-32 px-6 max-w-[1800px] mx-auto pb-40">
       <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-16 gap-10">
          <div>
            <h1 className="font-nexus text-6xl md:text-8xl text-white mb-2">DISCOVER MATRIX</h1>
            <p className="text-gray-500 font-black tracking-[0.2em] text-[10px] uppercase">Query millions of decryptions across the global network.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 glass-panel p-2">
             <div className="flex items-center gap-2 px-6 text-gray-500 font-black text-[10px] tracking-widest uppercase border-r border-white/10">
                <SlidersHorizontal className="w-3 h-3"/> Parameters
             </div>
             
             <select 
                value={year} 
                onChange={e=>setYear(e.target.value)} 
                className="bg-black/60 text-white outline-none px-6 py-3 rounded-2xl border border-white/5 hover:border-brand font-black text-[10px] tracking-widest uppercase transition-all"
             >
                <option value="">ALL CYCLES</option><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option>
             </select>

             <div className="flex flex-wrap gap-2 px-2">
               <button onClick={()=>setGenre('')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${genre === '' ? 'bg-brand text-white shadow-brand-glow' : 'bg-white/5 text-gray-500 hover:text-white'}`}>ANY</button>
               {GENRES.map(g => (
                 <button key={g.id} onClick={()=>setGenre(g.id.toString())} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${genre === g.id.toString() ? 'bg-brand text-white shadow-brand-glow' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
                   {g.name.toUpperCase()}
                 </button>
               ))}
             </div>
          </div>
       </div>

       <AnimatePresence mode="wait">
           <motion.div 
             key={`${genre}-${year}`}
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
             className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
           >
             {isLoading ? (
                Array(18).fill(0).map((_,i) => <MovieCardSkeleton key={i}/>)
             ) : (
                data?.results?.map((m: any) => <MovieCard key={m.id} movie={m} />)
             )}
           </motion.div>
       </AnimatePresence>
    </div>
  );
}
