import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AdBlockLevel = 'strict' | 'relaxed' | 'off';

interface MediaItem {
  id: string | number;
  title?: string;
  name?: string;
  backdrop_path?: string;
  vote_average?: number;
  runtime?: number;
  release_date?: string;
  first_air_date?: string;
  lastWatched?: number;
}

interface AppState {
  watchlist: MediaItem[];
  history: MediaItem[];
  adBlockMode: AdBlockLevel;
  setAdBlockMode: (mode: AdBlockLevel) => void;
  toggleWatchlist: (movie: MediaItem) => void;
  addToHistory: (movie: MediaItem) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      history: [],
      adBlockMode: 'relaxed',
      
      setAdBlockMode: (mode) => set({ adBlockMode: mode }),

      toggleWatchlist: (movie) => {
        const list = get().watchlist;
        const exists = list.find((m) => m.id === movie.id);
        set({
          watchlist: exists 
            ? list.filter((m) => m.id !== movie.id) 
            : [...list, movie],
        });
      },

      addToHistory: (movie) => {
        const current = get().history;
        const filtered = current.filter((m) => m.id !== movie.id);
        set({
          history: [
            { ...movie, lastWatched: Date.now() },
            ...filtered,
          ].slice(0, 20),
        });
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'omnimux-vault-production',
      storage: createJSONStorage(() => localStorage),
      version: 1, 
    }
  )
);
