'use client';
import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { fetcher } from '@/lib/utils';
import { Power, Check, Plus, Monitor, Server, Activity, Users, ShieldAlert, ShieldCheck, ShieldX, PlayCircle, Radio } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { useNexusAuth } from '@/context/AuthContext'; 
import { Comments } from '@/components/Comments';
import { WatchPartyOverlay } from '@/components/WatchPartyOverlay';
import { NexusPlayer } from '@/components/player/NexusPlayer';

export default function MediaDetail({ params, searchParams }: { params: { id: string }, searchParams: { type?: string, room?: string } }) {
  const isMounted = useMounted();
  const[cinema, setCinema] = useState(!!searchParams.room);
  const [playerMode, setPlayerMode] = useState<'native' | 'relay'>('native');
  const [currentNode, setCurrentNode] = useState(0);
  const [roomCode, setRoomCode] = useState<string | null>(searchParams.room || null);
  
  const type = searchParams.type === 'tv' ? 'tv' : 'movie';
  const isTv = type === 'tv';
  
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const[adBlockMode, setAdBlockMode] = useState<'strict' | 'relaxed' | 'off'>('strict');
  
  const { watchlist, toggleWatchlist, addToHistory } = useStore();
  const { user } = useNexusAuth(); 

  const { data: media } = useSWR(`/api/tmdb?endpoint=/${type}/${params.id}`, fetcher);
  const proxyUrl = `/api/extractor?id=${params.id}&type=${type}&s=${selectedSeason}&e=${selectedEpisode}`;
  const { data: streamData } = useSWR(cinema && playerMode === 'native' ? proxyUrl : null, fetcher);
  const { data: streams } = useSWR(cinema && playerMode === 'relay' ? `/api/stream?id=${params.id}&type=${type}` : null, fetcher);

  const videoRef = useRef<HTMLIFrameElement | HTMLVideoElement | any>(null);

  const addToHistoryOnce = useRef(false);
  useEffect(() => { 
      if (media && !addToHistoryOnce.current) { 
          addToHistory({
             id: media.id, title: media.title || media.name, poster_path: media.poster_path,
             media_type: type, vote_average: media.vote_average, release_date: media.release_date || media.first_air_date
          });
          addToHistoryOnce.current = true;
      } 
  }, [media, type, addToHistory]);

  if (!isMounted || !media) return <div className="h-screen bg-surface flex items-center justify-center"><Activity className="animate-spin text-brand w-16 h-16" /></div>;

  const isSaved = watchlist.some((m: any) => m.id === media.id);

  const initializeWatchParty = () => {
      if (!user) return toast.error('Nexus Authentication Required to Host');
      const code = `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      setRoomCode(code); setCinema(true);
      window.history.pushState({}, '', `?type=${type}&room=${code}`);
      toast.success(`ROOM SECURE: IDENTIFIER ${code}`);
  };

  return (
    <div className={`min-h-screen transition-all duration-[1200ms] ease-out ${cinema ? 'bg-black' : 'bg-transparent'}`}>
      <div className={`absolute top-0 w-full h-[120vh] -z-10 transition-opacity duration-[1500ms] ${cinema ? 'opacity-0' : 'opacity-40'}`}>
        <Image src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`} alt="Backdrop" fill priority className="object-cover blur-[100px] scale-110" />
      </div>

      <div className={`max-w-[1800px] mx-auto px-6 ${cinema ? 'py-6 h-screen flex flex-col' : 'pt-32 pb-40'}`}>
        <div className={`flex flex-col xl:flex-row gap-10 ${cinema ? 'flex-1 h-full' : ''}`}>
          
          <div className={`flex-1 space-y-6 flex flex-col h-full z-10 transition-all w-full`}>
            {cinema ? (
                <div className="flex-1 flex flex-col relative w-full shadow-2xl rounded-[2rem] border border-white/5 overflow-hidden group/player bg-[#0a0a0f]">
                    {playerMode === 'native' ? (
                        streamData?.streamUrl ? <NexusPlayer streamUrl={streamData.streamUrl} poster={`https://image.tmdb.org/t/p/w1280${media.backdrop_path}`} /> : <div className="w-full h-full flex items-center justify-center text-brand"><Activity className="w-10 h-10 animate-spin" /></div>
                    ) : (
                        <iframe ref={videoRef} src={streams?.sources?.[currentNode]?.url} className="w-full h-full absolute inset-0 bg-black" allowFullScreen />
                    )}

                    <button onClick={() => { setCinema(false); window.history.pushState({}, '', window.location.pathname + `?type=${type}`); setRoomCode(null); }} className="absolute top-6 right-6 p-4 bg-black/60 hover:bg-brand rounded-2xl opacity-0 group-hover/player:opacity-100 z-[150] font-bold text-white transition-all transform hover:scale-105"><Power className="w-5 h-5" /></button>
                </div>
            ) : (
                <div className="w-full aspect-video rounded-[2rem] overflow-hidden relative cursor-pointer group" onClick={() => setCinema(true)}>
                    <Image src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`} alt="Backdrop" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center"><div className="w-24 h-24 bg-brand/90 text-white rounded-full flex items-center justify-center pl-2 shadow-[0_0_50px_rgba(229,9,20,0.8)]"><PlayCircle className="w-10 h-10 fill-current" /></div></div>
                </div>
            )}
            
            {/* Display Player Configuration Source Switcher when Cinema executes */}
            <div className={`flex flex-col gap-4 glass-panel p-6 rounded-3xl w-full border-brand/5 shadow-2xl transition-all ${cinema ? 'mt-4 border-white/10 bg-white/5' : 'animate-reveal'}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full border-b border-white/10 pb-4 gap-4">
                      <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                          <button onClick={() => setPlayerMode('native')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2 ${playerMode === 'native' ? 'bg-brand text-white' : 'text-gray-500 hover:text-white'}`}><Activity className="w-3 h-3" /> NATIVE ENGINE</button>
                          <button onClick={() => setPlayerMode('relay')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2 ${playerMode === 'relay' ? 'bg-brand text-white' : 'text-gray-500 hover:text-white'}`}><Radio className="w-3 h-3" /> RELAY NODES</button>
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

                  {playerMode === 'relay' && (
                      <div className="flex flex-wrap gap-3 w-full max-h-[160px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                          {streams?.sources?.map((s: any, i: number) => (
                              <button key={i} onClick={() => setCurrentNode(i)} className={`px-5 py-3 rounded-2xl text-[9px] font-black tracking-[0.2em] transition-all flex flex-shrink-0 items-center gap-2 ${currentNode === i ? 'bg-brand text-white shadow-brand-glow border-brand' : 'bg-black/60 text-gray-400 hover:text-white hover:bg-white/10 border-white/5'} border`}>
                                  {currentNode === i && <Activity className="w-3 h-3 animate-pulse" />} {s.name}
                              </button>
                          ))}
                      </div>
                  )}
            </div>
          </div>

          {cinema && roomCode ? (
              <WatchPartyOverlay roomCode={roomCode} videoRef={videoRef} onLeave={() => { window.history.pushState({}, '', window.location.pathname + `?type=${type}`); setCinema(false); setRoomCode(null); }} />
          ) : !cinema && (
              <MediaInfoPanel media={media} setCinema={setCinema} toggleWatchlist={toggleWatchlist} isSaved={isSaved} initializeWatchParty={initializeWatchParty} />
          )}
        </div>

        {!cinema && (
            <div className="mt-16 max-w-[1250px] animate-reveal" style={{ animationDelay: '0.4s' }}>
                <Comments movieId={params.id} />
            </div>
        )}
      </div>
    </div>
  );
}

function MediaInfoPanel({ media, setCinema, toggleWatchlist, isSaved, initializeWatchParty }: any) {
    return (
        <div className="w-full xl:w-[480px] space-y-8 flex-shrink-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
            <div className="glass-panel p-10 space-y-8 border-brand/10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="font-nexus text-5xl md:text-7xl leading-[0.85] text-white drop-shadow-2xl mb-5 tracking-wide">{media.title || media.name}</h1>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm font-medium opacity-90 line-clamp-6 drop-shadow-md relative z-10">{media.overview}</p>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 relative z-10">
                    <button onClick={() => { toggleWatchlist(media); toast.success(isSaved ? 'VAULT PURGED' : 'VAULT SECURED'); }} className={`btn-nexus h-16 shadow-2xl border border-transparent ${isSaved ? 'bg-brand text-white shadow-brand-glow hover:bg-brand-hover' : 'bg-white text-black hover:bg-gray-200'}`}>{isSaved ? <Check className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {isSaved ? 'STORED' : 'SECURE'}</button>
                    <button onClick={() => setCinema(true)} className="btn-nexus bg-black/60 h-16 border border-white/10 hover:bg-white/10 text-white hover:border-brand/40 shadow-inner"><Monitor className="w-5 h-5 text-brand"/> CINEMA</button>
                </div>
                <button onClick={initializeWatchParty} className="btn-nexus w-full bg-gradient-to-r from-brand to-red-900 border border-brand/50 text-white h-16 group relative overflow-hidden shadow-brand-glow z-10">
                    <Users className="w-5 h-5 relative z-10"/> <span className="relative z-10">INITIATE WATCH PARTY</span>
                </button>
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
