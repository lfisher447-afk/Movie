'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNexusAuth } from '@/context/AuthContext';
import { Search, Bell, Disc3, Menu } from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import Image from 'next/image';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const[cmdOpen, setCmdOpen] = useState(false);
  const { user, signIn } = useNexusAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  },[]);

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${scrolled ? 'py-4 bg-surface/80 backdrop-blur-2xl border-b border-surface-border' : 'py-8 bg-transparent'}`}>
        <div className="max-w-[1700px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 bg-brand rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-[0_0_20px_rgba(229,9,20,0.4)]">
                 <Disc3 className="text-white w-6 h-6 animate-spin-slow" />
              </div>
              <span className="font-nexus text-3xl group-hover:text-brand transition-colors">OMNIMUX</span>
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <button onClick={() => setCmdOpen(true)} className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black text-gray-500 transition-all hover:bg-white/10">
              <Search className="w-4 h-4 text-brand"/> 
              <span className="tracking-widest">NEXUS TERMINAL</span> 
              <kbd className="bg-black/40 px-2 py-0.5 rounded text-[8px] border border-white/10">CMD+K</kbd>
            </button>

            <div className="flex items-center gap-5">
              <button className="md:hidden" onClick={() => setCmdOpen(true)}><Search className="w-5 h-5 text-white" /></button>
              {user ? (
                 <Link href="/profile" className="p-1 border border-brand/20 rounded-2xl hover:border-brand transition-all">
                   <Image src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="User" width={36} height={36} className="w-9 h-9 rounded-xl object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                 </Link>
              ) : (
                 <button onClick={signIn} className="btn-nexus bg-white text-black text-[10px] px-6 py-3 tracking-[0.2em] hover:bg-brand hover:text-white border-0">
                   INITIALIZE
                 </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
