'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Send, MessageCircle } from 'lucide-react';

export function WatchPartyChat({ roomCode }: { roomCode: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (!roomCode) return;
    const q = query(collection(db, 'rooms', roomCode, 'chat'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snap) => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },[roomCode]);

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    await addDoc(collection(db, 'rooms', roomCode, 'chat'), {
      text: input, uid: user.uid, name: user.displayName || 'Anon', photo: user.photoURL, timestamp: serverTimestamp()
    });
    setInput('');
  };

  return (
    <div className="w-full xl:w-[350px] flex-shrink-0 flex flex-col bg-surface-light/80 border border-white/10 rounded-2xl overflow-hidden h-[600px] shadow-2xl backdrop-blur-xl">
      <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-3">
        <MessageCircle className="text-brand w-5 h-5"/>
        <h3 className="font-bold">Live Room Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col-reverse">
        {[...messages].reverse().map(m => (
          <div key={m.id} className={`flex gap-3 ${m.uid === user?.uid ? 'flex-row-reverse' : ''}`}>
            <img src={m.photo} className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0" />
            <div className={`p-3 text-sm rounded-2xl max-w-[80%] ${m.uid === user?.uid ? 'bg-brand text-white rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm'}`}>
              <span className="text-[10px] opacity-50 block mb-1 font-bold">{m.name}</span>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMsg} className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder={user ? "Message party..." : "Login to chat"} disabled={!user} 
          className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-brand text-sm disabled:opacity-50"/>
        <button type="submit" disabled={!user || !input} className="bg-brand text-white p-2 rounded-xl disabled:opacity-50 hover:bg-brand-hover transition"><Send className="w-4 h-4"/></button>
      </form>
    </div>
  );
}
