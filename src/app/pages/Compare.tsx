import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, Shield, Check, X, Home, Trophy } from 'lucide-react';
import { StepIndicator } from '../components/StepIndicator';
import { PageTransition } from '../components/PageTransition';
import { useCompare } from '../context/CompareContext';
import { Listing } from '../data/mockData';

const allAmenities = ['WiFi', 'Laundry', 'Kitchen', 'Parking', 'Storage', 'Nearby Transit', 'Pet Friendly', 'Backyard Access'];

export function Compare() {
  const navigate = useNavigate();
  const { getCompareListings, removeFromCompare } = useCompare();
  const compareListings = getCompareListings();

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'High': return 'text-green-700 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // Find the best listing
  const bestListing = compareListings.length > 0 ? compareListings.reduce((best, listing) =>
    listing.valueScore > best.valueScore ? listing : best
    , compareListings[0]) : compareListings[0]; // fallback so TS knows it's Listing type

  if (compareListings.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <X size={24} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Listings to Compare</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              You haven't added any listings to your comparison list yet. Go back to the results page to find housings you like.
            </p>
            <button
              onClick={() => navigate('/results')}
              className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg font-medium hover:bg-[#1E40AF] transition-colors"
            >
              Browse Results
            </button>
          </main>
        </div>
      </PageTransition>
    );
  }

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
          </div>
        </header>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={4}
          detailListingId={compareListings[0]?.id}
          canGoToCompare={compareListings.length >= 2}
        />

        {/* Main Content */}
        <main className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Compare Listings</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Side-by-side comparison of {compareListings.length} selected housing options
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 w-[22%]">
                      Property
                    </th>
                    {compareListings.map((listing) => (
                      <th key={listing.id} className="px-6 py-5 text-left">
                        <div className={`relative ${listing.id === bestListing.id ? '' : ''}`}>
                          <button
                            onClick={() => removeFromCompare(listing.id)}
                            className="absolute -top-2 -right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors z-10"
                            aria-label={`Remove ${listing.neighborhood} from comparison`}
                          >
                            <X size={16} />
                          </button>
                          {listing.id === bestListing.id && (
                            <div className="flex items-center gap-1 mb-2">
                              <Trophy size={14} className="text-amber-500" />
                              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Best Value</span>
                            </div>
                          )}
                          <div className="text-base font-bold text-gray-900 mb-1">
                            {listing.neighborhood}
                          </div>
                          <span className="text-xs bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded font-medium">
                            {listing.type}
                          </span>
                          <div className="flex items-center justify-start mt-3">
                            <div className={`w-16 h-16 rounded-2xl text-white flex flex-col items-center justify-center shadow-sm ${listing.id === bestListing.id
                              ? 'bg-gradient-to-br from-amber-400 to-amber-500'
                              : 'bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6]'
                              }`}>
                              <span className="text-xl font-bold">{listing.valueScore}</span>
                              <span className="text-[9px] opacity-80">/100</span>
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Monthly Rent */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      Monthly Rent
                    </td>
                    {compareListings.map((listing) => {
                      const rents = compareListings.map(l => l.rent);
                      const isBest = listing.rent === Math.min(...rents);
                      return (
                        <td key={listing.id} className="px-6 py-4">
                          <span className={`text-lg font-bold ${isBest ? 'text-green-700' : 'text-gray-900'}`}>
                            ${listing.rent}
                          </span>
                          {isBest && <span className="text-xs text-green-600 ml-2 font-medium bg-green-50 px-2 py-0.5 rounded">Lowest</span>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Commute Time */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-[#1E3A8A]" />
                        TTC Commute
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">to U of T St. George</p>
                    </td>
                    {compareListings.map((listing) => {
                      const commutes = compareListings.map(l => l.commute);
                      const isBest = listing.commute === Math.min(...commutes);
                      return (
                        <td key={listing.id} className="px-6 py-4">
                          <span className={`font-bold ${isBest ? 'text-green-700' : 'text-gray-900'}`}>
                            {listing.commute} min
                          </span>
                          {isBest && <span className="text-xs text-green-600 ml-2 font-medium bg-green-50 px-2 py-0.5 rounded">Shortest</span>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Safety Level */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Shield size={15} className="text-[#1E3A8A]" />
                        Safety Level
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Based on crime data</p>
                    </td>
                    {compareListings.map((listing) => (
                      <td key={listing.id} className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getSafetyColor(listing.safety)}`}>
                          {listing.safety}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Nearby Services */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🛒</span>
                        Nearby Services
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">POIs within 1km</p>
                    </td>
                    {compareListings.map((listing) => {
                      const counts = compareListings.map(l => l.nearbyPOIs?.length || 0);
                      const maxCount = Math.max(...counts);
                      const count = listing.nearbyPOIs?.length || 0;
                      const isBest = count === maxCount && maxCount > 0;
                      return (
                        <td key={listing.id} className="px-6 py-4">
                          <span className={`font-bold ${isBest ? 'text-green-700' : 'text-gray-900'}`}>
                            {count}
                          </span>
                          {isBest && <span className="text-xs text-green-600 ml-2 font-medium bg-green-50 px-2 py-0.5 rounded">Most</span>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Score Breakdown Divider */}
                  <tr>
                    <td colSpan={4} className="px-6 py-3 bg-[#1E3A8A]/5">
                      <span className="text-sm font-semibold text-[#1E3A8A]">Score Breakdown</span>
                    </td>
                  </tr>

                  {/* Score Rows */}
                  {([
                    { key: 'rent', label: 'Affordability Score' },
                    { key: 'commute', label: 'Commute Score' },
                    { key: 'safety', label: 'Safety Score' },
                    { key: 'amenities', label: 'Amenities Score' },
                  ] as const).map(({ key, label }) => (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {label}
                      </td>
                      {compareListings.map((listing) => {
                        const scores = compareListings.map(l => l.scores[key]);
                        const isBest = listing.scores[key] === Math.max(...scores);
                        return (
                          <td key={listing.id} className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`font-bold text-sm ${isBest ? 'text-green-700' : 'text-gray-700'}`}>
                                {listing.scores[key]}
                              </span>
                              <div className="flex-1 max-w-[100px] bg-gray-100 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all ${isBest ? 'bg-green-500' : 'bg-[#1E3A8A]'}`}
                                  style={{ width: `${listing.scores[key]}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Amenities Divider */}
                  <tr>
                    <td colSpan={4} className="px-6 py-3 bg-[#1E3A8A]/5">
                      <span className="text-sm font-semibold text-[#1E3A8A]">Amenities</span>
                    </td>
                  </tr>

                  {/* Amenities Checklist */}
                  {allAmenities.map((amenity) => (
                    <tr key={amenity} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {amenity}
                      </td>
                      {compareListings.map((listing) => {
                        const hasAmenity = listing.amenities.includes(amenity);
                        return (
                          <td key={listing.id} className="px-6 py-3">
                            {hasAmenity ? (
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <Check size={14} className="text-green-600" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                <X size={14} className="text-gray-400" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Action Row */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4"></td>
                    {compareListings.map((listing) => (
                      <td key={listing.id} className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/listing/${listing.id}`)}
                          className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${listing.id === bestListing.id
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-sm'
                            : 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]'
                            }`}
                        >
                          View Details
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation Summary */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
                <Trophy size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Recommendation</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Based on the weighted Value Score calculation, <span className="font-semibold text-[#1E3A8A]">{bestListing.neighborhood}</span> offers
                  the highest overall value at <span className="font-semibold">{bestListing.valueScore}/100</span> with a {bestListing.commute}-minute
                  TTC commute and {bestListing.safety.toLowerCase()} safety rating.
                  {' '}
                  {compareListings.find(l => l.rent === Math.min(...compareListings.map(x => x.rent))) && (
                    <>For the most affordable option, consider <span className="font-semibold text-[#1E3A8A]">
                      {compareListings.find(l => l.rent === Math.min(...compareListings.map(x => x.rent)))!.neighborhood}
                    </span> at ${Math.min(...compareListings.map(x => x.rent))}/month.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}