'use strict';
'use client';
import { useEffect, useState, useRef } from 'react';
import { Play, Users, Calendar, Star, Clapperboard, Layers, BookmarkPlus, Check, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Comments } from '@/components/Comments';
import { WatchPartyOverview } from '@/components/WatchPartyOverview';
import { useStore } from '@/store/useStore';
import { formatDate } from '@/lib/utils';

export default function MovieDetail({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('room');
  
  const [movie, setMovie] = useState<any>(null);
  const[sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState(0);
  const [activeTab, setActiveTab] = useState<'info'|'cast'>('info');

  const { watchlist, toggleWatchlist, addToHistory } = useStore();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const isHost = useRef(false);

  useEffect(() => {
    fetch(`/api/tmdb?endpoint=/movie/${params.id}&append_to_response=credits,videos`).then(r => r.json()).then(data => {
        setMovie(data);
        addToHistory(data); // Log to local DB
    });
    
    fetch(`/api/stream?type=movie&id=${params.id}`).then(r => r.json()).then(data => {
        if(data.sources) setSources(data.sources);
    });
  }, [params.id]);

  const createParty = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    window.location.search = `?room=${code}`;
  };

  if (!movie || sources.length === 0) return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(229,9,20,0.5)]"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Decoding OMSS HLS Streams...</p>
      </div>
  );

  const inWatchlist = watchlist.some(m => m.id === movie.id);
  const currentSource = sources[selectedSource];
  const trailer = movie.videos?.results?.find((v:any) => v.type === "Trailer");

  return (
    <div className="min-h-screen bg-surface pb-24">
        <div className="absolute top-0 left-0 w-full h-[80vh] opacity-10 pointer-events-none fade-out-bottom">
            <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} className="w-full h-full object-cover blur-[20px] scale-110 saturate-150" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
        </div>

        <div className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto z-10 relative">
            
            <div className="flex flex-col xl:flex-row gap-8">
                
                {/* CORE PLAYER AREA */}
                <div className="flex-1 w-full flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3 text-sm text-brand font-bold uppercase tracking-widest">
                                <span>{movie.status}</span> • <span>{movie.runtime} Min</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter drop-shadow-xl text-white">{movie.title}</h1>
                        </div>
                        <div className="flex gap-4">
                            {!roomCode && (
                            <button onClick={createParty} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 active:scale-95 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                                <Users className="w-5 h-5"/> Synced Party
                            </button>
                            )}
                            <button onClick={() => toggleWatchlist(movie)} className={`px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:scale-105 active:scale-95 shadow-xl ${inWatchlist ? 'bg-white text-black' : 'bg-surface-light border border-white/10 text-white hover:border-brand hover:text-brand'}`}>
                                {inWatchlist ? <Check className="w-5 h-5"/> : <BookmarkPlus className="w-5 h-5" />}
                                {inWatchlist ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    </div>

                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)] border border-white/10 relative group ring-1 ring-white/5">
                        {roomCode && <WatchPartyOverview roomCode={roomCode} videoRef={videoRef} isHostRef={isHost} />}
                        
                        <iframe 
                            ref={videoRef}
                            src={currentSource.url} 
                            className="w-full h-full border-none bg-black" 
                            allowFullScreen 
                            allow="autoplay; fullscreen; encrypted-media"
                        />
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-lighter p-4 rounded-xl border border-white/5 shadow-inner">
                        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide max-w-full">
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-xs flex-shrink-0 flex items-center gap-2">
                                <Layers className="w-4 h-4"/> Nodes
                            </span>
                            {sources.map((src, idx) => (
                                <button 
                                    key={idx} onClick={() => setSelectedSource(idx)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold flex-shrink-0 transition-all ${selectedSource === idx ? 'bg-brand text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]' : 'bg-black/30 hover:bg-white/10 text-gray-400 border border-white/5'}`}
                                >
                                    {src.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Comments movieId={params.id} />
                </div>

                {/* META INFO TABS */}
                <div className="w-full xl:w-[400px] flex-shrink-0">
                    <div className="bg-surface-light/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl sticky top-28">
                        
                        <div className="flex border-b border-white/10 mb-6 pb-2 gap-6">
                            <button onClick={()=>setActiveTab('info')} className={`font-bold pb-2 border-b-2 transition-colors ${activeTab === 'info' ? 'text-brand border-brand' : 'text-gray-500 border-transparent hover:text-white'}`}>Details</button>
                            <button onClick={()=>setActiveTab('cast')} className={`font-bold pb-2 border-b-2 transition-colors ${activeTab === 'cast' ? 'text-brand border-brand' : 'text-gray-500 border-transparent hover:text-white'}`}>Cast & Crew</button>
                        </div>

                        {activeTab === 'info' && (
                            <div className="space-y-6 slide-in">
                                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-32 rounded-lg shadow-xl float-left mr-5 mb-2 border border-white/10" />
                                <p className="text-gray-400 text-sm leading-relaxed">{movie.overview}</p>
                                <div className="clear-both pt-4 space-y-4 border-t border-white/5">
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Release Date</span> <span className="font-bold">{formatDate(movie.release_date)}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Revenue</span> <span className="font-bold">${(movie.revenue || 0).toLocaleString()}</span></div>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                    {movie.genres?.map((g:any) => <span key={g.id} className="bg-black/40 border border-white/10 text-xs px-3 py-1.5 rounded text-gray-300 font-medium">{g.name}</span>)}
                                </div>
                                {trailer && (
                                    <a href={`https://youtube.com/watch?v=${trailer.key}`} target="_blank" className="w-full bg-red-600/10 text-brand border border-brand/30 hover:bg-brand hover:text-white mt-6 py-3 rounded-lg flex justify-center items-center gap-2 font-bold transition-all">
                                        <Play className="w-4 h-4"/> Watch Trailer
                                    </a>
                                )}
                            </div>
                        )}

                        {activeTab === 'cast' && (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar slide-in">
                                {movie.credits?.cast?.slice(0, 10).map((c:any) => (
                                    <div key={c.id} className="flex items-center gap-4 bg-black/30 p-2 rounded-xl group hover:bg-white/5 transition border border-transparent hover:border-white/10">
                                        {c.profile_path ? (
                                            <img src={`https://image.tmdb.org/t/p/w185${c.profile_path}`} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs text-gray-600">N/A</div>
                                        )}
                                        <div>
                                            <p className="font-bold text-white text-sm group-hover:text-brand transition-colors">{c.name}</p>
                                            <p className="text-xs text-gray-500">{c.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}
