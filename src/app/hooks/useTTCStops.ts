/**
 * useTTCStops — React hook for loading live TTC stop data
 *
 * On mount, fetches TTC GTFS stop data from the City of Toronto Open Data API
 * (or reads from localStorage cache if still fresh). Injects the parsed stops
 * into transitData.ts so all distance calculations use live data.
 *
 * Usage:
 *   const { status, stopsCount, cacheDate, refresh } = useTTCStops();
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchTTCSubwayStops, clearTTCCache, getTTCCacheDate } from '../services/ttcApiService';
import { setLiveStops } from '../services/transitData';

export type TTCLoadStatus = 'idle' | 'loading' | 'cached' | 'live' | 'error';

export interface TTCStopsState {
  status: TTCLoadStatus;
  stopsCount: number;
  cacheDate: Date | null;
  error: string | null;
  refresh: () => void;   // Force re-fetch (clears cache first)
}

export function useTTCStops(): TTCStopsState {
  const [status, setStatus]       = useState<TTCLoadStatus>('idle');
  const [stopsCount, setStopsCount] = useState(0);
  const [cacheDate, setCacheDate] = useState<Date | null>(getTTCCacheDate());
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) clearTTCCache();

    setStatus('loading');
    setError(null);

    try {
      const wasAlreadyCached = !forceRefresh && getTTCCacheDate() !== null;
      const stops = await fetchTTCSubwayStops();

      if (stops.length === 0) {
        // Empty means API failed and there was no cache
        setStatus('error');
        setError('Could not load TTC data. Using built-in stop list.');
        return;
      }

      setLiveStops(stops);
      setStopsCount(stops.length);
      setCacheDate(getTTCCacheDate());
      setStatus(wasAlreadyCached ? 'cached' : 'live');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Load on mount
  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(() => { load(true); }, [load]);

  return { status, stopsCount, cacheDate, error, refresh };
}
