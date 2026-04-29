import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merger to prevent style conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
