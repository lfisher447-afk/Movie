import Link from 'next/link';
import Image from 'next/image';
import { Star, Play, Check, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function MovieCard({ movie }: { movie: any }) {
    const { watchlist, toggleWatchlist } = useStore();
    const inWatchlist = watchlist.some((m) => m.id === movie.id);
    const hasPoster = !!movie.poster_path;
    const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';

    return (
        <div className="min-w-[160px] md:min-w-[240px] group relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(229,9,20,0.25)] bg-[#0a0a0f]">
            <Link href={`/movie/${movie.id}?type=${type}`} className="block relative w-full aspect-[2/3] overflow-hidden">
                <Image 
                    src={hasPoster ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://ui-avatars.com/api/?name=NO+IMAGE&background=0a0a0f&color=333'} 
                    alt={movie.title || movie.name || "Movie Poster"}
                    fill
                    sizes="(max-width: 768px) 160px, 240px"
                    className="object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" 
                />
                <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_15px_rgba(229,9,20,0.8)]" />
            </Link>
            
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 flex flex-col justify-end translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                <h3 className="font-black text-white line-clamp-1 mb-2 text-sm tracking-wide">{movie.title || movie.name}</h3>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="flex items-center text-[10px] text-yellow-500 font-black tracking-widest bg-yellow-500/10 px-2.5 py-1 rounded-md border border-yellow-500/20">
                        <Star className="w-3 h-3 fill-current mr-1.5"/> {movie.vote_average?.toFixed(1) || 'N/A'}
                    </span>
                    <button onClick={(e) => { e.preventDefault(); toggleWatchlist(movie); }} className={`p-2 rounded-xl transition-colors border ${inWatchlist ? 'bg-brand border-brand text-white' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'}`}>
                        {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
