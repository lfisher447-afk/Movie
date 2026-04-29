'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Search, Bell, Menu } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CommandPalette } from './CommandPalette';

export function Navbar() {
  const[scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    const unsub = onAuthStateChanged(auth, setUser);
    
    const openCmd = () => setCmdOpen(true);
    document.addEventListener('open-cmd', openCmd);

    return () => { window.removeEventListener('scroll', onScroll); unsub(); document.removeEventListener('open-cmd', openCmd); }
  },[]);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4 bg-surface/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl' : 'py-6 bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-brand p-1.5 rounded overflow-hidden relative">
                <div className="absolute inset-0 border-[2px] border-white/20 rounded scale-110 group-hover:scale-100 transition-transform"></div>
                <Play className="fill-white text-white w-5 h-5 relative z-10" />
              </div>
              <span className="text-3xl font-display font-black tracking-tighter text-white drop-shadow-md group-hover:text-brand transition-colors">OMNIMUX</span>
            </Link>
            
            <div className="hidden md:flex gap-8 text-sm font-bold text-gray-300">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/discover" className="hover:text-white transition-colors">Discover</Link>
              <Link href="/profile" className="hover:text-white transition-colors">My Vault</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setCmdOpen(true)} className="hidden md:flex items-center gap-3 bg-black/40 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm text-gray-400 transition cursor-pointer">
              <Search className="w-4 h-4"/> <span>Search title...</span> <kbd className="bg-white/10 px-2 py-0.5 rounded text-xs">⌘K</kbd>
            </button>
            <button className="md:hidden p-2 text-white"><Search onClick={()=>setCmdOpen(true)} className="w-5 h-5"/></button>

            <button className="relative p-2 text-gray-300 hover:text-white transition">
              <Bell className="w-5 h-5"/>
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full animate-pulse blur-[1px]"></span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full"></span>
            </button>

            {user ? (
                <Link href="/profile" className="ring-2 ring-transparent hover:ring-brand rounded-full transition-all">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-10 h-10 rounded-full object-cover shadow-lg" />
                </Link>
            ) : (
                <Link href="/profile" className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-white/20 hover:-translate-y-0.5 whitespace-nowrap">
                  Sign In
                </Link>
            )}
            <button className="md:hidden text-white"><Menu className="w-6 h-6"/></button>
          </div>
        </div>
      </nav>
      
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
