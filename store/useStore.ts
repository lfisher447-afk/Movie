import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  watchlist: any[];
  history: any[];
  toggleWatchlist: (movie: any) => void;
  addToHistory: (movie: any) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      history: [],
      toggleWatchlist: (movie) => {
        const list = get().watchlist;
        const exists = list.find(m => m.id === movie.id);
        set({
          watchlist: exists 
            ? list.filter(m => m.id !== movie.id) 
            : [...list, movie]
        });
      },
      addToHistory: (movie) => {
        const current = get().history;
        const filtered = current.filter(m => m.id !== movie.id);
        set({ history: [{ ...movie, lastWatched: Date.now() }, ...filtered].slice(0, 20) });
      },
      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'omnimux-vault-proto',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
