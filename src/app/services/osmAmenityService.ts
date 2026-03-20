export interface NearbyPOI {
    poi_id: string;
    osm_node_id: number;
    name: string;
    category: 'supermarket' | 'pharmacy' | 'library';
    lat: number;
    lng: number;
}

export interface ListingNearbyPOI {
    listing_id: string;
    poi_id: string;
    distance_meters: number;
}

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const CACHE_KEY = 'osm_poi_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
    timestamp: number;
    pois: NearbyPOI[];
}

function readCache(): NearbyPOI[] | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
        return entry.pois;
    } catch {
        return null;
    }
}

function writeCache(pois: NearbyPOI[]): void {
    try {
        const entry: CacheEntry = { timestamp: Date.now(), pois };
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
        // localStorage might be full
    }
}

// Haversine distance in meters
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

export async function fetchPOIsForListings(coords: { lat: number; lng: number }[]): Promise<NearbyPOI[]> {
    const cached = readCache();
    if (cached) {
        console.log('[OSM] Using cached POIs:', cached.length);
        return cached;
    }

    console.log('[OSM] Cache miss – fetching from Overpass API...');

    try {
        let queryBody = '';
        const radius = 1000;

        for (const coord of coords) {
            queryBody += `
  node["shop"="supermarket"](around:${radius},${coord.lat},${coord.lng});
  node["amenity"="pharmacy"](around:${radius},${coord.lat},${coord.lng});
  node["amenity"="library"](around:${radius},${coord.lat},${coord.lng});
`;
        }

        const query = `[out:json][timeout:25];\n(${queryBody});\nout body;`;

        const res = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            body: query,
        });

        if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);

        const data = await res.json();
        const pois: NearbyPOI[] = [];

        if (data && data.elements) {
            for (const el of data.elements) {
                if (el.type !== 'node') continue;

                let category: 'supermarket' | 'pharmacy' | 'library' | null = null;
                if (el.tags?.shop === 'supermarket') category = 'supermarket';
                else if (el.tags?.amenity === 'pharmacy') category = 'pharmacy';
                else if (el.tags?.amenity === 'library') category = 'library';

                if (!category) continue;

                // Deduplicate by node id across multiple `around` circles
                if (pois.some(p => p.osm_node_id === el.id)) continue;

                pois.push({
                    poi_id: `poi-${el.id}`,
                    osm_node_id: el.id,
                    name: el.tags?.name || 'Unnamed ' + category,
                    category,
                    lat: el.lat,
                    lng: el.lon,
                });
            }
        }

        writeCache(pois);
        return pois;
    } catch (err) {
        console.warn('[OSM] Live fetch failed:', err);
        return [];
    }
}

export function getOSMCacheDate(): Date | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        return new Date(entry.timestamp);
    } catch {
        return null;
    }
}

export function clearOSMCache(): void {
    localStorage.removeItem(CACHE_KEY);
}
