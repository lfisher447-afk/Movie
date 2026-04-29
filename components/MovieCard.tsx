import Link from 'next/link';
import { Star, Play, Check, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function MovieCard({ movie }: { movie: any }) {
    const { watchlist, toggleWatchlist } = useStore();
    const inWatchlist = watchlist.some((m) => m.id === movie.id);

    return (
        <div className="min-w-[160px] md:min-w-[240px] group relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(229,9,20,0.2)] bg-surface-light">
            <Link href={`/movie/${movie.id}`} className="block relative w-full aspect-[2/3] overflow-hidden">
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-50 transition-all duration-700" alt={movie.title}/>
                <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-2xl" />
            </Link>
            
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col justify-end translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-auto">
                <Link href={`/movie/${movie.id}`}>
                    <h3 className="font-bold text-white line-clamp-1 mb-2 text-lg">{movie.title || movie.name}</h3>
                </Link>
                <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-yellow-500 font-bold bg-black/50 px-2 py-1 rounded backdrop-blur"><Star className="w-4 h-4 fill-current mr-1.5"/> {movie.vote_average?.toFixed(1)}</span>
                    <button onClick={(e) => { e.preventDefault(); toggleWatchlist(movie); }} className="bg-white/20 hover:bg-brand transition-colors text-white p-2 rounded-full backdrop-blur-md">
                        {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
