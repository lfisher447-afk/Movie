import { useState, useEffect } from 'react';

// Prevents API spam when users type fast in the global search
export function useDebounce<T>(value: T, delay: number): T {
  const[debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
