'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, Send } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

export function Comments({ movieId }: { movieId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, setUser);
    const q = query(collection(db, 'comments'), where('movieId', '==', movieId), orderBy('createdAt', 'desc'));
    const unsubDB = onSnapshot(q, (snap) => setComments(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubAuth(); unsubDB(); };
  }, [movieId]);

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    await addDoc(collection(db, 'comments'), {
      movieId,
      text,
      userId: user.uid,
      userName: user.displayName || user.email.split('@')[0],
      userAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`,
      createdAt: serverTimestamp()
    });
    setText('');
  };

  return (
    <div className="mt-16 glass-card p-6 md:p-10">
      <h2 className="text-2xl font-bold flex items-center gap-3 mb-8"><MessageSquare className="text-brand"/> Community Discussion</h2>
      
      {user ? (
        <form onSubmit={postComment} className="flex gap-4 mb-10">
          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-12 h-12 rounded-full border border-white/20"/>
          <div className="flex-1 relative">
            <input value={text} onChange={e => setText(e.target.value)} type="text" placeholder="Add a public comment..." className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-brand outline-none transition-colors pr-14"/>
            <button type="submit" disabled={!text} className="absolute right-3 top-3 p-2 bg-brand text-white rounded-lg disabled:opacity-50 hover:bg-red-600 transition-colors"><Send className="w-4 h-4"/></button>
          </div>
        </form>
      ) : (
        <div className="bg-black/40 p-6 rounded-xl text-center mb-10 border border-white/5">
          <p className="text-gray-400 mb-4">Sign in to join the conversation</p>
          <a href="/profile" className="inline-block bg-white text-black px-6 py-2 rounded-full font-bold">Sign In</a>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(c => (
          <div key={c.id} className="flex gap-4">
            <img src={c.userAvatar} className="w-10 h-10 rounded-full"/>
            <div className="flex-1 bg-surface-light p-4 rounded-2xl rounded-tl-none border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-white">{c.userName}</span>
                <span className="text-xs text-gray-500">{c.createdAt?.toDate().toLocaleDateString() || 'Just now'}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
