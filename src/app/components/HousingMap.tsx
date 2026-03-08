import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
}

interface HousingMapProps {
    listings: MapListing[];
    selectedListing: string | null;
    onListingClick: (id: string) => void;
    campusLat?: number;
    campusLng?: number;
    campusName?: string;
}

export function HousingMap({
    listings,
    selectedListing,
    onListingClick,
    campusLat = 43.6629,
    campusLng = -79.3957,
    campusName = 'U of T — St. George',
}: HousingMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [campusLng, campusLat],
            zoom: 13,
            pitch: 0,
            attributionControl: false,
        });

        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

        map.current.on('load', () => {
            setMapLoaded(true);
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [campusLat, campusLng]);

    // Add markers when map loads
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Campus marker
        const campusEl = document.createElement('div');
        campusEl.innerHTML = `
      <div style="
        width: 48px; height: 48px; border-radius: 50%;
        background: #DC2626; border: 3px solid white;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 12px rgba(220,38,38,0.4);
        cursor: pointer;
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
    `;

        const campusPopup = new mapboxgl.Popup({ offset: 28, closeButton: false })
            .setHTML(`
        <div style="font-family:Inter,sans-serif; text-align:center; padding:4px;">
          <div style="font-weight:700; color:#DC2626; font-size:13px;">${campusName}</div>
          <div style="font-size:11px; color:#666; margin-top:2px;">Selected Campus</div>
        </div>
      `);

        const campusMarker = new mapboxgl.Marker({ element: campusEl })
            .setLngLat([campusLng, campusLat])
            .setPopup(campusPopup)
            .addTo(map.current);
        markersRef.current.push(campusMarker);

        // Listing markers
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([campusLng, campusLat]);

        listings.forEach((listing) => {
            bounds.extend([listing.lng, listing.lat]);

            const el = document.createElement('div');
            el.style.cursor = 'pointer';
            el.innerHTML = `
        <div class="listing-pin" data-id="${listing.id}" style="
          width: 40px; height: 40px; border-radius: 50%;
          background: white; border: 3px solid #1E3A8A;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #1E3A8A;
          box-shadow: 0 3px 10px rgba(0,0,0,0.25);
          transition: all 0.2s ease;
          font-family: Inter, sans-serif;
        ">$${(listing.rent / 1000).toFixed(1)}k</div>
      `;

            el.addEventListener('mouseenter', () => {
                const pin = el.querySelector('.listing-pin') as HTMLElement;
                if (pin) {
                    pin.style.background = '#1E3A8A';
                    pin.style.color = 'white';
                    pin.style.transform = 'scale(1.15)';
                }
            });
            el.addEventListener('mouseleave', () => {
                const pin = el.querySelector('.listing-pin') as HTMLElement;
                if (pin) {
                    pin.style.background = 'white';
                    pin.style.color = '#1E3A8A';
                    pin.style.transform = 'scale(1)';
                }
            });

            const safetyColor = listing.safety === 'High' ? '#22c55e' : listing.safety === 'Medium' ? '#eab308' : '#ef4444';

            const popup = new mapboxgl.Popup({ offset: 24, closeButton: false, maxWidth: '220px' })
                .setHTML(`
          <div style="font-family:Inter,sans-serif; padding:4px;">
            <div style="font-weight:700; font-size:14px; color:#111; margin-bottom:6px;">${listing.neighborhood}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:16px; font-weight:700; color:#1E3A8A;">$${listing.rent}/mo</span>
              <span style="background:${listing.valueScore >= 80 ? '#22c55e' : listing.valueScore >= 70 ? '#eab308' : '#ef4444'}; color:white; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700;">${listing.valueScore}</span>
            </div>
            <div style="margin-top:6px; font-size:12px; color:#555; display:flex; gap:8px; align-items:center;">
              <span>🕐 ${listing.commute} min</span>
              <span style="display:flex; align-items:center; gap:3px;">
                <span style="width:7px; height:7px; border-radius:50%; background:${safetyColor}; display:inline-block;"></span>
                ${listing.safety}
              </span>
            </div>
          </div>
        `);

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([listing.lng, listing.lat])
                .setPopup(popup)
                .addTo(map.current!);

            el.addEventListener('click', () => {
                onListingClick(listing.id);
            });

            markersRef.current.push(marker);
        });

        // Fit map to all markers
        map.current.fitBounds(bounds, {
            padding: { top: 60, bottom: 40, left: 40, right: 40 },
            maxZoom: 15,
            duration: 1000,
        });
    }, [mapLoaded, listings, campusLat, campusLng, campusName, onListingClick]);

    // Highlight selected listing
    useEffect(() => {
        if (!mapLoaded) return;
        markersRef.current.forEach((marker, index) => {
            if (index === 0) return; // skip campus marker
            const el = marker.getElement();
            const pin = el.querySelector('.listing-pin') as HTMLElement;
            if (!pin) return;
            const listingId = pin.getAttribute('data-id');
            if (listingId === selectedListing) {
                pin.style.background = '#1E3A8A';
                pin.style.color = 'white';
                pin.style.transform = 'scale(1.15)';
                pin.style.boxShadow = '0 4px 14px rgba(30,58,138,0.5)';
            } else {
                pin.style.background = 'white';
                pin.style.color = '#1E3A8A';
                pin.style.transform = 'scale(1)';
                pin.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)';
            }
        });
    }, [selectedListing, mapLoaded]);

    return (
        <div className="w-full h-full relative">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Legend Overlay */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-10">
                <p className="text-xs font-semibold text-gray-700 mb-2">Legend</p>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" /> Campus
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-[#1E3A8A] shadow" /> Listing
                    </div>
                </div>
            </div>
        </div>
    );
}
