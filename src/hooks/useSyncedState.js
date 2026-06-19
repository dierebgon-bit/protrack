import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { USER_ID } from '../utils/constants';

const TABLE = 'user_data';
const WRITE_DEBOUNCE_MS = 600;

/**
 * Like useLocalStorage, but Supabase ("user_data" table, one column per
 * dataset) is the source of truth and localStorage is only an instant-paint
 * / offline cache. On mount it fetches the latest value from Supabase and
 * overwrites the cache; every change is cached locally right away and
 * pushed to Supabase (debounced) so edits on one device show up on others.
 */
export function useSyncedState(column, initialValue) {
  const cacheKey = `protrack-${column}`;

  const [value, setValueState] = useState(() => {
    try {
      const item = window.localStorage.getItem(cacheKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[ProTrack] Error leyendo caché local de "${column}":`, error);
      return initialValue;
    }
  });

  const timerRef = useRef(null);
  const pendingRef = useRef(null);

  const writeCache = useCallback((v) => {
    try {
      window.localStorage.setItem(cacheKey, JSON.stringify(v));
    } catch (error) {
      console.error(`[ProTrack] Error guardando caché local de "${column}":`, error);
    }
  }, [cacheKey, column]);

  const pushToSupabase = useCallback(async (v) => {
    try {
      const { error } = await supabase
        .from(TABLE)
        .upsert(
          { user_id: USER_ID, [column]: v, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      if (error) {
        console.error(`[ProTrack] Supabase rechazó la sincronización de "${column}":`, error);
      }
    } catch (error) {
      console.error(`[ProTrack] Error de red sincronizando "${column}" con Supabase:`, error);
    }
  }, [column]);

  const flushPending = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingRef.current !== null) {
      const v = pendingRef.current;
      pendingRef.current = null;
      pushToSupabase(v);
    }
  }, [pushToSupabase]);

  // Carga inicial: Supabase manda. Si falla (offline, RLS, etc.) nos
  // quedamos con la caché local en vez de borrar lo que ya había en pantalla.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from(TABLE)
          .select(column)
          .eq('user_id', USER_ID)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error(`[ProTrack] Error cargando "${column}" desde Supabase, se usa la caché local:`, error);
          return;
        }
        if (data && data[column] !== null && data[column] !== undefined) {
          setValueState(data[column]);
          writeCache(data[column]);
        }
        // Si no hay fila todavía, el primer cambio la crea vía upsert.
      } catch (error) {
        if (!cancelled) {
          console.error(`[ProTrack] Error de red cargando "${column}" desde Supabase, se usa la caché local:`, error);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [column, writeCache]);

  // Antes de que la pestaña se oculte/cierre (recarga, cambio de app en
  // móvil), forzamos cualquier escritura pendiente para no perderla.
  useEffect(() => {
    const flush = () => flushPending();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
      flushPending();
    };
  }, [flushPending]);

  const setValue = useCallback((next) => {
    setValueState((prev) => {
      const resolved = next instanceof Function ? next(prev) : next;
      writeCache(resolved);
      pendingRef.current = resolved;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushPending, WRITE_DEBOUNCE_MS);
      return resolved;
    });
  }, [writeCache, flushPending]);

  return [value, setValue];
}
