'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Users, Star, BookmarkPlus, Check, Share2, Server, 
  Loader2, Info, MessageSquare, Zap, ChevronRight, Maximize2, 
  ExternalLink, ShieldCheck, Heart
} from 'lucide-react';

// Advanced Context & Hooks
import { useNexusAuth } from '@/context/AuthContext';
import { useSyncEngine } from '@/hooks/useSyncEngine';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';

// Components
import { Comments } from '@/components/Comments';
import { WatchPartyChat } from '@/components/WatchPartyChat'; 
import { WatchPartyOverview } from '@/components/WatchPartyOverview'; 
import { MovieCard } from '@/components/MovieCard';

export default function UltimateDedicatedCinema({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCodeFromURL = searchParams.get('room');
  
  // Nexus State
  const { user, signIn } = useNexusAuth();
  const isMounted = useMounted();
  const { watchlist, toggleWatchlist, addToHistory } = useStore();
  
  // Media State
  const [movie, setMovie] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [activeSource, setActiveSource] = useState(0);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [viewers, setViewers] = useState(0);

  // References
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isHost = useRef(!roomCodeFromURL);

  // Sync Engine Logic
  const roomCode = roomCodeFromURL || null;
  const { roomState, broadcastState } = useSyncEngine(roomCode, isHost.current);

  useEffect(() => {
    // Parallel High-Speed Data Acquisition
    const fetchData = async () => {
      try {
        const [movieRes, streamRes] = await Promise.all([
          fetch(`/api/tmdb?endpoint=/movie/${params.id}&append_to_response=credits,similar`).then(r => r.json()),
          fetch(`/api/stream?type=movie&id=${params.id}`).then(r => r.json())
        ]);

        setMovie(movieRes);
        setSimilar(movieRes.similar?.results?.slice(0, 6) || []);
        if (streamRes.sources) setSources(streamRes.sources);
        
        // Add to local encrypted history
        addToHistory(movieRes);
        
        // Simulate real-time viewer traffic
        setViewers(Math.floor(Math.random() * 500) + 50);
      } catch (err) {
        console.error("OMSS Cinema Load Error:", err);
      }
    };

    fetchData();
  }, [params.id]);

  const createWatchParty = () => {
    if (!user) return signIn();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    router.push(`/movie/${params.id}?room=${code}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Cinema link copied to clipboard!");
  };

  if (!movie || sources.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
        <p className="text-gray-500 font-mono text-sm animate-pulse">ESTABLISHING SECURE PROTOCOL...</p>
      </div>
    );
  }

  const inWatchlist = watchlist.some(m => m.id === movie.id);
  const backdrop = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

  return (
    <div className={`min-h-screen bg-surface transition-colors duration-700 ${isTheatreMode ? 'bg-black' : 'bg-surface'}`}>
      {/* Cinematic Nexus Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.img 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2 }}
          src={backdrop} 
          className="w-full h-full object-cover blur-[120px] saturate-[200%]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface" />
      </div>

      <main className={`relative z-10 pt-24 px-4 md:px-10 mx-auto transition-all duration-500 ${isTheatreMode ? 'max-w-full' : 'max-w-[1800px]'}`}>
        
        {/* Header Action Nexus */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand/20 text-brand border border-brand/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 fill-current"/> OMSS Ultra Stream
              </span>
              <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                <Users className="w-3 h-3"/> {viewers} Watching Now
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter text-white drop-shadow-2xl">
              {movie.title}
            </h1>
            <div className="flex items-center gap-6 mt-4 text-gray-400 font-bold">
              <div className="flex items-center text-yellow-500 gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-current"/> {movie.vote_average?.toFixed(1)}
              </div>
              <span className="hover:text-white transition-colors cursor-default">{movie.release_date?.split('-')[0]}</span>
              <span className="hover:text-white transition-colors cursor-default">{movie.runtime} MINUTES</span>
              <div className="hidden md:flex gap-2">
                {movie.genres?.slice(0, 3).map((g: any) => (
                  <span key={g.id} className="text-[10px] border border-white/10 px-2 py-0.5 rounded uppercase">{g.name}</span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-wrap gap-3">
            <button 
              onClick={() => setIsTheatreMode(!isTheatreMode)}
              className="bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 p-4 rounded-2xl transition-all group"
              title="Theatre Mode"
            >
              <Maximize2 className={`w-6 h-6 ${isTheatreMode ? 'text-brand' : 'text-white'}`} />
            </button>
            <button 
              onClick={createWatchParty}
              className="bg-gradient-to-br from-indigo-600 to-purple-700 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
            >
              <Users className="w-5 h-5"/> {roomCode ? 'INVITE FRIENDS' : 'HOST WATCH PARTY'}
            </button>
            <button 
              onClick={() => toggleWatchlist(movie)}
              className="bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-2 transition-all"
            >
              {inWatchlist ? <Check className="w-6 h-6 text-brand"/> : <BookmarkPlus className="w-6 h-6 text-white" />}
              <span className="font-bold hidden sm:block">{inWatchlist ? 'IN VAULT' : 'SAVE TO VAULT'}</span>
            </button>
            <button onClick={handleShare} className="bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 p-4 rounded-2xl transition-all">
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        </div>

        <div className="flex flex-col xl:flex-row gap-10">
          
          {/* PRIMARY CONTENT COLUMN */}
          <div className="flex-1 min-w-0">
            {/* The Cinematic Player */}
            <div className="relative group shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[2.5rem] overflow-hidden border border-white/10 bg-black aspect-video">
               {roomCode && <WatchPartyOverview roomCode={roomCode} videoRef={iframeRef as any} isHostRef={isHost} />}
               <iframe 
                ref={iframeRef}
                src={sources[activeSource]?.url} 
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
               />
               
               <AnimatePresence>
                {isTheatreMode && (
                   <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute bottom-6 right-6 pointer-events-none bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]"
                   >
                     Theatre Mode Active
                   </motion.div>
                )}
               </AnimatePresence>
            </div>

            {/* Extraction Nodes (Server Selector) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/5">
                <div className="flex items-center gap-3 px-4 py-2 border-r border-white/10 text-gray-500 font-black text-xs uppercase tracking-widest col-span-full mb-2">
                  <Server className="w-4 h-4"/> OMSS Nexus Extraction Nodes
                </div>
                {sources.map((src, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveSource(idx)}
                      className={`relative overflow-hidden group px-6 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-between ${activeSource === idx ? 'bg-brand text-white shadow-glow' : 'bg-black/40 text-gray-400 hover:bg-white/5 border border-white/5'}`}
                    >
                      <span className="relative z-10">{src.name}</span>
                      {activeSource === idx ? <Zap className="w-4 h-4 fill-current relative z-10"/> : <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all"/>}
                      {activeSource === idx && (
                        <motion.div layoutId="node_bg" className="absolute inset-0 bg-gradient-to-r from-brand to-red-700" />
                      )}
                    </button>
                ))}
            </div>

            {/* Movie Intel Container */}
            <div className="mt-12 space-y-12">
              <div className="max-w-4xl">
                 <h3 className="text-sm font-black text-brand uppercase tracking-[0.3em] mb-4">Storyline Protocol</h3>
                 <p className="text-xl text-gray-300 leading-relaxed font-medium italic">
                   "{movie.tagline}"
                 </p>
                 <p className="text-lg text-gray-400 leading-relaxed mt-4">
                   {movie.overview}
                 </p>
              </div>

              {/* Advanced Interaction: Comments */}
              <div className="w-full">
                  <Comments movieId={params.id} />
              </div>
            </div>
          </div>

          {/* SECONDARY SIDEBAR COLUMN */}
          <aside className="w-full xl:w-[420px] flex-shrink-0 space-y-8">
            
            {/* Watch Party Nexus / Interaction Card */}
            {roomCode ? (
              <div className="sticky top-28 h-[750px] flex flex-col">
                 <WatchPartyChat roomCode={roomCode} />
              </div>
            ) : (
              <div className="space-y-8 sticky top-28">
                {/* Cast Intelligence Card */}
                <div className="glass-card p-8 rounded-[2rem] border-white/5 overflow-hidden relative">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/10 blur-3xl rounded-full" />
                  <h3 className="font-display text-3xl uppercase font-black mb-6 flex items-center gap-3">
                    <ShieldCheck className="text-brand w-6 h-6"/> Intelligence
                  </h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {movie.credits?.cast?.slice(0, 10).map((c: any) => (
                      <div key={c.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl group cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                        <img 
                          src={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : `https://ui-avatars.com/api/?name=${c.name}`} 
                          className="w-14 h-14 rounded-xl object-cover shadow-2xl group-hover:scale-110 transition-transform" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white group-hover:text-brand transition truncate">{c.name}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-tighter font-bold">{c.character}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"/>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similar Recommendations Nexus */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-2">
                    <Heart className="w-4 h-4"/> Recommended for you
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {similar.map((m) => (
                      <div key={m.id} className="scale-90 hover:scale-100 transition-transform origin-center">
                        <MovieCard movie={m} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Extreme Footer Space */}
      <footer className="mt-40 border-t border-white/5 py-12 text-center">
          <p className="text-gray-600 font-mono text-[10px] tracking-[0.5em] uppercase">
            Omnimux Foundation Edition — Dedicated Hardware Acceleration Enabled
          </p>
      </footer>
    </div>
  );
}
