'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Power, Check, Plus, Monitor, Server, Activity } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { useNexusAuth } from '@/context/AuthContext'; // Using the exact exported name
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MovieDetail({ params }: { params: { id: string } }) {
  const isMounted = useMounted();
  const [cinema, setCinema] = useState(false);
  const [currentNode, setCurrentNode] = useState(0);
  
  const { watchlist, toggleWatchlist, addToHistory } = useStore();
  const { user } = useNexusAuth(); // Connected securely to Context

  const { data: movie } = useSWR(`/api/tmdb?endpoint=/movie/${params.id}`, fetcher);
  const { data: streams } = useSWR(`/api/stream?id=${params.id}`, fetcher);

  useEffect(() => { if (movie) addToHistory(movie); }, [movie]);

  if (!isMounted || !movie) {
    return (
        <div className="h-screen bg-[#050507] flex items-center justify-center">
            <Activity className="animate-spin text-[#E50914] w-10 h-10" />
        </div>
    );
  }

  const isSaved = watchlist.some((m: any) => m.id === movie.id);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${cinema ? 'bg-black' : 'bg-transparent'}`}>
      
      {/* Background Ambience */}
      <div className={`absolute top-0 w-full h-[120vh] -z-10 transition-opacity duration-1000 ${cinema ? 'opacity-0' : 'opacity-30'}`}>
        <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} className="w-full h-full object-cover blur-[80px] scale-110" alt="Backdrop" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050507]/80 to-[#050507]" />
      </div>

      <div className="max-w-[1700px] mx-auto px-6 pt-32 pb-40">
        <div className="flex flex-col xl:flex-row gap-16">
          
          <div className="flex-1 space-y-10">
            {/* The Player Nexus */}
            <div className={`transition-all duration-1000 overflow-hidden ${cinema ? 'fixed inset-0 z-[100] bg-black flex items-center justify-center p-0' : 'aspect-video glass-panel shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] group'}`}>
                <iframe src={streams?.sources?.[currentNode]?.url} className="w-full h-full" allowFullScreen />
                {cinema && (
                    <button onClick={() => setCinema(false)} className="absolute top-10 right-10 p-5 bg-white/10 hover:bg-[#E50914] rounded-2xl backdrop-blur-3xl transition-all shadow-2xl z-[110] border border-white/10">
                        <Power className="w-6 h-6 text-white" />
                    </button>
                )}
            </div>

            {/* Source Relay Controls */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="font-nexus text-gray-400 text-sm tracking-[0.2em] px-4 border-r border-white/10 flex items-center gap-2">
                    <Server className="w-4 h-4"/> RELAY_NODES
                </div>
                {streams?.sources?.map((s: any, i: number) => (
                    <button key={i} onClick={() => setCurrentNode(i)}
                      className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all ${currentNode === i ? 'bg-[#E50914] text-white shadow-[0_0_25px_rgba(229,9,20,0.5)]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}>
                        STREAM_{i + 1}
                    </button>
                ))}
            </div>
          </div>

          {/* Metadata Matrix */}
          <div className="w-full xl:w-[450px] space-y-12">
            <div className="space-y-6">
                <h1 className="font-nexus text-6xl md:text-8xl leading-none text-white drop-shadow-xl">{movie.title}</h1>
                <div className="flex items-center gap-6 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                    <span className="text-yellow-500 flex items-center gap-1">⭐ {movie.vote_average.toFixed(1)}</span>
                    <span>{movie.runtime} MINUTES</span>
                    <span className="border border-[#E50914]/40 px-2 py-0.5 rounded text-[#E50914]">4K HDR</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm font-medium opacity-90">{movie.overview}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { toggleWatchlist(movie); toast.success(isSaved ? 'VAULT PURGED' : 'VAULT SECURED'); }} 
                  className={`btn-nexus h-16 ${isSaved ? 'bg-[#E50914] text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]' : 'bg-white text-black'}`}>
                    {isSaved ? <Check className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {isSaved ? 'STORED' : 'SECURE TO VAULT'}
                </button>
                <button onClick={() => setCinema(true)} className="btn-nexus bg-white/5 h-16 border border-white/10 hover:bg-white/10 text-white">
                    <Monitor className="w-5 h-5"/> CINEMA_MODE
                </button>
            </div>

            <div className="glass-panel p-8 space-y-6 border-white/5 bg-white/[0.02]">
                <h3 className="font-nexus text-2xl tracking-[0.2em] text-gray-400">Diagnostics</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-gray-400">
                        <span>ENCRYPTION_STATUS</span>
                        <span className="text-green-500 font-bold flex items-center gap-2">
                           <span className="w-2 h-2 bg-green-500 animate-pulse rounded-full" /> ACTIVE
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-gray-400">
                        <span>ACTIVE_USER</span>
                        <span className="text-white">{user ? user.displayName : 'ANONYMOUS'}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
