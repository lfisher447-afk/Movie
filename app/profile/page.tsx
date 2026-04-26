'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { Film, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const [user, setUser] = useState<any>(undefined);
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setUser);
        return () => unsub();
    },[]);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch(e) {
            console.error(e);
        }
    }

    if (user === undefined) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="glass-card p-12 text-center max-w-md w-full">
                    <Film className="w-16 h-16 text-brand mx-auto mb-6" />
                    <h1 className="text-3xl font-black mb-4">Welcome to Omnimux</h1>
                    <p className="text-gray-400 mb-8">Sign in to save your watchlist, use the watch party room, and post comments.</p>
                    <button onClick={handleLogin} className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6"/> Sign in with Google
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32 px-6 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-10 flex items-center gap-3"><span className="w-2 h-8 bg-brand block"></span> Subscriber Profile</h1>
            
            <div className="glass-card p-8 flex items-center gap-8 mb-10">
                <img src={user.photoURL} className="w-24 h-24 rounded-full border-4 border-surface" />
                <div>
                    <h2 className="text-3xl font-bold">{user.displayName}</h2>
                    <p className="text-gray-400">{user.email}</p>
                </div>
                <button onClick={() => signOut(auth)} className="ml-auto bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2">
                    <LogOut className="w-5 h-5"/> Sign out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-light p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold mb-4 text-brand">Your Watchlist</h3>
                    <p className="text-gray-500">Feature synched with local Zustand store. Add movies from the discover page.</p>
                </div>
                <div className="bg-surface-light p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold mb-4 text-blue-500">Watch History</h3>
                    <p className="text-gray-500">All movies tracked across your Omnimux synced sessions.</p>
                </div>
            </div>
        </div>
    )
}
