'use client';
import { useState, useEffect } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import { MovieCardSkeleton } from '@/components/Skeleton';

const GENRES =[ { id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 16, name: "Animation" }, { id: 35, name: "Comedy" }, { id: 878, name: "Sci-Fi" }, { id: 27, name: "Horror" } ];

export default function Discover() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const[genre, setGenre] = useState('');
  const [year, setYear] = useState('2024');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/discover?genre=${genre}&year=${year}`)
      .then(r => r.json()).then(d => { setMovies(d.results || []); setLoading(false); });
  }, [genre, year]);

  return (
    <div className="min-h-screen pt-32 px-6 max-w-[1600px] mx-auto pb-24">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-display font-black uppercase text-white drop-shadow-lg mb-2">Discover Hub</h1>
            <p className="text-gray-400">Filter through millions of titles in the OMSS database.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-surface-light p-3 rounded-2xl border border-white/5 shadow-xl">
             <div className="flex items-center gap-2 px-3 text-gray-500 font-bold border-r border-white/10"><SlidersHorizontal className="w-4 h-4"/> Filters</div>
             <select value={year} onChange={e=>setYear(e.target.value)} className="bg-black/40 text-white outline-none px-4 py-2 rounded-xl border border-white/10 hover:border-brand transition">
                <option value="">Any Year</option><option value="2024">2024</option><option value="2023">2023</option><option value="2022">2022</option>
             </select>
             <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
               <button onClick={()=>setGenre('')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${genre === '' ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'}`}>All</button>
               {GENRES.map(g => (
                 <button key={g.id} onClick={()=>setGenre(g.id.toString())} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${genre === g.id.toString() ? 'bg-brand text-white' : 'text-gray-400 hover:text-white'}`}>{g.name}</button>
               ))}
             </div>
          </div>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
         {loading ? Array(18).fill(0).map((_,i) => <MovieCardSkeleton key={i}/>) : movies.map(m => <MovieCard key={m.id} movie={m} />)}
       </div>
    </div>
  );
}
