'use client';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Activity } from 'lucide-react';

interface NexusPlayerProps {
    streamUrl: string;
    poster?: string;
}

export function NexusPlayer({ streamUrl, poster }: NexusPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const[isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!videoRef.current || !streamUrl) return;
        const video = videoRef.current;
        let hls: Hls;

        setLoading(true);

        if (Hls.isSupported()) {
            hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => { setLoading(false); });
            hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) console.error('HLS Error:', data); });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native support (Safari)
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => setLoading(false));
        }

        return () => { if (hls) hls.destroy(); };
    }, [streamUrl]);

    // Custom Controls Logic
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) videoRef.current.pause();
        else videoRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleProgress = () => {
        if (!videoRef.current) return;
        const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(pct);
    };

    const toggleFullScreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) containerRef.current.requestFullscreen();
        else document.exitFullscreen();
    };

    return (
        <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden group shadow-2xl border border-white/10">
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 text-brand">
                        <Activity className="w-10 h-10 animate-spin" />
                        <span className="font-nexus tracking-widest text-sm uppercase">Decrypting Raw Stream...</span>
                    </div>
                </div>
            )}

            <video 
                ref={videoRef} 
                poster={poster}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleProgress}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Custom Overlay Controls */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 pt-16 pb-4 px-6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-brand rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-brand transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current"/> : <Play className="w-6 h-6 fill-current"/>}
                        </button>
                        <button onClick={toggleMute} className="text-white hover:text-brand transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
                        </button>
                    </div>
                    <div className="flex items-center gap-4 text-white">
                        <button className="hover:text-brand transition-colors"><Settings className="w-5 h-5"/></button>
                        <button onClick={toggleFullScreen} className="hover:text-brand transition-colors"><Maximize className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
