import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, Shield, ChevronRight, Home, SlidersHorizontal, GraduationCap, MapPin, Train, RefreshCw, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { StepIndicator } from '../components/StepIndicator';
import { HousingMap } from '../components/HousingMap';
import { PageTransition, FadeIn } from '../components/PageTransition';
import { useCompare } from '../context/CompareContext';
import { buildListings, Listing, mockListings } from '../data/mockData';
import { useTTCStops } from '../hooks/useTTCStops';
import { useNearbyAmenities } from '../hooks/useNearbyAmenities';

export function Results() {
  const navigate = useNavigate();
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const { compareListDirs: compareList, toggleCompare: contextToggleCompare } = useCompare();
  const [priceRange, setPriceRange] = useState([500, 2000]);
  const [maxCommute, setMaxCommute] = useState(30);
  const [safetyPref, setSafetyPref] = useState('all');
  const [weights, setWeights] = useState({
    affordability: 25,
    commute: 25,
    safety: 25,
    amenities: 25,
  });
  const { status: ttcStatus, stopsCount, cacheDate, refresh: refreshTTC } = useTTCStops();
  const listingsForCoords = useMemo(() => mockListings.map(l => ({ id: l.id, lat: l.lat, lng: l.lng })), []);
  const { status: osmStatus, poiData, cacheDate: osmCacheDate, refresh: refreshOSM } = useNearbyAmenities(listingsForCoords);
  const listings = useMemo(
    () => buildListings(poiData),
    [ttcStatus, stopsCount, cacheDate?.getTime(), osmStatus, osmCacheDate?.getTime(), poiData],
  );

  const handleListingClick = (id: string) => {
    navigate(`/listing/${id}`);
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    contextToggleCompare(id);
  };

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'High': return 'text-green-700 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-500';
    if (score >= 70) return 'from-yellow-400 to-yellow-500';
    return 'from-red-400 to-red-500';
  };

  const totalWeight = weights.affordability + weights.commute + weights.safety + weights.amenities;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-[1440px] mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                <Home size={16} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-[#1E3A8A]">
                Toronto Student Housing Matrix
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/compare')}
                disabled={compareList.length < 2}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${compareList.length >= 2
                  ? 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF] shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Compare ({compareList.length})
              </button>
            </div>
          </div>
        </header>

        {/* Step Indicator */}
        <StepIndicator currentStep={2} canGoToCompare={compareList.length >= 2} />

        {/* Search Summary Banner */}
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-[1440px] mx-auto px-8 py-3 flex items-center gap-4 text-sm">
            <span className="font-medium text-blue-800">Active Filters:</span>
            <span className="bg-white px-3 py-1 rounded-full text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <GraduationCap size={13} />
              U of T — St. George
            </span>
            <span className="bg-white px-3 py-1 rounded-full text-blue-700 border border-blue-200">
              ${priceRange[0]} – ${priceRange[1]}/mo
            </span>
            <span className="bg-white px-3 py-1 rounded-full text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <Clock size={13} />
              ≤ {maxCommute} min commute
            </span>
            <button onClick={() => navigate('/')} className="ml-auto text-blue-600 hover:text-blue-800 font-medium">
              Edit Search
            </button>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="max-w-[1440px] mx-auto flex h-[calc(100vh-145px)]">
          {/* Left Panel - Filters & Results */}
          <div className="w-[42%] bg-white border-r border-gray-200 overflow-y-auto">
            {/* Filters Section */}
            <div className="p-6 border-b border-gray-200 space-y-5">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#1E3A8A]" />
                Refine Results
              </h2>

              {/* Price Range */}
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Price Range</span>
                  <span className="text-[#1E3A8A] font-semibold text-xs">${priceRange[0]} — ${priceRange[1]}</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-8">Min</span>
                    <input
                      type="range" min="300" max="3000" step="50"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v < priceRange[1]) setPriceRange([v, priceRange[1]]);
                      }}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-8">Max</span>
                    <input
                      type="range" min="300" max="3000" step="50"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v > priceRange[0]) setPriceRange([priceRange[0], v]);
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Max Commute */}
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#1E3A8A]" />
                    Max TTC Commute
                  </span>
                  <span className="text-[#1E3A8A] font-semibold text-xs">{maxCommute} min</span>
                </label>
                <p className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                  <MapPin size={11} />
                  Commute to: U of T — St. George
                </p>
                <input
                  type="range" min="10" max="60" step="5"
                  value={maxCommute}
                  onChange={(e) => setMaxCommute(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Safety Preference */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                  <Shield size={14} className="text-[#1E3A8A]" />
                  Safety Preference
                </label>
                <select
                  value={safetyPref}
                  onChange={(e) => setSafetyPref(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none bg-white text-sm"
                >
                  <option value="all">All Safety Levels</option>
                  <option value="high">High Only</option>
                  <option value="medium">Medium or Higher</option>
                </select>
              </div>

              {/* Weight Sliders */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-[#1E3A8A]" />
                  Value Score Weights
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Adjust how each factor contributes to the Value Score
                  {totalWeight !== 100 && (
                    <span className="text-amber-600 font-medium"> (Total: {totalWeight}%)</span>
                  )}
                </p>

                <div className="space-y-3">
                  {([
                    { key: 'affordability' as const, label: 'Affordability', color: 'bg-blue-500' },
                    { key: 'commute' as const, label: 'Commute', color: 'bg-indigo-500' },
                    { key: 'safety' as const, label: 'Safety', color: 'bg-green-500' },
                    { key: 'amenities' as const, label: 'Amenities', color: 'bg-purple-500' },
                  ]).map(({ key, label, color }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{label}</span>
                        <span className="text-xs font-semibold text-gray-700">{weights[key]}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range" min="0" max="100"
                          value={weights[key]}
                          onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                          className="flex-1"
                        />
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${weights[key]}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  {listings.length} Listings Found
                </h2>
                <span className="text-xs text-gray-500">Sorted by Value Score</span>
              </div>
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => handleListingClick(listing.id)}
                    onMouseEnter={() => setSelectedListing(listing.id)}
                    onMouseLeave={() => setSelectedListing(null)}
                    className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${selectedListing === listing.id ? 'border-[#1E3A8A] shadow-md ring-1 ring-[#1E3A8A]/20' : 'border-gray-200'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {listing.neighborhood}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {listing.type}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-sm">
                          <div className="text-gray-900 font-semibold text-lg">
                            ${listing.rent}<span className="text-sm font-normal text-gray-500">/mo</span>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Clock size={13} />
                              <span>{listing.commute} min</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Shield size={13} className="text-gray-500" />
                              <span className={`text-xs px-2 py-0.5 rounded border ${getSafetyColor(listing.safety)}`}>
                                {listing.safety}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <span className="text-gray-400">Crime:</span>
                              <span className={`font-semibold ${
                                listing.crimeRatePer1000 < 35 ? 'text-green-600' :
                                listing.crimeRatePer1000 < 55 ? 'text-yellow-600' : 'text-red-600'
                              }`}>{listing.crimeRatePer1000}/1k</span>
                            </div>

                            {listing.nearbyPOIs && listing.nearbyPOIs.length > 0 && (
                              <div className="flex items-center gap-1 text-gray-600 text-xs whitespace-nowrap">
                                <span>🛒</span>
                                <span className="font-medium">{listing.nearbyPOIs.length} Services nearby</span>
                              </div>
                            )}
                          </div>

                          {listing.nearestStops?.[0] && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-700 mt-1.5">
                              <Train size={11} className="flex-shrink-0" />
                              <span className="truncate">{listing.nearestStops[0].stop.name} · {listing.nearestStops[0].walkMinutes} min walk</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Value Score Badge */}
                      <div className="flex flex-col items-center ml-4">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getScoreColor(listing.valueScore)} text-white flex flex-col items-center justify-center shadow-sm`}>
                          <span className="text-lg font-bold">{listing.valueScore}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 font-medium">Value Score</span>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={(e) => toggleCompare(listing.id, e)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${compareList.includes(listing.id)
                          ? 'bg-blue-100 text-[#1E3A8A] border border-blue-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-blue-300'
                          }`}
                      >
                        {compareList.includes(listing.id) ? '✓ Added to Compare' : '+ Add to Compare'}
                      </button>
                      <span className="text-sm text-[#1E3A8A] flex items-center gap-0.5 font-medium">
                        Details
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Mapbox Map */}
          <div className="w-[58%] relative">
            <HousingMap
              listings={listings}
              selectedListing={selectedListing}
              onListingClick={(id) => handleListingClick(id)}
              campusLat={43.6629}
              campusLng={-79.3957}
              campusName="U of T — St. George"
              transitDataVersion={`${ttcStatus}:${stopsCount}:${cacheDate?.getTime() ?? 0}`}
              poiData={poiData}
            />
            {/* Status Badges */}
            <div className="absolute bottom-8 left-2 z-10 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-sm text-xs">
              {ttcStatus === 'loading' && (
                <><Loader2 size={12} className="animate-spin text-blue-600" /><span className="text-gray-600">Loading TTC data…</span></>
              )}
              {ttcStatus === 'live' && (
                <><Wifi size={12} className="text-green-600" /><span className="text-gray-700 font-medium">TTC Live</span><span className="text-gray-400">·</span><span className="text-gray-500">{stopsCount} stops</span></>
              )}
              {ttcStatus === 'cached' && (
                <><Wifi size={12} className="text-blue-500" /><span className="text-gray-700 font-medium">TTC Cached</span>{cacheDate && <span className="text-gray-400 hidden sm:inline"> · {cacheDate.toLocaleDateString()}</span>}</>
              )}
              {ttcStatus === 'error' && (
                <><WifiOff size={12} className="text-orange-500" /><span className="text-gray-600">TTC static data</span></>
              )}
              {(ttcStatus === 'cached' || ttcStatus === 'error' || ttcStatus === 'live') && (
                <button onClick={refreshTTC} title="Refresh TTC data" className="ml-1 text-gray-400 hover:text-blue-600 transition-colors">
                  <RefreshCw size={11} />
                </button>
              )}
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-sm text-xs">
                {osmStatus === 'loading' && (
                  <><Loader2 size={12} className="animate-spin text-green-600" /><span className="text-gray-600">Loading OSM data…</span></>
                )}
                {osmStatus === 'live' && (
                  <><Wifi size={12} className="text-green-600" /><span className="text-gray-700 font-medium">OSM Live</span><span className="text-gray-400">·</span><span className="text-gray-500">{(poiData?.size || 0)} properties</span></>
                )}
                {osmStatus === 'cached' && (
                  <><Wifi size={12} className="text-blue-500" /><span className="text-gray-700 font-medium">OSM Cached</span>{osmCacheDate && <span className="text-gray-400 hidden sm:inline"> · {osmCacheDate.toLocaleDateString()}</span>}</>
                )}
                {osmStatus === 'error' && (
                  <><WifiOff size={12} className="text-orange-500" /><span className="text-gray-600">OSM static data</span></>
                )}
                {(osmStatus === 'cached' || osmStatus === 'error' || osmStatus === 'live') && (
                  <button onClick={refreshOSM} title="Refresh OSM data" className="ml-1 text-gray-400 hover:text-green-600 transition-colors">
                    <RefreshCw size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}