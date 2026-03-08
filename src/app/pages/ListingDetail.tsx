import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, Shield, Wifi, Utensils, Car, Home, Warehouse, Train, GraduationCap } from 'lucide-react';
import { StepIndicator } from '../components/StepIndicator';
import { PageTransition } from '../components/PageTransition';
import { useCompare } from '../context/CompareContext';
import { mockListings } from '../data/mockData';

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const listing = mockListings.find(l => l.id === id) || mockListings[0];
  const { compareListDirs, toggleCompare } = useCompare();

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
    { key: 'rent', label: 'Affordability Score', desc: 'Based on rent relative to area market rates' },
    { key: 'commute', label: 'Commute Score', desc: 'TTC travel time to University of Toronto — St. George' },
    { key: 'safety', label: 'Safety Score', desc: 'Based on historical aggregated crime data for the area' },
    { key: 'amenities', label: 'Amenities Score', desc: 'Available in-unit and nearby amenities' },
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

        {/* Step Indicator */}
        <StepIndicator currentStep={3} />

        {/* Main Content */}
        <main className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="col-span-2 space-y-6">
              {/* Title Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Image placeholder area */}
                <div className="h-48 bg-gradient-to-br from-[#1E3A8A]/10 via-blue-50 to-indigo-50 flex items-center justify-center relative">
                  <div className="text-center">
                    <MapPin size={32} className="text-[#1E3A8A]/40 mx-auto mb-2" />
                    <p className="text-sm text-[#1E3A8A]/50 font-medium">{listing.neighborhood} — Neighbourhood View</p>
                  </div>
                  {/* Value Score Floating Badge */}
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

                  {/* Commute detail */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
                    <GraduationCap size={18} className="text-blue-700" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        {listing.commute} minutes estimated TTC commute to University of Toronto — St. George
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Nearest transit: {listing.nearestTransit}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                  </div>
                </div>
              </div>

              {/* Value Score Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Value Score Breakdown
                </h3>

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
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                            {score}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className={`${colors.bar} h-3 rounded-full transition-all`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Final Score */}
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

              {/* Amenities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Amenities
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {listing.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                      <span className="text-[#1E3A8A]">{getAmenityIcon(amenity)}</span>
                      <span className="text-sm font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Map & Actions */}
            <div className="space-y-6">
              {/* Map Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#1E3A8A]" />
                  Location
                </h3>
                <div className="aspect-square bg-gradient-to-br from-[#E8F0FE] to-[#D0E1FD] rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-15">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={`h-${i}`} className="absolute w-full border-t border-gray-400" style={{ top: `${(i + 1) * 18}%` }} />
                    ))}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={`v-${i}`} className="absolute h-full border-l border-gray-400" style={{ left: `${(i + 1) * 18}%` }} />
                    ))}
                  </div>
                  {/* Pin */}
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-[#1E3A8A] rounded-full flex items-center justify-center shadow-xl ring-4 ring-[#1E3A8A]/20">
                      <MapPin size={22} className="text-white" />
                    </div>
                    <div className="mt-2 bg-white px-3 py-1.5 rounded-lg shadow text-center">
                      <p className="text-xs font-semibold text-gray-900">{listing.neighborhood}</p>
                    </div>
                  </div>
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
                    if (!compareListDirs.includes(listing.id)) {
                      navigate('/compare');
                    }
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
                    <span className="text-gray-500">Nearest Transit</span>
                    <span className="font-semibold text-gray-900 text-xs">{listing.nearestTransit}</span>
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