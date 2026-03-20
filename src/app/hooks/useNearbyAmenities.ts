import { useState, useEffect, useCallback } from 'react';
import { NearbyPOI, fetchPOIsForListings, clearOSMCache, getOSMCacheDate, getDistanceMeters } from '../services/osmAmenityService';

export type OSMLoadStatus = 'idle' | 'loading' | 'cached' | 'live' | 'error';

export interface OSMAmenitiesState {
    status: OSMLoadStatus;
    poiData: Map<string, NearbyPOI[]>; // Listing ID to POIs mapping
    cacheDate: Date | null;
    error: string | null;
    refresh: () => void;
}

export function useNearbyAmenities(listingsForCoords: { id: string; lat: number; lng: number }[]): OSMAmenitiesState {
    const [status, setStatus] = useState<OSMLoadStatus>('idle');
    const [poiData, setPoiData] = useState<Map<string, NearbyPOI[]>>(new Map());
    const [cacheDate, setCacheDate] = useState<Date | null>(getOSMCacheDate());
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (forceRefresh = false) => {
        if (listingsForCoords.length === 0) return;
        
        if (forceRefresh) clearOSMCache();

        setStatus('loading');
        setError(null);

        try {
            const wasAlreadyCached = !forceRefresh && getOSMCacheDate() !== null;
            const pois = await fetchPOIsForListings(listingsForCoords);

            if (pois.length === 0 && !wasAlreadyCached) {
                setStatus('error');
                setError('Could not load OSM data. Using static amenity scores.');
                return;
            }

            // Map POIs to listings by distance (<1000m)
            const dataMap = new Map<string, NearbyPOI[]>();
            for (const listing of listingsForCoords) {
                const nearby = pois.filter(p => getDistanceMeters(listing.lat, listing.lng, p.lat, p.lng) <= 1000);
                dataMap.set(listing.id, nearby);
            }

            setPoiData(dataMap);
            setCacheDate(getOSMCacheDate());
            setStatus(wasAlreadyCached ? 'cached' : 'live');
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }, [listingsForCoords]);

    useEffect(() => {
        load();
        // Ignoring load from dependency array so it only fetches when listings coordinate base changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listingsForCoords.map(l => l.id).join(',')]);

    const refresh = useCallback(() => { load(true); }, [load]);

    return { status, poiData, cacheDate, error, refresh };
}
