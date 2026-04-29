'use client';
import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error("OMSS Framework Core Error:", error); }, [error]);

  return (
    <div className="h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-surface">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="glass-card max-w-xl w-full p-12 text-center relative z-10 border-red-500/20 shadow-[0_0_50px_rgba(229,9,20,0.1)]">
         <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <AlertTriangle className="w-12 h-12 text-brand animate-pulse"/>
         </div>
         <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-4 text-white">System Override Detected</h1>
         <p className="text-gray-400 mb-8 font-medium">The OMSS Extraction engine encountered a critical stream rupture. Retrying the node connection might resolve this.</p>
         
         <div className="flex items-center justify-center gap-4">
            <button onClick={reset} className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition shadow-xl">
               <RefreshCw className="w-5 h-5"/> Reboot Node
            </button>
            <Link href="/" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition">
               <Home className="w-5 h-5"/> Return to Core
            </Link>
         </div>
      </div>
    </div>
  );
}
