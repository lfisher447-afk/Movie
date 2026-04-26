'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, User, Search, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
        window.removeEventListener('scroll', onScroll);
        unsub();
    }
  },[]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 flex items-center justify-between ${scrolled ? 'bg-surface-light/95 backdrop-blur-md shadow-2xl border-b border-white/5' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-brand p-1.5 rounded-md group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(229,9,20,0.5)]">
          <Play className="fill-white text-white w-5 h-5" />
        </div>
        <span className="text-3xl font-display font-bold tracking-tighter text-brand">OMNIMUX</span>
      </Link>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex relative border border-white/10 rounded-full bg-black/40 overflow-hidden px-4 py-1.5 focus-within:border-brand transition-colors">
            <Search className="w-4 h-4 text-gray-400 mt-1 mr-2"/>
            <input 
                type="text" 
                placeholder="Search movies..." 
                className="bg-transparent outline-none text-sm text-white w-48"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && window.location.assign(`/discover?q=${search}`)}
            />
        </div>

        {user ? (
            <div className="flex items-center gap-4 group relative cursor-pointer">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-10 h-10 rounded-full border-2 border-brand object-cover" />
                <div className="absolute right-0 top-12 bg-surface-light border border-white/10 p-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity min-w-[150px]">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-white/5 rounded-lg text-sm mb-1">My Profile</Link>
                    <button onClick={() => signOut(auth)} className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-500 rounded-lg text-sm flex items-center gap-2">
                        <LogOut className="w-4 h-4"/> Sign Out
                    </button>
                </div>
            </div>
        ) : (
            <Link href="/profile" className="bg-brand hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-red-500/30">
              Sign In
            </Link>
        )}
      </div>
    </nav>
  );
}
