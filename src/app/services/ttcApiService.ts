/**
 * TTC GTFS API Service
 *
 * Fetches live TTC stop data from the City of Toronto Open Data portal.
 * Source: https://open.toronto.ca/dataset/ttc-routes-and-schedules/
 * Package ID: 7795b45e-e65a-4465-81fc-c36b9dfff169
 *
 * Flow:
 *   1. Check localStorage cache (7-day TTL)
 *   2. On cache miss: fetch CKAN package metadata → get ZIP URL
 *   3. Download the GTFS ZIP (~35 MB) via fetch
 *   4. Parse stops.txt with JSZip
 *   5. Filter to subway stations (stop_name contains "STATION")
 *   6. Cache parsed stops in localStorage
 *
 * Falls back to static data if the API or network is unavailable.
 */

import JSZip from 'jszip';

// ── Types ────────────────────────────────────────────────────────────────────

export interface GTFSStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
}

export interface TTCCacheEntry {
  timestamp: number;     // ms since epoch
  stops: GTFSStop[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const CKAN_API =
  'https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show';
const PACKAGE_ID = '7795b45e-e65a-4465-81fc-c36b9dfff169';
const CACHE_KEY = 'ttc_gtfs_stops_v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Cache helpers ─────────────────────────────────────────────────────────────

function readCache(): GTFSStop[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: TTCCacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.stops;
  } catch {
    return null;
  }
}

function writeCache(stops: GTFSStop[]): void {
  try {
    const entry: TTCCacheEntry = { timestamp: Date.now(), stops };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage might be full — ignore
  }
}

// ── CSV parser for stops.txt ──────────────────────────────────────────────────

function parseStopsTxt(csv: string): GTFSStop[] {
  const lines = csv.split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  // Parse header row
  const headers = lines[0].replace(/\r/g, '').split(',');
  const idx = {
    id:   headers.indexOf('stop_id'),
    name: headers.indexOf('stop_name'),
    lat:  headers.indexOf('stop_lat'),
    lon:  headers.indexOf('stop_lon'),
  };

  const stops: GTFSStop[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].replace(/\r/g, '').split(',');
    if (cols.length < 4) continue;

    const name = cols[idx.name]?.trim() ?? '';
    const lat  = parseFloat(cols[idx.lat]);
    const lon  = parseFloat(cols[idx.lon]);

    if (!name || isNaN(lat) || isNaN(lon)) continue;

    stops.push({
      stop_id:  cols[idx.id]?.trim() ?? `stop-${i}`,
      stop_name: name,
      stop_lat: lat,
      stop_lon: lon,
    });
  }
  return stops;
}

// ── Filter to subway stations ─────────────────────────────────────────────────

function getCanonicalStationName(stopName: string): string | null {
  const normalized = stopName.replace(/\s+/g, ' ').trim();
  const upper = normalized.toUpperCase();

  if (!upper.includes('STATION') || upper.includes('LRT')) {
    return null;
  }

  if (upper.includes('BLOOR STATION') || upper.includes('YONGE STATION')) {
    return 'Bloor-Yonge Station';
  }

  const segments = normalized.split(' - ').map((segment) => segment.trim()).filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    if (/Station$/i.test(segments[i])) {
      return segments[i];
    }
  }

  const leadingStationMatch = normalized.match(/^([A-Za-z0-9' .-]+ Station)\b/i);
  return leadingStationMatch ? leadingStationMatch[1].trim() : null;
}

function scoreStationCoordinateSource(stopName: string, canonicalName: string): number {
  const normalized = stopName.replace(/\s+/g, ' ').trim().toUpperCase();
  const canonical = canonicalName.toUpperCase();

  if (normalized === canonical) return 0;
  if (normalized === `${canonical} - SUBWAY PLATFORM`) return 1;
  if (normalized.includes('PLATFORM')) return 2;
  if (normalized.endsWith(canonical)) return 3;
  return 4;
}

function filterSubwayStations(stops: GTFSStop[]): GTFSStop[] {
  const grouped = new Map<string, GTFSStop[]>();

  for (const stop of stops) {
    const canonicalName = getCanonicalStationName(stop.stop_name);
    if (!canonicalName) continue;
    grouped.set(canonicalName, [...(grouped.get(canonicalName) ?? []), stop]);
  }

  return [...grouped.entries()]
    .map(([canonicalName, members]) => {
      const bestRank = Math.min(...members.map((member) => scoreStationCoordinateSource(member.stop_name, canonicalName)));
      const preferredMembers = members.filter(
        (member) => scoreStationCoordinateSource(member.stop_name, canonicalName) === bestRank,
      );

      const avgLat =
        preferredMembers.reduce((sum, member) => sum + member.stop_lat, 0) / preferredMembers.length;
      const avgLon =
        preferredMembers.reduce((sum, member) => sum + member.stop_lon, 0) / preferredMembers.length;

      return {
        stop_id: canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        stop_name: canonicalName,
        stop_lat: Number(avgLat.toFixed(6)),
        stop_lon: Number(avgLon.toFixed(6)),
      };
    })
    .sort((a, b) => a.stop_name.localeCompare(b.stop_name));
}

// ── Main fetch function ───────────────────────────────────────────────────────

/**
 * Returns TTC subway station stops.
 * Uses localStorage cache; fetches live data on cache miss.
 */
export async function fetchTTCSubwayStops(): Promise<GTFSStop[]> {
  // 1. Try cache first
  const cached = readCache();
  if (cached) {
    console.log('[TTC] Using cached stops:', cached.length);
    return cached;
  }

  console.log('[TTC] Cache miss – fetching from CKAN API...');

  try {
    // 2. Fetch package metadata to get the ZIP URL
    const metaRes = await fetch(`${CKAN_API}?id=${PACKAGE_ID}`);
    if (!metaRes.ok) throw new Error(`CKAN API ${metaRes.status}`);
    const meta = await metaRes.json();
    const resources: { url: string; format: string }[] = meta?.result?.resources ?? [];
    const zipResource = resources.find(r => r.format.toUpperCase() === 'ZIP');
    if (!zipResource) throw new Error('No ZIP resource found in package');

    // 3. Download the GTFS ZIP
    console.log('[TTC] Downloading GTFS ZIP from:', zipResource.url);
    const zipRes = await fetch(zipResource.url);
    if (!zipRes.ok) throw new Error(`ZIP fetch failed: ${zipRes.status}`);
    const zipBuffer = await zipRes.arrayBuffer();

    // 4. Unzip and parse stops.txt
    const zip = await JSZip.loadAsync(zipBuffer);
    const stopFile = zip.file('stops.txt');
    if (!stopFile) throw new Error('stops.txt not found in GTFS ZIP');
    const stopsCsv = await stopFile.async('string');

    // 5. Parse, filter to subway stations, cache, return
    const allStops = parseStopsTxt(stopsCsv);
    const subwayStops = filterSubwayStations(allStops);
    console.log('[TTC] Parsed subway stations:', subwayStops.length);

    writeCache(subwayStops);
    return subwayStops;

  } catch (err) {
    console.warn('[TTC] Live fetch failed, returning empty (will use static fallback):', err);
    return [];
  }
}

/**
 * Returns the last time TTC data was cached, or null if not cached.
 */
export function getTTCCacheDate(): Date | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: TTCCacheEntry = JSON.parse(raw);
    return new Date(entry.timestamp);
  } catch {
    return null;
  }
}

/**
 * Force-clear the TTC cache (for manual refresh).
 */
export function clearTTCCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
