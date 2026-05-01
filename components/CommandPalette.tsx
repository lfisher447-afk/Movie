'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, TerminalSquare, Mic, Volume2, Globe, Command,
  History, Settings, Zap, ArrowRight, User, Film, Tv, Monitor, RefreshCw, Trash2, Home
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv' | 'person';
  poster_path?: string;
  profile_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const[loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'multi' | 'movie' | 'tv'>('multi');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [ping, setPing] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { history } = useStore();

  const isCommand = query.startsWith('>');

  // 1. Rehydrate Recent Searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem('omnimux-recent-searches');
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  },[]);

  // 2. Measure Ping to Telemetry
  useEffect(() => {
    if (isOpen) {
      const start = Date.now();
      fetch('/api/tmdb?endpoint=/configuration')
        .then(() => setPing(Date.now() - start))
        .catch(() => setPing(-1));
    }
  }, [isOpen]);

  // 3. Search Engine (Uses Abort Controller to prevent multi request spam)
  useEffect(() => {
    if (isCommand) return;
    if (!debouncedQuery.trim()) { setResults([]); setLoading(false); return; }
    
    setLoading(true);
    const controller = new AbortController();
    const fetchSearch = async () => {
      try {
        const endpoint = filter === 'multi' ? '/search/multi' : `/search/${filter}`;
        const res = await fetch(`/api/tmdb?endpoint=${endpoint}&query=${encodeURIComponent(debouncedQuery)}&include_adult=false`, { signal: controller.signal });
        const data = await res.json();
        setResults(data.results?.slice(0, 8) ||[]);
        setSelectedIndex(0);
      } catch (err: any) {
        if (err.name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
    return () => controller.abort();
  },[debouncedQuery, filter, isCommand]);

  // 4. Keyboard Trap & Action Handlers
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { 
          e.preventDefault(); 
          isOpen ? closeCmd() : document.dispatchEvent(new CustomEvent('open-cmd')); 
      }
      if (e.key === 'Escape' && isOpen) closeCmd();

      if (!isOpen) return;

      // Numeric Shortcuts
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (results[idx]) executeAction(results[idx]);
      }

      // Arrows
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, (isCommand ? systemCommands.length : results.length) - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (isCommand) {
          executeSystemCommand(systemCommands[selectedIndex]);
        } else if (results.length > 0) {
          executeAction(results[selectedIndex]);
        } else if (query && !loading) {
           addToRecent(query);
           router.push(`/discover?query=${encodeURIComponent(query)}`);
           closeCmd();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen, results, selectedIndex, query, isCommand]);

  // 5. System Commands Engine
  const systemCommands =[
    { cmd: '> home', icon: Home, desc: 'Return to Nexus Home', action: () => router.push('/') },
    { cmd: '> discover tv', icon: Tv, desc: 'Launch TV Show Matrix', action: () => router.push('/discover?type=tv') },
    { cmd: '> discover movies', icon: Film, desc: 'Launch Movie Matrix', action: () => router.push('/discover') },
    { cmd: '> profile', icon: User, desc: 'Access Agent Profile', action: () => router.push('/profile') },
    { cmd: '> clear cache', icon: Trash2, desc: 'Purge Local Storage', action: () => { localStorage.clear(); toast.success('Cache Purged'); setTimeout(()=>window.location.reload(), 500); } },
    { cmd: '> reload', icon: RefreshCw, desc: 'Re-initialize Client', action: () => window.location.reload() }
  ].filter(c => c.cmd.includes(query.toLowerCase()));

  const closeCmd = () => { setQuery(''); setFilter('multi'); onClose(); };

  const addToRecent = (q: string) => {
    const fresh = [q, ...recent.filter(r => r !== q)].slice(0, 5);
    setRecent(fresh);
    localStorage.setItem('omnimux-recent-searches', JSON.stringify(fresh));
  };

  const executeAction = (m: SearchResult | any) => {
    addToRecent(m.title || m.name || query);
    
    // Simulate Router prefetches
    if (m.media_type === 'person') {
        router.push(`/discover?query=${encodeURIComponent(m.name || '')}`);
    } else {
        const type = m.media_type === 'tv' || m.first_air_date ? 'tv' : 'movie';
        router.push(`/movie/${m.id}?type=${type}`);
    }
    closeCmd();
  };

  const executeSystemCommand = (cmd: any) => {
    if (cmd) { cmd.action(); closeCmd(); }
  };

  // 7. Voice Recognition API Integrations
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Hardware disconnected: Voice API unsupported.");
    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      setQuery(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // 8. Text To Speech (Announcer API)
  const announceOutLoud = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.8; utterance.rate = 1.1; 
    window.speechSynthesis.speak(utterance);
    toast.success("Audio Broadcast Initiated", { icon: <Volume2 className="w-4 h-4 text-brand"/> });
  };

  // 9. Highlight Matching Fuzzy Text
  const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((p, i) => regex.test(p) ? <span key={i} className="text-brand font-black underline decoration-brand/50 decoration-2">{p}</span> : <span key={i}>{p}</span>)}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[10vh] md:pt-[15vh] px-4 backdrop-blur-3xl bg-black/60" onClick={closeCmd}>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(10px)' }} 
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }} 
          exit={{ opacity: 0, scale: 0.95, y: -10, filter: 'blur(10px)' }} 
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()} 
          className="w-full max-w-4xl bg-[#0a0a0f]/95 border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1),_0_0_80px_rgba(229,9,20,0.15)] overflow-hidden flex flex-col max-h-[80vh]"
        >
          
          {/* Header Panel */}
          <div className="flex items-center px-6 py-4 border-b border-white/5 bg-black/40 relative">
            <Search className={`w-6 h-6 transition-colors duration-500 ${loading ? 'text-brand animate-pulse' : 'text-gray-500'}`} />
            
            <input 
              ref={inputRef} autoFocus value={query} onChange={(e) => setQuery(e.target.value)} 
              placeholder="SEARCH NETWORK... (OR TYPE '>' FOR COMMANDS)" 
              className="w-full bg-transparent border-none text-white px-6 py-4 outline-none font-display text-3xl md:text-4xl placeholder:text-gray-800 tracking-wider"
              autoComplete="off" spellCheck="false"
            />
            
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={startListening} className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-brand text-white shadow-[0_0_20px_rgba(229,9,20,0.8)]' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`}/>
                </button>
                <button onClick={closeCmd} className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-2xl transition-all border border-transparent hover:border-red-500/30">
                    <X className="w-5 h-5"/>
                </button>
            </div>

            {/* Matrix Loading Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-brand transition-all duration-300 shadow-[0_0_10px_#E50914]" style={{ width: loading ? '100%' : '0%', opacity: loading ? 1 : 0 }} />
          </div>

          {/* Quick Filters Banner (Only if not command mode) */}
          {!isCommand && (
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                      {(['multi', 'movie', 'tv'] as const).map(f => (
                          <button key={f} onClick={() => {setFilter(f); inputRef.current?.focus();}} className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${filter === f ? 'bg-brand/20 border-brand/50 text-brand' : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}>
                              {f}
                          </button>
                      ))}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-gray-600">
                      <Zap className="w-3 h-3 text-yellow-500"/> PING: {ping > 0 ? `${ping}ms` : '---'}
                  </div>
              </div>
          )}

          {/* Content Matrix Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
            
            {/* Idle State / Local Synced Vault Data */}
            {!query && !isCommand && (
                <div className="space-y-6">
                    {/* Recent Searches (Rehydrated) */}
                    {recent.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black tracking-[0.3em] text-gray-600 flex items-center gap-2 px-4 mb-3"><History className="w-3 h-3"/> RECENT LOGS</p>
                            <div className="flex flex-wrap gap-2 px-4">
                                {recent.map((r, i) => (
                                    <button key={i} onClick={() => setQuery(r)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-gray-400 hover:text-white hover:border-white/30 transition-all">
                                        <History className="w-3 h-3 opacity-50"/> {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Offline Buffer Array Display from Vault */}
                    {history.length > 0 && (
                        <div className="mt-6 border-t border-white/5 pt-6">
                            <p className="text-[10px] font-black tracking-[0.3em] text-gray-600 flex items-center gap-2 px-4 mb-3"><TerminalSquare className="w-3 h-3"/> LOCAL NODE CACHE</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-4">
                                {history.slice(0, 4).map((m: any) => (
                                    <div key={m.id} onClick={(e) => { e.preventDefault(); executeAction(m); }} className="flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-black/40 hover:bg-white/5 hover:border-brand/30 transition-all cursor-pointer group">
                                        <Image unoptimized src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title || m.name)}&background=0a0a0f&color=555`} alt={"Poster"} width={32} height={48} className="w-8 h-12 rounded-lg object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate group-hover:text-brand">{m.title || m.name}</p>
                                            <p className="text-[9px] text-gray-500 font-mono mt-1 opacity-50">Local Buffer Sync</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Skeleton Matrix Loaders */}
            {loading && results.length === 0 && !isCommand && (
                <div className="flex flex-col gap-2">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex gap-4 p-3 rounded-[1.5rem] bg-white/[0.02] border border-white/5 animate-pulse">
                            <div className="w-12 h-16 rounded-xl bg-white/5 flex-shrink-0" />
                            <div className="flex-1 py-2 space-y-3">
                                <div className="h-4 bg-white/10 rounded-md w-1/3" />
                                <div className="h-3 bg-white/5 rounded-md w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Command Action Interpreter */}
            {isCommand && (
                <div className="flex flex-col gap-2">
                    {systemCommands.map((cmd, i) => {
                        const Icon = cmd.icon;
                        const isSelected = selectedIndex === i;
                        return (
                            <div key={cmd.cmd} onClick={() => executeSystemCommand(cmd)} onMouseEnter={() => setSelectedIndex(i)} className={`flex items-center gap-6 p-4 rounded-[1.5rem] cursor-pointer transition-all border ${isSelected ? 'bg-brand/10 border-brand/50 shadow-[0_0_30px_rgba(229,9,20,0.15)]' : 'border-transparent hover:bg-white/5'}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-brand text-white shadow-brand-glow' : 'bg-white/5 text-gray-500'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-mono text-xl ${isSelected ? 'text-brand' : 'text-gray-300'}`}>{cmd.cmd}</h4>
                                    <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">{cmd.desc}</p>
                                </div>
                                {isSelected && <span className="text-[10px] text-brand/50 font-mono animate-pulse">Press Enter</span>}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Real Search Results mapped */}
            {!isCommand && results.length > 0 && (
                <div className="flex flex-col gap-2">
                    {results.map((m, idx) => {
                        const isSelected = selectedIndex === idx;
                        const title = m.title || m.name || 'Unknown Entity';
                        const isPerson = m.media_type === 'person';
                        const imagePath = isPerson ? m.profile_path : m.poster_path;
                        const year = (m.release_date || m.first_air_date || '')?.split('-')[0];
                        
                        return (
                        <div key={m.id} onMouseEnter={() => setSelectedIndex(idx)} onClick={() => executeAction(m)}
                            className={`flex items-center gap-5 p-3 rounded-[1.5rem] cursor-pointer transition-all duration-300 border ${isSelected ? 'bg-white/10 border-white/20 shadow-2xl scale-[1.01] z-10 relative' : 'border-transparent hover:bg-white/5 opacity-80'}`}>
                            
                            <div className="relative w-12 h-16 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/10">
                                <Image 
                                   unoptimized 
                                   src={imagePath ? `https://image.tmdb.org/t/p/w92${imagePath}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=0a0a0f&color=555`} 
                                   alt={title} 
                                   fill 
                                   className={`object-cover transition-all duration-500 ${isSelected ? 'scale-110' : 'grayscale'}`} 
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className={`font-display text-2xl truncate transition-colors ${isSelected ? 'text-brand drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]' : 'text-white'}`}>
                                        <HighlightText text={title} highlight={debouncedQuery} />
                                    </h4>
                                    {isPerson && <span className="text-[8px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md uppercase font-black">Person</span>}
                                    {m.media_type === 'tv' && <span className="text-[8px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-md uppercase font-black">TV Show</span>}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-black tracking-widest uppercase">
                                    <span>{year || 'UNKNOWN'}</span>
                                    {!isPerson && m.vote_average ? <span className="flex items-center text-yellow-500/80"><Star className="w-3 h-3 fill-current mr-1" /> {m.vote_average.toFixed(1)}</span> : null}
                                    {isSelected && <span className="text-white/30 hidden md:inline-block border-l border-white/10 pl-3 ml-1">Alt + {idx + 1}</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: isSelected ? 1 : 0 }}>
                                <button onClick={(e) => announceOutLoud(e, title)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white text-gray-400 transition-all" title="Text-to-Speech">
                                    <Volume2 className="w-4 h-4"/>
                                </button>
                                <div className="w-12 h-12 rounded-full bg-brand/20 border border-brand/50 text-brand flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {/* No Results Deadend Overlay */}
            {!loading && debouncedQuery && results.length === 0 && !isCommand && (
                <div className="py-20 text-center flex flex-col items-center gap-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center shadow-brand-glow animate-pulse">
                        <Monitor className="w-10 h-10 text-brand opacity-80" />
                    </div>
                    <div>
                        <h4 className="font-nexus text-4xl mb-2 tracking-widest text-white drop-shadow-md">DATABANK YIELDED NO RESULTS</h4>
                        <p className="text-[10px] font-mono text-gray-500 uppercase max-w-sm mx-auto leading-relaxed">
                            No active matrices match <span className="text-brand">"{debouncedQuery}"</span>. Try adjusting your search parameters or check your local offline configurations.
                        </p>
                    </div>
                    <button onClick={() => setQuery('')} className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all text-gray-400 mt-2 z-10">
                        CLEAR QUERY BUFFER
                    </button>
                </div>
            )}

          </div>

          {/* Footer Guide System */}
          <div className="bg-black/80 border-t border-white/5 px-6 py-3 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
             <div className="flex items-center gap-6 text-[9px] font-black tracking-widest text-gray-600">
                <span className="flex items-center gap-2"><kbd className="bg-white/10 px-2 py-1 rounded-md border border-white/10 text-gray-400 font-mono">↑↓</kbd> NAVIGATE</span>
                <span className="flex items-center gap-2"><kbd className="bg-white/10 px-2 py-1 rounded-md border border-white/10 text-gray-400 font-mono">ENTER</kbd> EXECUTE</span>
                <span className="hidden md:flex items-center gap-2"><kbd className="bg-white/10 px-2 py-1 rounded-md border border-white/10 text-gray-400 font-mono">ESC</kbd> ABORT</span>
             </div>
             <div className="flex items-center gap-2 text-[8px] font-mono text-gray-700">
                <Globe className="w-3 h-3 text-brand/50"/> NEXUS_CORE_V4_MATRIX
             </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
