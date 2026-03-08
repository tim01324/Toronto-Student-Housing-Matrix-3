import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Clock, Shield, SlidersHorizontal, GraduationCap, Home } from 'lucide-react';
import { StepIndicator } from '../components/StepIndicator';
import { PageTransition, FadeIn } from '../components/PageTransition';

export function Landing() {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('');
  const [priceMin, setPriceMin] = useState(500);
  const [priceMax, setPriceMax] = useState(2000);
  const [housingType, setHousingType] = useState('');
  const [maxCommute, setMaxCommute] = useState(30);
  const [safetyLevel, setSafetyLevel] = useState('all');

  const handleSearch = () => {
    navigate('/results');
  };

  const campusDisplayName = (val: string) => {
    const map: Record<string, string> = {
      'uoft-stgeorge': 'U of T — St. George',
      'uoft-scarborough': 'U of T — Scarborough',
      'uoft-mississauga': 'U of T — Mississauga',
      'ryerson': 'Toronto Metropolitan University',
      'york': 'York University',
      'seneca': 'Seneca Polytechnic',
    };
    return map[val] || 'your selected campus';
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                <Home size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#1E3A8A]">
                Toronto Student Housing Matrix
              </h1>
            </div>
            <span className="text-sm text-gray-500">Academic Decision-Support System</span>
          </div>
        </header>

        {/* Step Indicator */}
        <StepIndicator currentStep={1} />

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#3B82F6] text-white">
          <div className="max-w-[1440px] mx-auto px-8 py-16 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Compare Housing Beyond Rent
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Make informed housing decisions using TTC commute times, neighbourhood safety data, and weighted value scoring.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-[1440px] mx-auto px-8 -mt-8">
          {/* Search Card */}
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Search size={20} className="text-[#1E3A8A]" />
              Set Your Search Criteria
            </h3>

            <div className="space-y-6">
              {/* Row 1: Campus + Housing Type */}
              <div className="grid grid-cols-2 gap-6">
                {/* Campus Selection */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap size={15} className="text-[#1E3A8A]" />
                    Select Campus
                  </label>
                  <select
                    id="campus-select"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  >
                    <option value="">Choose a campus...</option>
                    <option value="uoft-stgeorge">University of Toronto — St. George</option>
                    <option value="uoft-scarborough">University of Toronto — Scarborough</option>
                    <option value="uoft-mississauga">University of Toronto — Mississauga</option>
                    <option value="ryerson">Toronto Metropolitan University</option>
                    <option value="york">York University</option>
                    <option value="seneca">Seneca Polytechnic</option>
                  </select>
                </div>

                {/* Housing Type Selection */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <Home size={15} className="text-[#1E3A8A]" />
                    Housing Type
                  </label>
                  <select
                    id="housing-type-select"
                    value={housingType}
                    onChange={(e) => setHousingType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  >
                    <option value="">All types</option>
                    <option value="apartment">Apartment</option>
                    <option value="shared">Shared House</option>
                    <option value="studio">Studio</option>
                    <option value="basement">Basement</option>
                    <option value="room">Room Rental</option>
                  </select>
                </div>
              </div>

              {/* Price Range — Dual Slider */}
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-3">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[#1E3A8A]">$</span>
                    Monthly Price Range
                  </span>
                  <span className="text-[#1E3A8A] font-semibold">
                    ${priceMin} — ${priceMax}
                  </span>
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 w-12">Min</span>
                    <input
                      id="price-min-slider"
                      type="range"
                      min="300"
                      max="3000"
                      step="50"
                      value={priceMin}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val < priceMax) setPriceMin(val);
                      }}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 w-16 text-right">${priceMin}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 w-12">Max</span>
                    <input
                      id="price-max-slider"
                      type="range"
                      min="300"
                      max="3000"
                      step="50"
                      value={priceMax}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > priceMin) setPriceMax(val);
                      }}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 w-16 text-right">${priceMax}</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Max Commute + Safety */}
              <div className="grid grid-cols-2 gap-6">
                {/* Max Commute */}
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} className="text-[#1E3A8A]" />
                      Max TTC Commute
                    </span>
                    <span className="text-[#1E3A8A] font-semibold">{maxCommute} min</span>
                  </label>
                  {campus && (
                    <p className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                      <MapPin size={11} />
                      To: {campusDisplayName(campus)}
                    </p>
                  )}
                  {!campus && (
                    <p className="text-xs text-amber-600 mb-2">
                      ⚠ Select a campus first
                    </p>
                  )}
                  <input
                    id="commute-slider"
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={maxCommute}
                    onChange={(e) => setMaxCommute(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>10 min</span>
                    <span>60 min</span>
                  </div>
                </div>

                {/* Safety Preference */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <Shield size={15} className="text-[#1E3A8A]" />
                    Minimum Safety Level
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Based on historical crime data</p>
                  <div className="flex gap-2">
                    {[
                      { value: 'all', label: 'Any' },
                      { value: 'medium', label: 'Medium+' },
                      { value: 'high', label: 'High Only' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSafetyLevel(opt.value)}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${safetyLevel === opt.value
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#1E3A8A]'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                id="find-housing-btn"
                onClick={handleSearch}
                className="w-full bg-[#1E3A8A] text-white py-4 rounded-lg hover:bg-[#1E40AF] transition-all flex items-center justify-center gap-2 text-lg font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-[0.99]"
              >
                <Search size={22} />
                Find Housing
              </button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="max-w-5xl mx-auto mt-12 mb-16">
            <h3 className="text-center text-lg font-semibold text-gray-700 mb-8">
              How We Help You Decide
            </h3>
            <div className="grid grid-cols-4 gap-6">
              {[
                {
                  icon: Clock,
                  title: 'TTC Commute Times',
                  desc: 'Estimated transit commute to your selected campus',
                  color: 'bg-blue-50 text-blue-700',
                  iconColor: 'text-blue-600',
                },
                {
                  icon: Shield,
                  title: 'Safety Data',
                  desc: 'Neighbourhood crime statistics as relative safety indicators',
                  color: 'bg-green-50 text-green-700',
                  iconColor: 'text-green-600',
                },
                {
                  icon: SlidersHorizontal,
                  title: 'Value Score',
                  desc: 'Weighted composite score for objective housing comparison',
                  color: 'bg-purple-50 text-purple-700',
                  iconColor: 'text-purple-600',
                },
                {
                  icon: MapPin,
                  title: 'Map Visualization',
                  desc: 'Interactive map showing housing locations across Toronto',
                  color: 'bg-orange-50 text-orange-700',
                  iconColor: 'text-orange-600',
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                      <Icon size={24} className={feature.iconColor} />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}