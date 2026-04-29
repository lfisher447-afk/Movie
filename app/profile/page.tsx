'use client';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { MovieCard } from '@/components/MovieCard';
import { Power, ShieldCheck, Database, History, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const { user, login, logout, loading } = useAuth();
  const { watchlist, history, clearHistory } = useStore();
  const mounted = useMounted();

  if (loading || !mounted) return <div className="h-screen bg-surface" />;

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full glass-card p-12 text-center space-y-8 animate-cinema-fade">
          <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-3xl flex items-center justify-center mx-auto shadow-brand-glow">
            <ShieldCheck className="text-brand w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h1 className="font-nexus text-4xl">Access Denied</h1>
            <p className="text-gray-500 text-sm leading-relaxed">Secure authentication required to access the Omnimux Vault system.</p>
          </div>
          <button onClick={login} className="btn-nexus bg-white text-black w-full h-16 hover:bg-brand hover:text-white">
            INITIALIZE AUTH_RELAY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-40">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-10 p-12 glass-card border-brand/10 mb-20">
        <img src={user.photoURL || ''} className="w-32 h-32 rounded-[2rem] border-2 border-brand/50 shadow-brand-glow" alt="User" />
        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="font-nexus text-6xl">{user.displayName}</h2>
          <p className="text-brand font-black text-xs tracking-[0.3em] uppercase opacity-60">{user.email}</p>
        </div>
        <button onClick={logout} className="p-4 bg-white/5 hover:bg-brand/20 rounded-2xl border border-white/10 transition-all text-brand">
          <Power className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
        {/* Watchlist Section */}
        <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h3 className="font-nexus text-4xl flex items-center gap-4"><Database className="text-brand" /> THE_VAULT</h3>
                <span className="text-gray-600 font-black text-xs uppercase tracking-widest">{watchlist.length} ITEMS SECURED</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {watchlist.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
        </div>

        {/* Sidebar History */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="font-nexus text-2xl flex items-center gap-3"><History className="text-gray-500"/> LOGS</h3>
            <button onClick={clearHistory} className="text-[10px] font-black text-gray-600 hover:text-brand transition-colors">PURGE_LOGS</button>
          </div>
          <div className="space-y-4">
            {history.slice(0, 8).map((item, idx) => (
               <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-brand/40 transition-all">
                  <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} className="w-12 h-16 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-gray-600 mt-1 uppercase font-black tracking-widest">Relay Accessed</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-700 self-center" />
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
