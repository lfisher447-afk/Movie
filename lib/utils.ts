import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Used for merging advanced Tailwind states easily
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert seconds into standard player timeline formats
export function formatTime(seconds: number) {
  if (isNaN(seconds)) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}` : `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Format API Dates cleanly
export function formatDate(dateString: string) {
    if(!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}
