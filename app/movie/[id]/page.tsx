'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Power, Server, Share2, Crown, Activity } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNexusAuth } from '@/context/AuthContext'; 
import { Comments } from '@/components/Comments';
import { NexusPlayer } from '@/components/player/NexusPlayer';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MediaDetail({ params }: { params: { id: string } }) {
  const [cinema, setCinema] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  
  const { addToHistory } = useStore();
  const { data: media } = useSWR(`/api/tmdb?endpoint=/movie/${params.id}`, fetcher); // Use /movie for now, adapt for multi-type if building TV
  
  // Call the new Proxy Extractor Route instead of the old Stream route
  const isTv = media?.seasons !== undefined; 
  const proxyUrl = `/api/extractor?id=${params.id}&type=${isTv ? 'tv' : 'movie'}&s=${selectedSeason}&e=${selectedEpisode}`;
  const { data: streamData } = useSWR(cinema ? proxyUrl : null, fetcher);

  useEffect(() => { if (media) addToHistory(media); }, [media]);

  if (!media) {
    return (
        <div className="h-screen bg-surface flex items-center justify-center">
            <Activity className="animate-spin text-brand w-16 h-16 relative z-10" />
        </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-1000 ${cinema ? 'bg-black' : 'bg-transparent'}`}>
      
      {/* Background Ambience */}
      <div className={`absolute top-0 w-full h-[120vh] -z-10 transition-opacity duration-1000 ${cinema ? 'opacity-0' : 'opacity-40'}`}>
        <Image 
            src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`} 
            alt="Backdrop" fill priority className="object-cover blur-[100px] scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/80 to-surface" />
      </div>

      <div className={`max-w-[1800px] mx-auto px-6 ${cinema ? 'py-10 h-screen flex flex-col' : 'pt-32 pb-40'}`}>
        <div className={`flex flex-col xl:flex-row gap-10 ${cinema ? 'flex-1 h-full items-center justify-center' : ''}`}>
          
          <div className={`flex-col space-y-6 ${cinema ? 'w-full max-w-7xl relative group flex' : 'flex-1 flex'}`}>
            
            {/* The Raw Custom Engine */}
            {cinema ? (
                <>
                    {streamData?.streamUrl ? (
                        <NexusPlayer streamUrl={streamData.streamUrl} poster={`https://image.tmdb.org/t/p/w1280${media.backdrop_path}`} />
                    ) : (
                        <div className="w-full aspect-video bg-[#0a0a0f] rounded-[2rem] border border-white/5 flex flex-col justify-center items-center gap-4 text-brand">
                             <Activity className="w-10 h-10 animate-spin" /> Fetching Clean Video Stream...
                        </div>
                    )}
                    <button onClick={() => setCinema(false)} className="absolute -top-16 right-0 p-3 bg-white/5 hover:bg-brand rounded-xl backdrop-blur-md transition-all text-white border border-white/10">
                        <Power className="w-5 h-5" />
                    </button>
                    {isTv && (
                        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 mt-4">
                            <span className="text-[10px] font-black text-gray-400">TV SHOW CONTROLS</span>
                            <input type="number" min="1" value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} className="bg-black/50 text-white text-xs px-3 py-1 rounded-md" placeholder="Season" />
                            <input type="number" min="1" value={selectedEpisode} onChange={e => setSelectedEpisode(Number(e.target.value))} className="bg-black/50 text-white text-xs px-3 py-1 rounded-md" placeholder="Episode" />
                        </div>
                    )}
                </>
            ) : (
                <div 
                    className="w-full aspect-video rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden relative cursor-pointer group"
                    onClick={() => setCinema(true)}
                >
                    <Image src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`} alt="Backdrop" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-24 h-24 bg-brand/90 text-white rounded-full flex items-center justify-center pl-2 shadow-[0_0_50px_rgba(229,9,20,0.8)] group-hover:scale-110 transition-transform">
                            <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                    </div>
                </div>
            )}
          </div>

          {!cinema && (
              <MediaInfoPanel media={media} setCinema={setCinema} />
          )}
        </div>

        {!cinema && (
            <div className="mt-16 max-w-[1250px] animate-reveal opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                <Comments movieId={params.id} />
            </div>
        )}
      </div>
    </div>
  );
}

// Sub-Component: Extracts the messy info panel into a modular chunk
function MediaInfoPanel({ media, setCinema }: { media: any, setCinema: (v: boolean) => void }) {
    const { watchlist, toggleWatchlist } = useStore();
    const isSaved = watchlist.some((m: any) => m.id === media.id);

    return (
        <div className="w-full xl:w-[480px] space-y-6 flex-shrink-0 animate-reveal">
            <div className="glass-panel p-10 relative overflow-hidden border-brand/20 shadow-[0_20px_80px_rgba(229,9,20,0.1)]">
                <h1 className="font-nexus text-5xl md:text-6xl text-white mb-4 leading-none">{media.title || media.name}</h1>
                <div className="flex flex-wrap gap-2 text-[10px] font-black tracking-widest text-white mb-6 uppercase">
                    <span className="bg-brand/20 text-brand px-3 py-1 rounded-md border border-brand/30">4K UNLOCKED</span>
                    <span className="bg-white/10 px-3 py-1 rounded-md">{media.release_date?.substring(0,4)}</span>
                    <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-md flex items-center gap-1">⭐ {media.vote_average?.toFixed(1)}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">{media.overview}</p>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setCinema(true)} className="btn-nexus bg-brand text-white shadow-brand-glow hover:bg-red-700 h-14">
                        DIRECT PLAY
                    </button>
                    <button onClick={() => toggleWatchlist(media)} className={`btn-nexus h-14 border ${isSaved ? 'bg-white text-black' : 'bg-transparent border-white/20 hover:border-white/50 text-white'}`}>
                        {isSaved ? 'IN VAULT' : 'SAVE TO VAULT'}
                    </button>
                </div>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-3">
                <div className="flex justify-between text-[10px] font-black tracking-widest text-gray-500 uppercase border-b border-white/5 pb-2">
                    <span>Extraction Layer</span> <span className="text-green-500 flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> PROXY ACTIVE</span>
                </div>
                <div className="flex justify-between text-[10px] font-black tracking-widest text-gray-500 uppercase">
                    <span>AdBlock Status</span> <span className="text-blue-400 text-[9px] badge font-mono border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded">100% BYPASS</span>
                </div>
            </div>
        </div>
    );
}
