'use client';
import { useEffect, useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { Film, LogOut, Loader2, Compass, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { MovieCard } from '@/components/MovieCard';

export default function Profile() {
    const [user, setUser] = useState<any>(undefined);
    const { watchlist, history, clearHistory } = useStore();
    const isMounted = useMounted();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setUser);
        return () => unsub();
    },[]);

    const handleLogin = async () => {
        try { 
            await signInWithPopup(auth, googleProvider); 
        } catch(e) { 
            console.error(e); 
        }
    }

    if (user === undefined) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-brand" /></div>;

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/20 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="bg-surface-light border border-white/10 backdrop-blur-3xl p-12 text-center max-w-lg w-full rounded-2xl shadow-2xl relative z-10">
                    <div className="bg-brand/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-brand/30">
                        <Film className="w-10 h-10 text-brand" />
                    </div>
                    <h1 className="text-4xl font-display font-black mb-4 uppercase tracking-tighter">Your Omnimux Link</h1>
                    <p className="text-gray-400 mb-10 text-sm leading-relaxed">Sign in digitally to backup your lists across devices, write comments, and generate specialized Watch Party sync keys.</p>
                    <button onClick={handleLogin} className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google Logo"/> Authenticate with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 px-6 max-w-[1400px] mx-auto pb-24">
            
            <div className="bg-gradient-to-r from-surface-light to-surface border border-white/5 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 mb-16 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full"></div>
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} referrerPolicy="no-referrer" className="w-32 h-32 rounded-full border-4 border-surface shadow-[0_0_30px_rgba(229,9,20,0.3)] z-10" alt="Profile avatar" />
                <div className="text-center md:text-left z-10">
                    <h2 className="text-4xl font-black mb-2">{user.displayName || 'Cinema Explorer'}</h2>
                    <p className="text-brand font-mono text-sm bg-brand/10 px-3 py-1 rounded inline-block">{user.email}</p>
                </div>
                <button onClick={() => signOut(auth)} className="md:ml-auto bg-red-600 border border-red-500 text-white hover:bg-red-700 px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-red-500/40 flex items-center gap-2 z-10 w-full md:w-auto justify-center">
                    <LogOut className="w-5 h-5"/> Terminate Session
                </button>
            </div>

            <div className="space-y-16">
                <div>
                    <h3 className="text-3xl font-display font-bold mb-8 uppercase flex items-center gap-3 text-white border-b border-white/10 pb-4">
                        <Compass className="text-brand"/> My Watchlist ({isMounted ? watchlist.length : 0})
                    </h3>
                    {!isMounted || watchlist.length === 0 ? (
                        <div className="bg-surface-light p-10 text-center rounded-2xl border border-white/5 border-dashed text-gray-500">
                            No content bookmarked yet. Explore the network.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {watchlist.map((m: any) => <MovieCard key={m.id} movie={m} />)}
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-8">
                        <h3 className="text-3xl font-display font-bold uppercase flex items-center gap-3 text-white">
                            <Film className="text-blue-500"/> Activity Log
                        </h3>
                        {isMounted && history.length > 0 && (
                            <button onClick={clearHistory} className="text-xs font-bold text-gray-500 hover:text-red-500 flex items-center gap-1 transition">
                                <Trash2 className="w-3 h-3"/> Purge
                            </button>
                        )}
                    </div>
                    {!isMounted || history.length === 0 ? (
                        <div className="bg-surface-light p-10 text-center rounded-2xl border border-white/5 border-dashed text-gray-500">
                            No watch history localized on this device.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 opacity-70 hover:opacity-100 transition-opacity">
                            {history.slice(0, 12).map((m: any, i: number) => (
                                <div key={i} className="relative group rounded-xl overflow-hidden pointer-events-none ring-1 ring-white/10 aspect-[2/3]">
                                    <img src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : `https://via.placeholder.com/200x300?text=Unavailable`} className="w-full h-full object-cover opacity-50 contrast-125" alt={m.title} />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2 text-center text-xs font-bold text-white uppercase">
                                        {m.title}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
