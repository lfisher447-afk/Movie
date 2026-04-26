import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'dark' | 'light';
  watchlist: any[];
  toggleWatchlist: (movie: any) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      watchlist:[],
      toggleWatchlist: (movie) => {
        const list = get().watchlist;
        if (list.find(m => m.id === movie.id)) {
          set({ watchlist: list.filter(m => m.id !== movie.id) });
        } else {
          set({ watchlist: [...list, movie] });
        }
      }
    }),
    { name: 'omnimux-storage' }
  )
);
