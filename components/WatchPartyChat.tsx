// components/WatchPartyChat.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, MessageCircle, ShieldAlert } from 'lucide-react';
import { useNexusAuth } from '@/context/AuthContext';

export function WatchPartyChat({ roomCode }: { roomCode: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const[input, setInput] = useState('');
  
  const { user } = useNexusAuth(); // Proper Auth Sync

  useEffect(() => {
    if (!roomCode) return;
    const q = query(collection(db, 'rooms', roomCode, 'chat'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snap) => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },[roomCode]);

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    await addDoc(collection(db, 'rooms', roomCode, 'chat'), {
      text: input, 
      uid: user.uid, 
      name: user.displayName || 'Anon_Agent', 
      photo: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`, 
      timestamp: serverTimestamp()
    });
    setInput('');
  };

  return (
    <div className="w-full xl:w-[420px] flex-shrink-0 flex flex-col bg-surface/50 border border-brand/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(229,9,20,0.15)] backdrop-blur-3xl h-full min-h-[600px] relative z-20">
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand/10 blur-[120px] pointer-events-none" />
      
      <div className="p-8 border-b border-white/5 bg-black/60 flex items-center justify-between relative z-10 shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-brand/20 rounded-2xl flex items-center justify-center border border-brand/40 shadow-brand-glow">
             <MessageCircle className="text-brand w-6 h-6 drop-shadow-md"/>
          </div>
          <div>
              <h3 className="font-nexus text-3xl tracking-widest text-white drop-shadow-lg">ROOM_COMMS</h3>
              <p className="text-[9px] font-black tracking-widest text-brand uppercase flex items-center gap-2 mt-1">
                 <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse shadow-brand-glow" /> LINK ESTABLISHED
              </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar flex flex-col-reverse relative z-10 scroll-smooth">
        {[...messages].reverse().map(m => (
          <div key={m.id} className={`flex gap-4 group/msg ${m.uid === user?.uid ? 'flex-row-reverse' : ''}`}>
            <img src={m.photo} className="w-10 h-10 rounded-2xl border border-white/10 flex-shrink-0 shadow-xl object-cover" />
            <div className={`p-4 text-sm rounded-3xl max-w-[80%] relative shadow-2xl font-medium tracking-wide ${m.uid === user?.uid ? 'bg-gradient-to-br from-brand to-red-800 text-white rounded-tr-sm border border-brand/50' : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-sm hover:bg-white/10 transition-colors'}`}>
              <span className={`text-[8px] font-black tracking-[0.25em] uppercase block mb-1.5 ${m.uid === user?.uid ? 'text-white/60' : 'text-brand'}`}>{m.name}</span>
              <p className="leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center text-center h-full opacity-40 space-y-5 animate-pulse">
               <ShieldAlert className="w-16 h-16 text-white" />
               <p className="font-nexus text-2xl tracking-[0.2em] text-white">COMMS SECURE</p>
               <p className="text-[10px] font-black tracking-[0.2em] text-white uppercase max-w-[200px] leading-relaxed">NO INTERCEPTED PACKETS. INITIATE TRANSMISSION.</p>
           </div>
        )}
      </div>

      <form onSubmit={sendMsg} className="p-5 bg-black/80 border-t border-white/5 flex gap-3 relative z-10 shadow-inner">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder={user ? "TRANSMIT LOG..." : "AUTH REQUIRED"} disabled={!user} 
          className="flex-1 bg-surface border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand text-sm disabled:opacity-50 font-medium placeholder:text-gray-600 transition-all shadow-inner"/>
        <button type="submit" disabled={!user || !input} className="bg-white/10 text-white p-4 rounded-2xl disabled:opacity-30 disabled:grayscale hover:bg-brand hover:shadow-brand-glow transition-all shadow-lg"><Send className="w-5 h-5"/></button>
      </form>
    </div>
  );
}
