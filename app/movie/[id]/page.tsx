'use client';
import { useEffect, useState, useRef } from 'react';
import { Play, Users, Star, BookmarkPlus, Check, Share2, Server } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Comments } from '@/components/Comments';
import { WatchPartyChat } from '@/components/WatchPartyChat'; // NEW ADDITION
import { useStore } from '@/store/useStore';
import { fetchTMDB } from '@/lib/tmdb';

export default function MovieDetail({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('room');
  
  const[movie, setMovie] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState(0);

  const { watchlist, toggleWatchlist, addToHistory } = useStore();
  const videoRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchTMDB(`/movie/${params.id}`, { append_to_response: 'credits,similar' })
      .then(data => { setMovie(data); addToHistory(data); });
    
    fetch(`/api/stream?type=movie&id=${params.id}`).then(r => r.json()).then(data => {
        if(data.sources) setSources(data.sources);
    });
  }, [params.id]);

  const createParty = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    window.location.search = `?room=${code}`;
  };

  if (!movie || sources.length === 0) return <div className="h-screen w-full flex items-center justify-center skeleton-bg" />;

  const inWatchlist = watchlist.some(m => m.id === movie.id);

  return (
    <div className="min-h-screen bg-surface pb-24 font-sans">
        {/* Dynamic Massive Backdrop */}
        <div className="absolute top-0 w-full h-[90vh] -z-10 overflow-hidden">
            <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} className="w-full h-full object-cover opacity-20 blur-3xl scale-110 saturate-[2]" />
            <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-surface/80 to-surface" />
        </div>

        <div className="pt-28 px-4 md:px-10 max-w-[1800px] mx-auto relative cursor-default">
            
            {/* Top Meta Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8 mt-4">
                <div>
                    <h1 className="text-5xl md:text-7xl font-display font-black uppercase text-white tracking-tighter drop-shadow-2xl">{movie.title}</h1>
                    <div className="flex items-center gap-4 mt-3 text-sm font-bold text-gray-400">
                        <span className="text-brand border border-brand/30 bg-brand/10 px-2 py-0.5 rounded">{movie.status}</span>
                        <span className="flex items-center text-yellow-400 gap-1"><Star className="w-4 h-4 fill-current"/>{movie.vote_average.toFixed(1)}</span>
                        <span>{movie.runtime} min</span> • <span>{movie.release_date}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                   {!roomCode && (
                     <button onClick={createParty} className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-105 active:scale-95 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                         <Users className="w-5 h-5"/> Host Party Room
                     </button>
                   )}
                   <button onClick={() => toggleWatchlist(movie)} className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 px-6 py-4 rounded-2xl flex items-center justify-center transition-colors">
                     {inWatchlist ? <Check className="w-6 h-6 text-brand"/> : <BookmarkPlus className="w-6 h-6 text-white" />}
                   </button>
                   <button className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 px-6 py-4 rounded-2xl flex items-center justify-center transition-colors">
                     <Share2 className="w-5 h-5 text-white" />
                   </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* LEFT MAIN: PLAYER & METADATA */}
                <div className="flex-1 w-full flex flex-col min-w-0">
                    
                    <div className="bg-black/80 aspect-video rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-[2px] border-white/10 relative ring-1 ring-white/5">
                        {roomCode && (
                          <div className="absolute top-4 left-4 z-50 bg-brand text-white px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-widest shadow-[0_0_20px_rgba(229,9,20,0.8)] border border-red-400 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Live Sync: {roomCode}
                          </div>
                        )}
                        <iframe ref={videoRef} src={sources[selectedSource]?.url} className="w-full h-full bg-black border-none" allowFullScreen allow="autoplay; fullscreen" />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 bg-surface-light p-4 rounded-2xl border border-white/5">
                       <div className="flex items-center gap-2 px-4 text-gray-500 font-bold text-xs uppercase tracking-widest border-r border-white/10"><Server className="w-4 h-4"/> OMSS Nodes</div>
                       {sources.map((src, idx) => (
                           <button key={idx} onClick={() => setSelectedSource(idx)}
                               className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${selectedSource === idx ? 'bg-white text-black translate-y-[-2px]' : 'bg-black/50 text-gray-400 hover:text-white border border-white/5 hover:border-white/20'}`}>
                               {src.name}
                           </button>
                       ))}
                    </div>

                    <p className="mt-10 text-gray-300 text-lg leading-relaxed max-w-4xl">{movie.overview}</p>

                    <div className="w-full mt-16">
                        <Comments movieId={params.id} />
                    </div>
                </div>

                {/* RIGHT SIDEBAR: Chat OR Cast */}
                {roomCode ? (
                    <WatchPartyChat roomCode={roomCode} />
                ) : (
                    <div className="w-full xl:w-[400px] flex-shrink-0 flex flex-col gap-6">
                        <div className="glass-panel p-6 rounded-3xl sticky top-28">
                            <h3 className="font-display text-2xl uppercase tracking-widest font-bold mb-6 text-white flex items-center gap-3">
                                <span className="w-2 h-6 bg-brand block rounded"></span> Cast & Crew
                            </h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                {movie.credits?.cast?.slice(0, 12).map((c:any) => (
                                    <div key={c.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/10 transition group cursor-default">
                                        <img src={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-xl object-cover shadow-md" />
                                        <div>
                                            <p className="font-bold text-white group-hover:text-brand transition text-sm">{c.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{c.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
