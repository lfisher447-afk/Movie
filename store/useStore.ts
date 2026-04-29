import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'dark' | 'light';
  watchlist: any[];
  history: any[];
  toggleWatchlist: (movie: any) => void;
  addToHistory: (movie: any) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      watchlist: [],
      history:[],
      toggleWatchlist: (movie) => {
        const list = get().watchlist;
        if (list.find(m => m.id === movie.id)) {
          set({ watchlist: list.filter(m => m.id !== movie.id) });
        } else {
          set({ watchlist:[...list, movie] });
        }
      },
      addToHistory: (movie) => {
        const h = get().history.filter(m => m.id !== movie.id);
        // Prepend current movie to history (limit to 50 max)
        set({ history: [{...movie, watchedAt: Date.now()}, ...h].slice(0, 50) });
      },
      clearHistory: () => set({ history:[] })
    }),
    { name: 'omnimux-vault-v2' }
  )
);
