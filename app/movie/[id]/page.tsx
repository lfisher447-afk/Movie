// app/movie/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { 
  Power, Check, Plus, Monitor, Server, Activity, Users, 
  ShieldAlert, ShieldCheck, ShieldX, PlayCircle, Radio
} from 'lucide-react';

import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { useNexusAuth } from '@/context/AuthContext'; 

import { Comments } from '@/components/Comments';
import { WatchPartyOverview } from '@/components/WatchPartyOverview';
import { WatchPartyChat } from '@/components/WatchPartyChat';
import { NexusPlayer } from '@/components/player/NexusPlayer';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MediaDetail({ params }: { params: { id: string } }) {
  const isMounted = useMounted();
  const [cinema, setCinema] = useState(false);
  const [playerMode, setPlayerMode] = useState<'native' | 'relay'>('native');
  const [currentNode, setCurrentNode] = useState(0);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  
  // Media Type / Season States
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  
  // Nexus Security Shield States (For Relay Mode)
  const [adBlockMode, setAdBlockMode] = useState<'strict' | 'relaxed' | 'off'>('strict');
  const [intercepts, setIntercepts] = useState(2); 
  
  const { watchlist, toggleWatchlist, addToHistory } = useStore();
  const { user } = useNexusAuth(); 

  // Data Fetching
  const { data: media } = useSWR(`/api/tmdb?endpoint=/movie/${params.id}`, fetcher);
  const isTv = media?.seasons !== undefined; 
  
  // Fallback iframe streams
  const { data: streams } = useSWR(`/api/stream?id=${params.id}`, fetcher);
  
  // Native Extractor Proxy (Only fetches when in cinema + native mode)
  const proxyUrl = `/api/extractor?id=${params.id}&type=${isTv ? 'tv' : 'movie'}&s=${selectedSeason}&e=${selectedEpisode}`;
  const { data: streamData } = useSWR(cinema && playerMode === 'native' ? proxyUrl : null, fetcher);

  const videoRef = useRef<HTMLIFrameElement>(null);
  const isHostRef = useRef<boolean>(false);

  useEffect(() => { 
      if (media) addToHistory(media); 
      
      // Synchronize Watch Party links directly into runtime via URL
      if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const roomParam = urlParams.get('room');
          if (roomParam) {
              setRoomCode(roomParam);
              setCinema(true);
          }
      }
  }, [media, addToHistory]);

  // Reset ad interceptors whenever you switch a node or change the shield mode
  useEffect(() => {
      setIntercepts(2);
  }, [currentNode, adBlockMode]);

  if (!isMounted || !media) {
    return (
        <div className="h-screen bg-surface flex items-center justify-center overflow-hidden">
            <div className="relative">
                <Activity className="animate-spin text-brand w-16 h-16 relative z-10" />
                <div className="absolute inset-0 bg-brand/30 blur-3xl animate-pulse" />
            </div>
        </div>
    );
  }

  const isSaved = watchlist.some((m: any) => m.id === media.id);

  const initializeWatchParty = () => {
      if (!user) {
          toast.error('Nexus Authentication Required to Host');
          return;
      }
      isHostRef.current = true;
      const code = Math.random().toString(36).substring(2, 9).toUpperCase();
      setRoomCode(code);
      setCinema(true);
      window.history.pushState({}, '', `?room=${code}`);
      toast.success(`ROOM SECURE: IDENTIFIER ${code}`);
  };

  const sandboxProps = adBlockMode === 'off' ? {} : {
      sandbox: adBlockMode === 'strict' 
          ? "allow-scripts allow-same-origin allow-presentation"
          : "allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"
  };

  return (
    <div className={`min-h-screen transition-all duration-[1200ms] ease-out ${cinema ? 'bg-black' : 'bg-transparent'}`}>
      
      {/* Dynamic Ambiance Node */}
      <div className={`absolute top-0 w-full h-[120vh] -z-10 transition-opacity duration-[1500ms] ${cinema ? 'opacity-0' : 'opacity-40'}`}>
        <Image 
            src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`} 
            alt="Backdrop" fill priority className="object-cover blur-[100px] scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/80 to-surface" />
      </div>

      <div className={`max-w-[1800px] mx-auto px-6 ${cinema ? 'py-6 h-screen flex flex-col' : 'pt-32 pb-40'}`}>
        <div className={`flex flex-col xl:flex-row gap-10 ${cinema ? 'flex-1 h-full' : ''}`}>
          
          {/* Left Column: Player & Controls */}
          <div className={`flex-1 space-y-6 flex flex-col h-full z-10 transition-all ${cinema ? 'w-full' : ''}`}>
            
            {cinema ? (
                // ACTIVE CINEMA MODE
                <div className="flex-1 flex flex-col relative w-full shadow-2xl rounded-[2rem] border border-white/5 overflow-hidden group/player bg-[#0a0a0f]">
                    {playerMode === 'native' ? (
                        streamData?.streamUrl ? (
                            <NexusPlayer streamUrl={streamData.streamUrl} poster={`https://image.tmdb.org/t/p/w1280${media.backdrop_path}`} />
                        ) : (
                            <div className="w-full h-full flex flex-col justify-center items-center gap-4 text-brand">
                                 <Activity className="w-10 h-10 animate-spin" /> Fetching Clean Video Stream...
                            </div>
                        )
                    ) : (
                        // RELAY IFRAME FALLBACK
                        <>
                            {adBlockMode === 'relaxed' && intercepts > 0 && (
                              <div 
                                className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group"
                                onClick={(e) => {
                                  e.preventDefault(); e.stopPropagation();
                                  setIntercepts(v => v - 1);
                                  toast.success(`SHIELD: Absorbed invisible popup layer (${intercepts - 1} remaining)`, { icon: '🛡️' });
                                }}
                              >
                                <div className="bg-black/90 text-white px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] border border-brand/50 shadow-[0_0_30px_rgba(229,9,20,0.4)] group-hover:bg-brand transition-colors flex items-center gap-3">
                                  <ShieldAlert className="w-4 h-4 text-brand group-hover:text-white transition-colors" />
                                  INTERCEPTING AD-LAYER... CLICK ANYWHERE TO CLEAR
                                </div>
                              </div>
                            )}
                            <iframe ref={videoRef} src={streams?.sources?.[currentNode]?.url} className="w-full h-full absolute inset-0 bg-black" allowFullScreen {...sandboxProps} />
                        </>
                    )}

                    {roomCode && <WatchPartyOverview roomCode={roomCode} videoRef={videoRef} isHostRef={isHostRef} />}

                    <button onClick={() => {
                        setCinema(false); 
                        if(roomCode) window.history.pushState({}, '', window.location.pathname);
                        setRoomCode(null);
                    }} className="absolute top-6 right-6 p-4 bg-black/60 hover:bg-brand rounded-2xl backdrop-blur-2xl transition-all shadow-2xl z-[150] border border-white/20 text-white opacity-0 group-hover/player:opacity-100 transform hover:scale-105">
                        <Power className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                // INACTIVE CINEMA HERO THUMBNAIL
                <div 
                    className="w-full aspect-video rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden relative cursor-pointer group glass-panel"
                    onClick={() => setCinema(true)}
                >
                    <Image src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`} alt="Backdrop" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-24 h-24 bg-brand/90 text-white rounded-full flex items-center justify-center pl-2 shadow-[0_0_50px_rgba(229,9,20,0.8)] group-hover:scale-110 transition-transform">
                            <PlayCircle className="w-10 h-10 fill-current" />
                        </div>
                    </div>
                </div>
            )}

            {/* TV Show & Source Selectors */}
            <div className={`flex flex-col gap-4 glass-panel p-6 rounded-3xl mx-auto w-full border-brand/5 shadow-2xl transition-all ${cinema ? 'mt-4 border-white/10 bg-white/5' : 'animate-reveal'}`}>
                
                {/* Top Bar: Extractor vs Relay & TV Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full border-b border-white/10 pb-4 gap-4">
                    <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                        <button onClick={() => setPlayerMode('native')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2 ${playerMode === 'native' ? 'bg-brand text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'text-gray-500 hover:text-white'}`}>
                            <Activity className="w-3 h-3" /> NATIVE ENGINE
                        </button>
                        <button onClick={() => setPlayerMode('relay')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2 ${playerMode === 'relay' ? 'bg-brand text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'text-gray-500 hover:text-white'}`}>
                            <Radio className="w-3 h-3" /> RELAY NODES
                        </button>
                    </div>

                    {isTv && (
                        <div className="flex items-center gap-4 p-2 bg-black/40 rounded-2xl border border-white/10">
                            <span className="text-[10px] font-black text-gray-500 tracking-widest ml-2">PARAMETERS:</span>
                            <div className="flex gap-2">
                                <input type="number" min="1" value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-xl border border-white/5 w-20 text-center outline-none focus:border-brand" placeholder="Season" />
                                <input type="number" min="1" value={selectedEpisode} onChange={e => setSelectedEpisode(Number(e.target.value))} className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-xl border border-white/5 w-20 text-center outline-none focus:border-brand" placeholder="Episode" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Bar: Conditional Settings (Shields for Relays) */}
                {playerMode === 'relay' && (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between w-full pt-2 gap-4">
                            <div className="font-nexus text-gray-500 text-sm tracking-[0.2em] flex items-center gap-3">
                                <Server className="w-4 h-4 text-brand animate-pulse"/> ACTIVE_NODES
                            </div>
                            <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                                <span className="text-[9px] font-black tracking-widest text-gray-500 ml-2 hidden sm:block">NEXUS_SHIELD:</span>
                                <div className="flex">
                                    {['strict', 'relaxed', 'off'].map(mode => (
                                      <button key={mode} onClick={() => setAdBlockMode(mode as any)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all uppercase flex items-center gap-2 ${adBlockMode === mode ? 'bg-brand text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'text-gray-500 hover:text-white'}`}>
                                        {mode === 'strict' && <ShieldCheck className="w-3 h-3" />}
                                        {mode === 'relaxed' && <ShieldAlert className="w-3 h-3" />}
                                        {mode === 'off' && <ShieldX className="w-3 h-3" />}
                                        {mode}
                                      </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full max-h-[160px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                          {streams?.sources?.map((s: any, i: number) => (
                              <button key={i} onClick={() => setCurrentNode(i)}
                                className={`px-5 py-3 rounded-2xl text-[9px] font-black tracking-[0.2em] transition-all flex items-center gap-2 ${currentNode === i ? 'bg-brand text-white shadow-brand-glow border-brand' : 'bg-black/60 text-gray-400 hover:text-white hover:bg-white/10 border-white/5'} border flex-shrink-0`}>
                                  {currentNode === i && <Activity className="w-3 h-3 animate-pulse" />}
                                  {s.name}
                              </button>
                          ))}
                        </div>
                    </>
                )}
            </div>
          </div>

          {/* Right Column: Intelligence Panels & Chat */}
          {cinema && roomCode ? (
              <WatchPartyChat roomCode={roomCode} />
          ) : !cinema && (
              <MediaInfoPanel 
                  media={media} 
                  setCinema={setCinema} 
                  toggleWatchlist={toggleWatchlist} 
                  isSaved={isSaved}
                  initializeWatchParty={initializeWatchParty}
                  user={user}
                  adBlockMode={adBlockMode}
                  playerMode={playerMode}
                  currentNodeQuality={streams?.sources?.[currentNode]?.quality}
              />
          )}
        </div>

        {/* Global Agent Communique Terminal */}
        {!cinema && (
            <div className="mt-16 max-w-[1250px] animate-reveal" style={{ animationDelay: '0.4s' }}>
                <Comments movieId={params.id} />
            </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Sub-Components
// -------------------------------------------------------------------------

function MediaInfoPanel({ 
    media, 
    setCinema, 
    toggleWatchlist, 
    isSaved, 
    initializeWatchParty, 
    user, 
    adBlockMode, 
    playerMode,
    currentNodeQuality 
}: any) {
    return (
        <div className="w-full xl:w-[480px] space-y-8 flex-shrink-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
            <div className="glass-panel p-10 space-y-8 border-brand/10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand/5 blur-[100px] pointer-events-none rounded-full" />
                
                <div className="relative z-10">
                    <h1 className="font-nexus text-5xl md:text-7xl leading-[0.85] text-white drop-shadow-2xl mb-5 tracking-wide">{media.title || media.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                        <span className="text-yellow-500 flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] backdrop-blur">
                            <Star rating={media.vote_average?.toFixed(1) || "0.0"} />
                        </span>
                        <span className="bg-black/40 px-3 py-1.5 rounded-xl text-white border border-white/10 shadow-inner">{media.runtime || media.episode_run_time?.[0] || '--'} MIN</span>
                        <span className="bg-brand/10 text-brand px-3 py-1.5 rounded-xl border border-brand/20 shadow-brand-glow">4K HDR</span>
                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/20">{media.release_date?.split('-')[0] || media.first_air_date?.split('-')[0]}</span>
                    </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed text-sm font-medium opacity-90 line-clamp-6 drop-shadow-md relative z-10">{media.overview}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 relative z-10">
                    <button onClick={() => { toggleWatchlist(media); toast.success(isSaved ? 'VAULT PURGED' : 'VAULT SECURED'); }} 
                      className={`btn-nexus h-16 shadow-2xl border border-transparent ${isSaved ? 'bg-brand text-white shadow-brand-glow hover:bg-brand-hover' : 'bg-white text-black hover:bg-gray-200'}`}>
                        {isSaved ? <Check className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {isSaved ? 'STORED' : 'SECURE'}
                    </button>
                    <button onClick={() => setCinema(true)} className="btn-nexus bg-black/60 h-16 border border-white/10 hover:bg-white/10 text-white hover:border-brand/40 shadow-inner">
                        <Monitor className="w-5 h-5 text-brand"/> CINEMA
                    </button>
                </div>

                <button onClick={initializeWatchParty} className="btn-nexus w-full bg-gradient-to-r from-brand to-red-900 border border-brand/50 text-white h-16 group relative overflow-hidden shadow-brand-glow z-10">
                    <div className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                    <Users className="w-5 h-5 relative z-10"/> <span className="relative z-10">INITIATE WATCH PARTY</span>
                </button>
            </div>

            <div className="glass-panel p-8 space-y-6 border-white/5 bg-black/40 shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-brand h-full shadow-brand-glow" />
                <h3 className="font-nexus text-3xl tracking-[0.2em] text-white flex items-center gap-3">
                    <Activity className="w-6 h-6 text-brand drop-shadow-md" /> DIAGNOSTICS
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-gray-500 border-b border-white/5 pb-3">
                        <span>EXTRACTION_LAYER</span>
                        <span className={`${playerMode === 'native' ? 'text-green-400' : 'text-yellow-400'} font-bold flex items-center gap-2`}>
                          <span className={`w-2 h-2 ${playerMode === 'native' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]'} animate-pulse rounded-full`} /> 
                          {playerMode === 'native' ? 'NATIVE PROXY' : 'EXTERNAL RELAY'}
                        </span>
                    </div>
                    {playerMode === 'relay' && (
                        <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-gray-500 border-b border-white/5 pb-3">
                            <span>ADBLOCK_SHIELD</span>
                            <span className={`font-bold flex items-center gap-2 ${adBlockMode === 'strict' ? 'text-green-400' : adBlockMode === 'relaxed' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {adBlockMode === 'strict' && <ShieldCheck className="w-3 h-3" />}
                              {adBlockMode === 'relaxed' && <ShieldAlert className="w-3 h-3" />}
                              {adBlockMode === 'off' && <ShieldX className="w-3 h-3" />}
                              {adBlockMode.toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-gray-500 border-b border-white/5 pb-3">
                        <span>ACTIVE_AGENT</span>
                        <span className="text-white drop-shadow-md">{user ? user.displayName?.toUpperCase() : 'ANONYMOUS_PROXY'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-gray-500">
                        <span>CONNECTION_PING</span>
                        <span className="text-blue-400">{playerMode === 'native' ? '100% BYPASS' : currentNodeQuality || 'STABLE_NODE'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Star({ rating } : { rating: string }) {
    return (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-yellow-500 -mt-0.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg> 
            ⭐ {rating}
        </>
    );
}
