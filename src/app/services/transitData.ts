/**
 * TTC Transit Data Service
 *
 * Dual-mode: uses live TTC GTFS data fetched via ttcApiService (with localStorage
 * 7-day cache), and falls back to a curated static list if offline or on first load.
 *
 * Live data source:
 *   City of Toronto Open Data – TTC Routes and Schedules
 *   https://open.toronto.ca/dataset/ttc-routes-and-schedules/
 *   Package ID: 7795b45e-e65a-4465-81fc-c36b9dfff169
 */

import type { GTFSStop } from './ttcApiService';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TransitType = 'Subway' | 'Streetcar' | 'Bus';

export interface TransitStop {
  id: string;
  name: string;
  type: TransitType;
  line: string;
  lat: number;
  lng: number;
}

export interface NearestStop {
  stop: TransitStop;
  walkMinutes: number;
}

// ── Static fallback stops ─────────────────────────────────────────────────────
// Used if the TTC API is unavailable or before the first async fetch completes.
// Subway coordinates are aligned to TTC GTFS station-level / platform records so
// the map markers stay close to the actual station footprint.

export const staticTTCStops: TransitStop[] = [
  // Line 1 (Yonge-University)
  { id: 'bloor-yonge',  name: 'Bloor-Yonge Station',       type: 'Subway',    line: 'Line 1 / Line 2', lat: 43.6710, lng: -79.3864 },
  { id: 'bay',          name: 'Bay Station',               type: 'Subway',    line: 'Line 2',          lat: 43.6701, lng: -79.3899 },
  { id: 'museum',       name: 'Museum Station',            type: 'Subway',    line: 'Line 1',          lat: 43.6672, lng: -79.3935 },
  { id: 'queens-park',  name: "Queen's Park Station",      type: 'Subway',    line: 'Line 1',          lat: 43.6599, lng: -79.3905 },
  { id: 'college',      name: 'College Station',           type: 'Subway',    line: 'Line 1',          lat: 43.6615, lng: -79.3831 },
  { id: 'wellesley',    name: 'Wellesley Station',         type: 'Subway',    line: 'Line 1',          lat: 43.6653, lng: -79.3839 },
  { id: 'spadina',      name: 'Spadina Station',           type: 'Subway',    line: 'Line 1 / Line 2', lat: 43.6673, lng: -79.4037 },
  { id: 'dupont',       name: 'Dupont Station',            type: 'Subway',    line: 'Line 1',          lat: 43.6749, lng: -79.4071 },
  { id: 'ossington',    name: 'Ossington Station',         type: 'Subway',    line: 'Line 2',          lat: 43.6623, lng: -79.4266 },
  { id: 'christie',     name: 'Christie Station',          type: 'Subway',    line: 'Line 2',          lat: 43.6641, lng: -79.4186 },
  { id: 'bathurst',     name: 'Bathurst Station',            type: 'Subway',    line: 'Line 2',          lat: 43.6661, lng: -79.4111 },
  { id: 'st-george',    name: 'St. George Station',          type: 'Subway',    line: 'Line 1 / Line 2', lat: 43.6680, lng: -79.3978 },
  // Streetcars
  { id: 'spadina-bloor', name: 'Spadina Ave & Bloor St',    type: 'Streetcar', line: '510 Spadina',     lat: 43.6658, lng: -79.4026 },
  { id: 'college-spad',  name: 'College St & Spadina Ave',  type: 'Streetcar', line: '506 Carlton',     lat: 43.6574, lng: -79.4015 },
  { id: 'dundas-spad',   name: 'Dundas St & Spadina Ave',   type: 'Streetcar', line: '505 Dundas',      lat: 43.6539, lng: -79.4002 },
  { id: 'king-bath',     name: 'King St & Bathurst St',     type: 'Streetcar', line: '504 King',        lat: 43.6399, lng: -79.4095 },
  { id: 'college-mcc',   name: 'College St & McCaul St',    type: 'Streetcar', line: '506 Carlton',     lat: 43.6577, lng: -79.3944 },
];

// ── Runtime live stops (populated by the React hook after fetch) ───────────────

let _liveStops: TransitStop[] | null = null;
const staticSubwayStops = staticTTCStops.filter((stop) => stop.type === 'Subway');
const staticNonSubwayStops = staticTTCStops.filter((stop) => stop.type !== 'Subway');

/** Called by useTTCStops hook after a successful API fetch */
export function setLiveStops(gtfsStops: GTFSStop[]): void {
  _liveStops = gtfsStops.map((s) => ({
    id:   s.stop_id,
    name: s.stop_name,
    type: 'Subway' as TransitType,
    line: inferLine(s.stop_name),
    lat:  s.stop_lat,
    lng:  s.stop_lon,
  }));
  console.log('[transitData] Live stops loaded:', _liveStops.length);
}

/** Returns currently active stop list (live if available, otherwise static) */
export function getActiveTTCStops(): TransitStop[] {
  return _liveStops ? [..._liveStops, ...staticNonSubwayStops] : staticTTCStops;
}

// ── Line inference ────────────────────────────────────────────────────────────

const LINE_HINTS: [RegExp, string][] = [
  [/spadina|dupont|downsview|finch west|york mills|lawrence|eglinton|davisville|st clair|summerhill|rosedale|bloor.*yonge|wellesley|college|queen.*park|museum|st.*andrew|osgoode|union|king/i, 'Line 1'],
  [/kipling|islington|royal york|old mill|jane|runnymede|high park|keele|dundas west|lansdowne|dufferin|ossington|christie|bathurst|spadina|bay|bloor.*yonge|sherbourne|castle frank|broadview|chester|pape|donlands|greenwood|coxwell|woodbine|main|victoria park/i, 'Line 2'],
  [/kennedy|scarborough|mccow|midland|scarborough centre|ellesmere|morningside|rouge hill/i, 'Line 3 (RT)'],
  [/sheppard.*yonge|bayview.*sheppard|bessarion|leslie|don mills/i, 'Line 4'],
];

function inferLine(stopName: string): string {
  for (const [re, line] of LINE_HINTS) {
    if (re.test(stopName)) return line;
  }
  return 'TTC';
}

// ── Haversine distance ────────────────────────────────────────────────────────

function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the N nearest TTC stops (live or static) to a coordinate.
 * Walk speed: 80 m/min with a 1.25 route factor.
 */
export function getNearestTransitStops(lat: number, lng: number, count = 3): NearestStop[] {
  return getActiveTTCStops()
    .map((stop) => {
      const metres = haversineMetres(lat, lng, stop.lat, stop.lng);
      const walkMinutes = Math.round((metres * 1.25) / 80);
      return { stop, walkMinutes };
    })
    .sort((a, b) => a.walkMinutes - b.walkMinutes)
    .slice(0, count);
}

/**
 * Returns subway stations for Mapbox map rendering.
 * Uses normalized live GTFS stations when available, otherwise falls back to the
 * curated static list.
 */
export function getSubwayStations(): TransitStop[] {
  return _liveStops ?? staticSubwayStops;
}

// Keep legacy export name for backward compatibility
export const ttcStops = staticTTCStops;
