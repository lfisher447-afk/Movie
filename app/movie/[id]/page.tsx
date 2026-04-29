'use client';
import { useEffect, useState, useRef } from 'react';
import { useNexusAuth } from '@/context/AuthContext';
import { useSyncEngine } from '@/hooks/useSyncEngine';
import { Play, Users, Star, Share2, Server, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DedicatedCinema({ params }: { params: { id: string } }) {
  const { user, signIn } = useNexusAuth();
  const [movie, setMovie] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [activeSource, setActiveSource] = useState(0);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  useEffect(() => {
    // Parallel Fetching for Performance
    Promise.all([
        fetch(`/api/tmdb?endpoint=/movie/${params.id}`).then(r => r.json()),
        fetch(`/api/stream?id=${params.id}`).then(r => r.json())
    ]).then(([movieData, streamData]) => {
        setMovie(movieData);
        setSources(streamData.sources || []);
    });
  }, [params.id]);

  const toggleWatchParty = () => {
    if (!user) return signIn();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
  };

  if (!movie) return <div className="h-screen flex items-center justify-center bg-surface"><Loader2 className="animate-spin text-brand w-12 h-12"/></div>;

  return (
    <div className="min-h-screen bg-surface relative overflow-x-hidden">
        {/* Dynamic Cinematic Backdrop */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} className="w-full h-full object-cover opacity-20 scale-110 blur-[100px] saturate-200" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/50" />
        </div>

        <main className="relative z-10 pt-28 px-6 max-w-[1800px] mx-auto pb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-12">
                
                {/* Left: Player Section */}
                <div className="flex-1">
                    <div className="relative group rounded-[2.5rem] overflow-hidden bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 aspect-video">
                        <iframe 
                            src={sources[activeSource]?.url} 
                            className="w-full h-full border-none"
                            allowFullScreen
                            allow="autoplay; encrypted-media"
                        />
                        
                        {roomCode && (
                            <div className="absolute top-6 left-6 bg-brand/90 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/20 shadow-2xl animate-bounce">
                                <Users className="w-4 h-4"/>
                                <span className="font-black tracking-widest text-sm">NEXUS ROOM: {roomCode}</span>
                            </div>
                        )}
                    </div>

                    {/* Node Selector */}
                    <div className="mt-8 flex flex-wrap gap-4 p-4 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-2 px-4 border-r border-white/10 text-gray-500 font-bold text-xs uppercase tracking-widest">
                            <Server className="w-4 h-4"/> Extraction Nodes
                        </div>
                        {sources.map((src, i) => (
                            <button 
                                key={i} 
                                onClick={() => setActiveSource(i)}
                                className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeSource === i ? 'bg-brand text-white shadow-glow translate-y-[-2px]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                {src.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Meta Section */}
                <div className="w-full lg:w-[450px] space-y-8">
                    <div className="glass-card p-10 border-white/5">
                        <h1 className="text-6xl font-display font-black uppercase leading-none mb-4">{movie.title}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="flex items-center gap-1 text-yellow-500 font-black bg-yellow-500/10 px-3 py-1 rounded-xl">
                                <Star className="w-4 h-4 fill-current"/> {movie.vote_average.toFixed(1)}
                            </span>
                            <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">{movie.release_date.split('-')[0]}</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-lg mb-8">{movie.overview}</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={toggleWatchParty} className="bg-gradient-to-br from-indigo-600 to-violet-700 hover:scale-105 active:scale-95 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl">
                                <Users className="w-5 h-5"/> NEXUS PARTY
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all">
                                <Share2 className="w-5 h-5"/> INVITE
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    </div>
  );
}
