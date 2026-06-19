import { useState, useEffect } from 'react';

/**
 * Custom hook that persists state in localStorage.
 * Falls back to initialValue if no stored data exists.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[ProTrack] Error leyendo "${key}" de localStorage, se usa el valor por defecto:`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    // Resolve against React's own pending state (functional update) instead of
    // the `storedValue` closure, so rapid/batched updates never overwrite each
    // other with a stale snapshot.
    setStoredValue((prev) => {
      let valueToStore;
      try {
        valueToStore = value instanceof Function ? value(prev) : value;
      } catch (error) {
        console.error(`[ProTrack] Error calculando el nuevo valor para "${key}":`, error);
        return prev;
      }

      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(
          `[ProTrack] No se pudo guardar "${key}" en localStorage. El cambio solo existe en esta sesión y se perderá al recargar. Causa:`,
          error
        );
      }

      return valueToStore;
    });
  };

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`[ProTrack] Error sincronizando "${key}" desde otra pestaña:`, error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
