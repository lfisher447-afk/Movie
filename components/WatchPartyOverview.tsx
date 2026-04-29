'use client';
import { useEffect, useState } from 'react';
import { Users, Copy, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function WatchPartyOverview({ roomCode, videoRef, isHostRef }: { roomCode: string, videoRef: React.RefObject<HTMLVideoElement | HTMLIFrameElement>, isHostRef: React.MutableRefObject<boolean> }) {
    const [copied, setCopied] = useState(false);
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (!roomCode) return;
        setActive(true);
        const roomRef = doc(db, 'rooms', roomCode);
        
        const unsub = onSnapshot(roomRef, (snap) => {
            if (!snap.exists()) {
                isHostRef.current = true;
                setDoc(roomRef, { playing: false, time: 0, ts: Date.now() });
                return;
            }
            
            try {
                // Safely attempting to sync. If it's an Iframe, reading `currentTime` throws a DOM CORS exception.
                const el = videoRef.current as HTMLVideoElement;
                if (!isHostRef.current && el && el.nodeName === 'VIDEO' && 'currentTime' in el) {
                    const data = snap.data();
                    const expected = data.playing ? data.time + (Date.now() - data.ts) / 1000 : data.time;
                    
                    if (Math.abs(el.currentTime - expected) > 2) {
                        el.currentTime = expected;
                    }
                    if (data.playing && el.paused) el.play().catch(()=>{});
                    if (!data.playing && !el.paused) el.pause();
                }
            } catch (error) {
                // Silently bypass cross-origin iframe security blocks. 
                // In production architectures, Embed iframes require postMessage bridges.
            }
        });
        return () => unsub();
    },[roomCode, videoRef, isHostRef]);

    if (!active) return null;

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="absolute top-4 left-4 z-50 flex gap-2 items-center">
            <div className="bg-brand px-3 py-1.5 rounded-lg font-bold text-xs uppercase shadow-[0_0_15px_rgba(229,9,20,0.6)] flex items-center gap-2 border border-red-400">
                <Users className="w-4 h-4"/> Live Room: {roomCode} {isHostRef.current ? "(Host)" : "(Guest)"}
            </div>
            <button onClick={copyLink} className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/20 text-xs font-bold hover:bg-white/20 transition flex items-center gap-2 text-white">
                {copied ? <Check className="w-4 h-4 text-green-400"/> : <Copy className="w-4 h-4"/>} 
                {copied ? 'Copied Link' : 'Invite'}
            </button>
        </div>
    );
}
