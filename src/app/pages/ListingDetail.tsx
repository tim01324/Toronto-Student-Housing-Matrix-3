import { useParams, useNavigate } from 'react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MapPin, Clock, Shield, Wifi, Utensils, Car, Home, Warehouse, Train, GraduationCap, AlertTriangle } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StepIndicator } from '../components/StepIndicator';
import { PageTransition } from '../components/PageTransition';
import { useCompare } from '../context/CompareContext';
import { buildListings, mockListings } from '../data/mockData';
import { useTTCStops } from '../hooks/useTTCStops';
import { getDistanceMeters } from '../services/osmAmenityService';
import { useNearbyAmenities } from '../hooks/useNearbyAmenities';

const tokenPart1 = 'pk.eyJ1IjoidGltMDEzMjQiLCJhIjoiY21taH';
const tokenPart2 = 'hkZGM4MG10NTJwcHNiMnIxa2FsciJ9.MOLHj9Y_LUQcB1b2aUVSUQ';
mapboxgl.accessToken = tokenPart1 + tokenPart2;

const CAMPUS_LAT = 43.6629;
const CAMPUS_LNG = -79.3957;

const SAFETY_BORDER: Record<string, string> = {
  High:   '#22c55e',
  Medium: '#f59e0b',
  Low:    '#ef4444',
};

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { status: ttcStatus, stopsCount, cacheDate } = useTTCStops();
  const listingsForCoords = useMemo(() => mockListings.map(l => ({ id: l.id, lat: l.lat, lng: l.lng })), []);
  const { poiData } = useNearbyAmenities(listingsForCoords);
  const listings = useMemo(
    () => buildListings(poiData),
    [ttcStatus, stopsCount, cacheDate?.getTime(), poiData]
  );
  const listing = listings.find(l => l.id === id) || listings[0];
  const { compareListDirs, toggleCompare } = useCompare();

  // Mini-map
  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMap = useRef<mapboxgl.Map | null>(null);
  const [miniMapLoaded, setMiniMapLoaded] = useState(false);

  useEffect(() => {
    if (!miniMapRef.current || miniMap.current) return;
    miniMap.current = new mapboxgl.Map({
      container: miniMapRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [listing.lng, listing.lat],
      zoom: 14.5,
      interactive: true,
      attributionControl: false,
    });
    miniMap.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    miniMap.current.on('load', () => setMiniMapLoaded(true));
    return () => { miniMap.current?.remove(); miniMap.current = null; };
  }, [listing.lat, listing.lng]);

  useEffect(() => {
    if (!miniMap.current || !miniMapLoaded) return;

    // Listing marker
    const el = document.createElement('div');
    const sc = SAFETY_BORDER[listing.safety] ?? '#1E3A8A';
    el.innerHTML = `<div style="
      width:42px;height:42px;border-radius:50%;
      background:white;border:3px solid ${sc};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 14px rgba(0,0,0,0.25);
      font-size:10px;font-weight:700;color:#1E3A8A;font-family:Inter,sans-serif;">
      $${(listing.rent / 1000).toFixed(1)}k</div>`;
    new mapboxgl.Marker({ element: el }).setLngLat([listing.lng, listing.lat]).addTo(miniMap.current!);

    // Campus marker
    const campusEl = document.createElement('div');
    campusEl.innerHTML = `<div style="width:36px;height:36px;border-radius:50%;background:#DC2626;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(220,38,38,0.4);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
    </div>`;
    new mapboxgl.Marker({ element: campusEl }).setLngLat([CAMPUS_LNG, CAMPUS_LAT]).addTo(miniMap.current!);

    // Nearest transit markers
    listing.nearestStops?.slice(0, 2).forEach((ns) => {
      const tEl = document.createElement('div');
      tEl.innerHTML = `<div style="width:24px;height:24px;border-radius:50%;background:#1E40AF;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(30,58,138,0.4);font-size:11px;">🚇</div>`;
      const tp = new mapboxgl.Popup({ offset: 14, closeButton: false }).setHTML(
        `<div style="font-family:Inter,sans-serif;font-size:11px;font-weight:600;color:#1E40AF;">${ns.stop.name}</div><div style="font-size:10px;color:#555;">${ns.walkMinutes} min walk · ${ns.stop.line}</div>`
      );
      new mapboxgl.Marker({ element: tEl }).setLngLat([ns.stop.lng, ns.stop.lat]).setPopup(tp).addTo(miniMap.current!);
    });

    // POI markers
    listing.nearbyPOIs?.forEach((poi) => {
      let icon = '📍';
      let color = '#6b7280';
      if (poi.category === 'supermarket') { icon = '🛒'; color = '#16a34a'; }
      if (poi.category === 'pharmacy') { icon = '➕'; color = '#dc2626'; }
      if (poi.category === 'library') { icon = '📚'; color = '#2563eb'; }

      const poiEl = document.createElement('div');
      poiEl.innerHTML = `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:9px;">${icon}</div>`;
      const poiPopup = new mapboxgl.Popup({ offset: 10, closeButton: false }).setHTML(
        `<div style="font-family:Inter,sans-serif;font-size:10px;font-weight:600;color:${color};text-transform:capitalize;">${icon} ${poi.name}</div>`
      );
      new mapboxgl.Marker({ element: poiEl }).setLngLat([poi.lng, poi.lat]).setPopup(poiPopup).addTo(miniMap.current!);
    });
  }, [miniMapLoaded, listing]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bar: 'bg-green-500', badge: 'bg-green-100 text-green-800' };
    if (score >= 60) return { bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800' };
    return { bar: 'bg-red-500', badge: 'bg-red-100 text-red-800' };
  };

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'High': return 'text-green-700 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi size={16} />;
      case 'kitchen': return <Utensils size={16} />;
      case 'parking': return <Car size={16} />;
      case 'laundry': return <Warehouse size={16} />;
      case 'storage': return <Warehouse size={16} />;
      case 'nearby transit': return <Train size={16} />;
      default: return <Home size={16} />;
    }
  };

  const scoreItems = [
    { key: 'rent',      label: 'Affordability Score', desc: 'Based on rent relative to area market rates' },
    { key: 'commute',   label: 'Commute Score',        desc: 'TTC travel time to University of Toronto — St. George' },
    { key: 'safety',    label: 'Safety Score',         desc: 'Derived from TPS Major Crime Indicators by Neighbourhood' },
    { key: 'amenities', label: 'Amenities Score',      desc: 'Available in-unit and nearby amenities' },
  ];

  // Crime data bars
  const crimeCategories = [
    { label: 'Assaults',       value: listing.assaults,      max: 250 },
    { label: 'Break & Enter',  value: listing.breakAndEnter,  max: 120 },
    { label: 'Auto Theft',     value: listing.autoTheft,      max: 100 },
    { label: 'Robbery',        value: listing.robbery,        max: 80 },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/results')}
                className="flex items-center gap-1.5 text-[#1E3A8A] hover:text-[#1E40AF] transition-colors text-sm font-medium"
              >
                <ArrowLeft size={18} />
                Back to Results
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-7 h-7 bg-[#1E3A8A] rounded-md flex items-center justify-center">
                  <Home size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold text-[#1E3A8A]">TSHM</span>
              </div>
            </div>
            <button
              onClick={() => toggleCompare(listing.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${compareListDirs.includes(listing.id)
                ? 'bg-blue-100 text-[#1E3A8A] hover:bg-blue-200'
                : 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]'
                }`}
            >
              {compareListDirs.includes(listing.id) ? '✓ Added to Compare' : 'Add to Compare'}
            </button>
          </div>
        </header>

        <StepIndicator
          currentStep={3}
          detailListingId={listing.id}
          canGoToCompare={compareListDirs.length >= 2}
        />

        <main className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="col-span-2 space-y-6">
              {/* Title Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-[#1E3A8A]/10 via-blue-50 to-indigo-50 flex items-center justify-center relative">
                  <div className="text-center">
                    <MapPin size={32} className="text-[#1E3A8A]/40 mx-auto mb-2" />
                    <p className="text-sm text-[#1E3A8A]/50 font-medium">{listing.neighborhood} — Neighbourhood View</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-lg px-5 py-3 text-center">
                    <div className="text-3xl font-bold text-[#1E3A8A]">{listing.valueScore}</div>
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Value Score</div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold text-gray-900">{listing.neighborhood}</h2>
                        <span className="text-xs bg-blue-50 text-[#1E3A8A] px-2.5 py-1 rounded-full font-medium border border-blue-100">
                          {listing.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-2xl font-bold text-[#1E3A8A]">${listing.rent}</span>
                          <span className="text-gray-500">/month</span>
                        </div>
                        <div className="w-px h-6 bg-gray-300" />
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Clock size={16} className="text-blue-600" />
                          <span className="font-medium">{listing.commute} min</span>
                          <span className="text-xs text-gray-500">TTC commute</span>
                        </div>
                        <div className="w-px h-6 bg-gray-300" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSafetyColor(listing.safety)}`}>
                          <Shield size={13} className="inline mr-1" />
                          {listing.safety} Safety
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
                    <GraduationCap size={18} className="text-blue-700 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        {listing.commute} min estimated TTC commute to U of T — St. George
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">Nearest transit: {listing.nearestTransit}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                  </div>
                </div>
              </div>

              {/* Value Score Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Value Score Breakdown</h3>
                <div className="space-y-5">
                  {scoreItems.map(({ key, label, desc }) => {
                    const score = listing.scores[key as keyof typeof listing.scores];
                    const colors = getScoreColor(score);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-medium text-gray-800">{label}</span>
                            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>{score}/100</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div className={`${colors.bar} h-3 rounded-full transition-all`} style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-5 mt-5 border-t-2 border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">Final Value Score</span>
                        <p className="text-xs text-gray-500 mt-0.5">Weighted average based on your priority settings</p>
                      </div>
                      <span className="text-3xl font-bold text-[#1E3A8A]">
                        {listing.valueScore}<span className="text-base text-gray-400">/100</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Data — TPS Open Data */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield size={18} className="text-green-600" />
                    Safety Data
                  </h3>
                  <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
                    Source: Toronto Police Service Open Data
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-[#1E3A8A]">{listing.crimeRatePer1000}</div>
                    <div className="text-xs text-gray-500 mt-1">Major Crimes / 1k residents</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-[#1E3A8A]">{listing.majorCrimesPerYear}</div>
                    <div className="text-xs text-gray-500 mt-1">Annual Major Crime Incidents</div>
                  </div>
                  <div className={`rounded-lg p-4 border text-center ${listing.safety === 'High' ? 'bg-green-50 border-green-200' : listing.safety === 'Medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`text-2xl font-bold ${listing.safety === 'High' ? 'text-green-700' : listing.safety === 'Medium' ? 'text-yellow-700' : 'text-red-700'}`}>{listing.safetyScore}</div>
                    <div className="text-xs text-gray-500 mt-1">Safety Score (0–100)</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {crimeCategories.map(({ label, value, max }) => {
                    const pct = Math.min(100, Math.round((value / max) * 100));
                    const barColor = pct < 40 ? 'bg-green-500' : pct < 70 ? 'bg-yellow-500' : 'bg-red-500';
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 font-medium">{label}</span>
                          <span className="text-xs text-gray-500">{value} incidents/yr</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`${barColor} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <AlertTriangle size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Data from TPS Major Crime Indicators Open Data. Updated February 2, 2026 at 12:45:21.
                    Figures represent neighbourhood-level aggregates. Lower figures are better.
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-3 gap-3">
                  {listing.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                      <span className="text-[#1E3A8A]">{getAmenityIcon(amenity)}</span>
                      <span className="text-sm font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Essential Services */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Nearby Essential Services</h3>
                  <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
                    Source: OpenStreetMap (Overpass API)
                  </span>
                </div>
                <div className="space-y-3">
                  {(['supermarket', 'pharmacy', 'library'] as const).map(cat => {
                    const catPOIs = listing.nearbyPOIs?.filter(p => p.category === cat) || [];
                    const count = catPOIs.length;
                    if (count === 0) return (
                      <div key={cat} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                         <div className="text-lg">{cat === 'supermarket' ? '🛒' : cat === 'pharmacy' ? '➕' : '📚'}</div>
                         <div className="text-sm text-gray-600 capitalize">No {cat}s within 1km</div>
                      </div>
                    );

                    let nearestDist = Infinity;
                    catPOIs.forEach(p => {
                      const d = getDistanceMeters(listing.lat, listing.lng, p.lat, p.lng);
                      if (d < nearestDist) nearestDist = d;
                    });
                    
                    return (
                      <div key={cat} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                         <div className="text-lg">{cat === 'supermarket' ? '🛒' : cat === 'pharmacy' ? '➕' : '📚'}</div>
                         <div className="flex-1">
                           <div className="text-sm font-semibold text-gray-900 capitalize">{cat}s: {count} within 1km</div>
                           <div className="text-xs text-gray-500 mt-0.5">Nearest: {nearestDist}m away</div>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Real Mapbox Mini-Map */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#1E3A8A]" />
                  Location
                </h3>
                <div ref={miniMapRef} className="w-full rounded-lg overflow-hidden" style={{ height: '220px' }} />
                <p className="text-[10px] text-gray-400 mt-2">🔴 Campus &nbsp; 🔵 Listing &nbsp; 🚇 TTC Stops</p>
              </div>

              {/* TTC Transit */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Train size={14} className="text-[#1E40AF]" />
                    TTC Transit Stops
                  </h3>
                  <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    TTC GTFS
                  </span>
                </div>
                <div className="space-y-3">
                  {listing.nearestStops?.map((ns, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="w-8 h-8 rounded-full bg-[#1E40AF] flex items-center justify-center flex-shrink-0 text-sm">
                        🚇
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#1E40AF] truncate">{ns.stop.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{ns.stop.line} · {ns.stop.type}</div>
                        <div className="text-xs font-medium text-gray-700 mt-1">
                          🚶 {ns.walkMinutes} min walk
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
                <button className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg hover:bg-[#1E40AF] transition-all font-medium shadow-sm">
                  Save Listing
                </button>
                <button
                  onClick={() => {
                    toggleCompare(listing.id);
                    if (!compareListDirs.includes(listing.id)) navigate('/compare');
                  }}
                  className={`w-full border-2 py-3 rounded-lg transition-all font-medium ${compareListDirs.includes(listing.id)
                    ? 'border-blue-200 bg-blue-50 text-[#1E3A8A]'
                    : 'border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white'
                    }`}
                >
                  {compareListDirs.includes(listing.id) ? '✓ Added to Compare' : 'Add to Compare'}
                </button>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Monthly Rent</span>
                    <span className="font-semibold text-gray-900">${listing.rent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">TTC Commute</span>
                    <span className="font-semibold text-gray-900">{listing.commute} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Safety Rating</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSafetyColor(listing.safety)}`}>
                      {listing.safety}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Crime Index</span>
                    <span className="font-semibold text-gray-900">{listing.crimeIndex}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Crime Rate</span>
                    <span className="font-semibold text-gray-900">{listing.crimeRatePer1000}/1k</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Nearest Transit</span>
                    <span className="font-semibold text-gray-900 text-xs text-right max-w-[130px] leading-tight">{listing.nearestTransit}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-gray-600 font-medium">Value Score</span>
                    <span className="text-xl font-bold text-[#1E3A8A]">{listing.valueScore}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}