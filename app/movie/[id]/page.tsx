'use client';
import { useEffect, useState, useRef } from 'react';
import { Play, Users, Calendar, Star, Clapperboard, Layers } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Comments } from '@/components/Comments';
import { WatchPartyOverview } from '@/components/WatchPartyOverview';

export default function MovieDetail({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('room');
  
  const [movie, setMovie] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState(0);
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const isHost = useRef(false);

  useEffect(() => {
    // Load metadata
    fetch(`/api/tmdb?endpoint=/movie/${params.id}`).then(r => r.json()).then(setMovie);
    
    // Load OMSS Links (Backend Extractor)
    fetch(`/api/stream?type=movie&id=${params.id}`).then(r => r.json()).then(data => {
        if(data.sources) setSources(data.sources);
    });
  }, [params.id]);

  const createParty = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    window.location.search = `?room=${code}`;
  };

  if (!movie || sources.length === 0) return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Resoloring OMSS Sources & Metadata...</p>
      </div>
  );

  const currentSource = sources[selectedSource];

  return (
    <div className="min-h-screen bg-surface">
        {/* Dynamic Backdrop */}
        <div className="absolute top-0 left-0 w-full h-[70vh] opacity-20 pointer-events-none">
            <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} className="w-full h-full object-cover blur-[10px] scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
        </div>

        <div className="pt-32 px-6 md:px-12 max-w-[1400px] mx-auto pb-20 relative z-10">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* LEFT: Player Area */}
                <div className="w-full lg:w-3/4">
                    <div className="flex justify-between items-end mb-6">
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-lg">{movie.title}</h1>
                        {!roomCode && (
                        <button onClick={createParty} className="bg-white text-black hover:bg-brand hover:text-white px-6 py-3 rounded-xl flex gap-2 font-bold whitespace-nowrap transition-colors shadow-xl">
                            <Users className="w-5 h-5"/> Watch Party
                        </button>
                        )}
                    </div>

                    <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 relative group">
                        
                        {roomCode && <WatchPartyOverview roomCode={roomCode} videoRef={videoRef} isHostRef={isHost} />}
                        
                        {/* Using Iframe for robust fallback. In full app, direct M3U8 plays native via HLS.js */}
                        <iframe 
                            ref={videoRef}
                            src={currentSource.url} 
                            className="w-full h-full border-none" 
                            allowFullScreen 
                            allow="autoplay; fullscreen"
                        />
                    </div>

                    {/* Source Switcher (OMSS Core representation) */}
                    <div className="mt-6 flex items-center gap-4 bg-surface-light p-4 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs flex-shrink-0 flex items-center gap-2">
                            <Layers className="w-4 h-4"/> Servers:
                        </span>
                        {sources.map((src, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedSource(idx)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 transition-all ${selectedSource === idx ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-black/30 hover:bg-white/10 text-gray-400'}`}
                            >
                                {src.name}
                            </button>
                        ))}
                    </div>

                    <Comments movieId={params.id} />
                </div>

                {/* RIGHT: Meta Area */}
                <div className="w-full lg:w-1/4 space-y-6">
                    <div className="glass-card p-6">
                        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full rounded-xl mb-6 shadow-2xl" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2"><Star className="w-4 h-4"/> Rating</span>
                                <span className="font-bold text-yellow-500">{movie.vote_average.toFixed(1)} / 10</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4"/> Release</span>
                                <span className="font-bold text-white">{movie.release_date}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400 flex items-center gap-2"><Clapperboard className="w-4 h-4"/> Runtime</span>
                                <span className="font-bold text-white">{movie.runtime} min</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h3 className="font-bold text-white mb-2">Overview</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{movie.overview}</p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {movie.genres?.map((g:any) => (
                                <span key={g.id} className="bg-white/5 border border-white/10 text-xs px-3 py-1 rounded-md text-gray-300">{g.name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
