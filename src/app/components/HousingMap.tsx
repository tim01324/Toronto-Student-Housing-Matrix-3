import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getSubwayStations, TransitStop } from '../services/transitData';

const tokenPart1 = 'pk.eyJ1IjoidGltMDEzMjQiLCJhIjoiY21taH';
const tokenPart2 = 'hkZGM4MG10NTJwcHNiMnIxa2FsciJ9.MOLHj9Y_LUQcB1b2aUVSUQ';
mapboxgl.accessToken = tokenPart1 + tokenPart2;

interface MapListing {
    id: string;
    neighborhood: string;
    rent: number;
    commute: number;
    safety: string;
    valueScore: number;
    lat: number;
    lng: number;
    nearestTransit?: string;
    crimeRatePer1000?: number;
}

interface HousingMapProps {
    listings: MapListing[];
    selectedListing: string | null;
    onListingClick: (id: string) => void;
    campusLat?: number;
    campusLng?: number;
    campusName?: string;
    transitDataVersion?: string;
}

const SAFETY_COLORS: Record<string, { border: string; glow: string; dot: string }> = {
    High:   { border: '#22c55e', glow: 'rgba(34,197,94,0.35)',  dot: '#22c55e' },
    Medium: { border: '#f59e0b', glow: 'rgba(245,158,11,0.35)', dot: '#f59e0b' },
    Low:    { border: '#ef4444', glow: 'rgba(239,68,68,0.35)',  dot: '#ef4444' },
};

function buildSubwayMarkerEl(stop: TransitStop): HTMLElement {
    const el = document.createElement('div');
    el.innerHTML = `
    <div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: #1E40AF; border: 2.5px solid white;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(30,58,138,0.45);
      cursor: default;
      font-size: 13px; line-height: 1;
    " title="${stop.name}">🚇</div>`;
    return el;
}

export function HousingMap({
    listings,
    selectedListing,
    onListingClick,
    campusLat = 43.6629,
    campusLng = -79.3957,
    campusName = 'U of T — St. George',
    transitDataVersion = 'static',
}: HousingMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const subwayMarkersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [showSubway, setShowSubway] = useState(true);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [campusLng, campusLat],
            zoom: 13.5,
            pitch: 0,
            attributionControl: false,
        });

        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');
        map.current.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-right');

        map.current.on('load', () => {
            setMapLoaded(true);
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [campusLat, campusLng]);

    // Add listing + campus markers
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // --- Campus marker ---
        const campusEl = document.createElement('div');
        campusEl.innerHTML = `
      <div style="
        width: 50px; height: 50px; border-radius: 50%;
        background: #DC2626; border: 3px solid white;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(220,38,38,0.45);
        cursor: pointer;
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>`;

        const campusPopup = new mapboxgl.Popup({ offset: 30, closeButton: false })
            .setHTML(`
        <div style="font-family:Inter,sans-serif;text-align:center;padding:4px">
          <div style="font-weight:700;color:#DC2626;font-size:13px">${campusName}</div>
          <div style="font-size:11px;color:#666;margin-top:2px">Selected Campus</div>
        </div>`);

        const campusMarker = new mapboxgl.Marker({ element: campusEl })
            .setLngLat([campusLng, campusLat])
            .setPopup(campusPopup)
            .addTo(map.current);
        markersRef.current.push(campusMarker);

        // --- Listing markers ---
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([campusLng, campusLat]);

        listings.forEach((listing) => {
            bounds.extend([listing.lng, listing.lat]);

            const sc = SAFETY_COLORS[listing.safety] ?? SAFETY_COLORS['Medium'];

            const el = document.createElement('div');
            el.style.cursor = 'pointer';
            el.innerHTML = `
        <div class="listing-pin" data-id="${listing.id}" style="
          width: 44px; height: 44px; border-radius: 50%;
          background: white;
          border: 3px solid ${sc.border};
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #1E3A8A;
          box-shadow: 0 3px 12px ${sc.glow};
          transition: all 0.2s ease;
          font-family: Inter, sans-serif;
          line-height: 1;
        ">$${(listing.rent / 1000).toFixed(1)}k</div>`;

            el.addEventListener('mouseenter', () => {
                const pin = el.querySelector('.listing-pin') as HTMLElement;
                if (pin) {
                    pin.style.background = '#1E3A8A';
                    pin.style.color = 'white';
                    pin.style.transform = 'scale(1.18)';
                    pin.style.boxShadow = `0 6px 20px rgba(30,58,138,0.45)`;
                }
            });
            el.addEventListener('mouseleave', () => {
                const pin = el.querySelector('.listing-pin') as HTMLElement;
                if (pin) {
                    pin.style.background = 'white';
                    pin.style.color = '#1E3A8A';
                    pin.style.transform = 'scale(1)';
                    pin.style.boxShadow = `0 3px 12px ${sc.glow}`;
                }
            });

            const safetyColor = sc.dot;
            const crimeText = listing.crimeRatePer1000
                ? `<span style="font-size:11px;color:#555;">TPS Crime Rate: <b>${listing.crimeRatePer1000}/1k</b></span>`
                : '';

            const popup = new mapboxgl.Popup({ offset: 26, closeButton: false, maxWidth: '240px' })
                .setHTML(`
          <div style="font-family:Inter,sans-serif;padding:6px;">
            <div style="font-weight:700;font-size:14px;color:#111;margin-bottom:6px;">${listing.neighborhood}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:16px;font-weight:700;color:#1E3A8A;">$${listing.rent}/mo</span>
              <span style="background:${listing.valueScore >= 80 ? '#22c55e' : listing.valueScore >= 70 ? '#f59e0b' : '#ef4444'};color:white;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">${listing.valueScore}</span>
            </div>
            <div style="font-size:12px;color:#555;display:flex;flex-direction:column;gap:5px;">
              <span>🕐 ${listing.commute} min TTC commute</span>
              <span style="display:flex;align-items:center;gap:4px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${safetyColor};display:inline-block;flex-shrink:0;"></span>
                ${listing.safety} Safety
              </span>
              ${listing.nearestTransit ? `<span>🚇 ${listing.nearestTransit}</span>` : ''}
              ${crimeText}
            </div>
          </div>`);

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([listing.lng, listing.lat])
                .setPopup(popup)
                .addTo(map.current!);

            el.addEventListener('click', () => onListingClick(listing.id));
            markersRef.current.push(marker);
        });

        map.current.fitBounds(bounds, {
            padding: { top: 70, bottom: 70, left: 50, right: 50 },
            maxZoom: 14.5,
            duration: 1000,
        });
    }, [mapLoaded, listings, campusLat, campusLng, campusName, onListingClick]);

    // TTC Subway station markers
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        subwayMarkersRef.current.forEach(m => m.remove());
        subwayMarkersRef.current = [];

        if (!showSubway) return;

        getSubwayStations().forEach((stop) => {
            const el = buildSubwayMarkerEl(stop);
            const popup = new mapboxgl.Popup({ offset: 16, closeButton: false })
                .setHTML(`
          <div style="font-family:Inter,sans-serif;padding:3px;">
            <div style="font-weight:700;font-size:12px;color:#1E40AF;">🚇 ${stop.name}</div>
            <div style="font-size:11px;color:#555;margin-top:2px;">${stop.line}</div>
            <div style="font-size:10px;color:#888;margin-top:1px;">TTC Subway Station</div>
          </div>`);

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([stop.lng, stop.lat])
                .setPopup(popup)
                .addTo(map.current!);
            subwayMarkersRef.current.push(marker);
        });
    }, [mapLoaded, showSubway, transitDataVersion]);

    // Highlight selected listing
    useEffect(() => {
        if (!mapLoaded) return;
        markersRef.current.forEach((marker, index) => {
            if (index === 0) return; // skip campus marker
            const el = marker.getElement();
            const pin = el.querySelector('.listing-pin') as HTMLElement;
            if (!pin) return;
            const listingId = pin.getAttribute('data-id');
            const listing = listings.find(l => l.id === listingId);
            const sc = SAFETY_COLORS[listing?.safety ?? 'Medium'];

            if (listingId === selectedListing) {
                pin.style.background = '#1E3A8A';
                pin.style.color = 'white';
                pin.style.transform = 'scale(1.2)';
                pin.style.boxShadow = '0 6px 22px rgba(30,58,138,0.55)';
                marker.getPopup()?.addTo(map.current!);
            } else {
                pin.style.background = 'white';
                pin.style.color = '#1E3A8A';
                pin.style.transform = 'scale(1)';
                pin.style.boxShadow = `0 3px 12px ${sc.glow}`;
            }
        });
    }, [selectedListing, mapLoaded, listings]);

    return (
        <div className="w-full h-full relative">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Subway toggle */}
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => setShowSubway(v => !v)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold shadow-md border transition-all ${showSubway
                        ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1E40AF]'
                        }`}
                >
                    🚇 TTC Subway
                </button>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-8 right-4 bg-white/97 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200 z-10 min-w-[160px]">
                <p className="text-[11px] font-bold text-gray-700 mb-2.5 uppercase tracking-wide">Legend</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow flex-shrink-0" />
                        Campus
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-green-500 shadow flex-shrink-0" />
                        High Safety
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-yellow-500 shadow flex-shrink-0" />
                        Medium Safety
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-red-500 shadow flex-shrink-0" />
                        Low Safety
                    </div>
                    {showSubway && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 pt-1 border-t border-gray-100 mt-1">
                            <span className="text-sm">🚇</span>
                            TTC Subway Station
                        </div>
                    )}
                </div>
                <p className="text-[9px] text-gray-400 mt-2.5 leading-tight">
                    Safety: TPS Open Data<br />Transit: TTC GTFS
                </p>
            </div>
        </div>
    );
}
