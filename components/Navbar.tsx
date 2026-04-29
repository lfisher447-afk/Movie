'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, LayoutGrid, Disc3 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CommandPalette } from './CommandPalette';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const unsub = onAuthStateChanged(auth, setUser);
    return () => { window.removeEventListener('scroll', handleScroll); unsub(); };
  }, []);

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${
        scrolled ? 'py-4 bg-surface/80 backdrop-blur-2xl border-b border-surface-border' : 'py-8 bg-transparent'
      }`}>
        <div className="max-w-[1700px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 bg-brand rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-[0_0_20px_rgba(229,9,20,0.4)]">
                 <Disc3 className="text-white w-6 h-6 animate-spin-slow" />
              </div>
              <span className="font-cinema text-3xl group-hover:text-brand transition-colors">OMNIMUX</span>
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <button 
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black text-gray-500 transition-all hover:bg-white/10"
            >
              <Search className="w-4 h-4 text-brand"/> 
              <span className="tracking-widest">NEXUS TERMINAL</span> 
              <kbd className="bg-black/40 px-2 py-0.5 rounded text-[8px] border border-white/10">CMD+K</kbd>
            </button>

            <div className="flex items-center gap-5">
              <button className="relative group p-2 rounded-xl hover:bg-white/5 transition-all">
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full animate-pulse" />
              </button>

              {user ? (
                 <Link href="/profile" className="p-1 border border-brand/20 rounded-2xl hover:border-brand transition-all">
                   <img src={user.photoURL} className="w-9 h-9 rounded-xl object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                 </Link>
              ) : (
                 <Link href="/profile" className="btn-nexus bg-white text-black text-[10px] px-6 py-3 tracking-[0.2em] hover:bg-brand hover:text-white">
                   INITIALIZE
                 </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
