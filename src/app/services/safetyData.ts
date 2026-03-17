/**
 * Safety Data Service
 * Source: Toronto Police Service Open Data – Neighbourhood Crime Rates
 * Data Portal: https://data.torontopolice.on.ca/
 * Dataset: Neighbourhood Crime Rates Open Data (POPULATION_2025, crime counts 2024)
 *
 * Real figures extracted from the official TPS CSV.
 * Rate = (Assault + AutoTheft + BreakEnter + Robbery) / POPULATION_2025 × 1000
 *
 * Neighbourhood mapping to TPS Hood IDs:
 *  The Annex         → "Annex"               Hood 95  | Pop 38,487
 *  Kensington Market → "Kensington-Chinatown" Hood 78  | Pop 22,801
 *  Little Italy      → "Dovercourt Village"   Hood 172 | Pop 13,129
 *  Chinatown         → "Kensington-Chinatown" Hood 78  (same TPS zone)
 *  Trinity Bellwoods → "Dovercourt Village"   Hood 172 (adjacent)
 *  Christie Pits     → "Wychwood"             Hood 94  | Pop 15,375
 */

export interface SafetyStats {
  neighbourhood: string;
  crimeRatePer1000: number;     // Major crimes per 1,000 residents (TPS 2024)
  majorCrimesPerYear: number;   // Annual major crime incidents (TPS 2024)
  assaults: number;
  breakAndEnter: number;
  autoTheft: number;
  robbery: number;
  safetyScore: number;          // 0–100, higher = safer
  safetyLevel: 'Low' | 'Medium' | 'High';
  source: string;
  lastUpdated: string;
}

const safetyDataByNeighbourhood: Record<string, SafetyStats> = {
  'The Annex': {
    neighbourhood: 'The Annex',
    crimeRatePer1000: 18.3,
    majorCrimesPerYear: 705,
    assaults: 448,
    breakAndEnter: 148,
    autoTheft: 65,
    robbery: 44,
    safetyScore: 88,
    safetyLevel: 'High',
    source: 'Toronto Police Service Open Data – Neighbourhood Crime Rates (2024)',
    lastUpdated: '2024',
  },
  'Kensington Market': {
    neighbourhood: 'Kensington Market',
    crimeRatePer1000: 31.4,
    majorCrimesPerYear: 717,
    assaults: 476,
    breakAndEnter: 152,
    autoTheft: 28,
    robbery: 61,
    safetyScore: 72,
    safetyLevel: 'Medium',
    source: 'Toronto Police Service Open Data – Neighbourhood Crime Rates (2024)',
    lastUpdated: '2024',
  },
  'Little Italy': {
    neighbourhood: 'Little Italy',
    crimeRatePer1000: 16.1,
    majorCrimesPerYear: 211,
    assaults: 118,
    breakAndEnter: 45,
    autoTheft: 36,
    robbery: 12,
    safetyScore: 91,
    safetyLevel: 'High',
    source: 'Toronto Police Service Open Data – Neighbourhood Crime Rates (2024)',
    lastUpdated: '2024',
  },
  'Chinatown': {
    neighbourhood: 'Chinatown',
    crimeRatePer1000: 31.4,
    majorCrimesPerYear: 717,
    assaults: 476,
    breakAndEnter: 152,
    autoTheft: 28,
    robbery: 61,
    safetyScore: 72,
    safetyLevel: 'Medium',
    source: 'Toronto Police Service Open Data – Neighbourhood Crime Rates (2024)',
    lastUpdated: '2024',
  },
  'Trinity Bellwoods': {
    neighbourhood: 'Trinity Bellwoods',
    crimeRatePer1000: 16.1,
    majorCrimesPerYear: 211,
    assaults: 118,
    breakAndEnter: 45,
    autoTheft: 36,
    robbery: 12,
    safetyScore: 91,
    safetyLevel: 'High',
    source: 'Toronto Police Service Open Data – Neighbourhood Crime Rates (2024)',
    lastUpdated: '2024',
  },
  'Christie Pits': {
    neighbourhood: 'Christie Pits',
    crimeRatePer1000: 11.4,
    majorCrimesPerYear: 175,
    assaults: 100,
    breakAndEnter: 36,
    autoTheft: 33,
    robbery: 6,
    safetyScore: 94,
    safetyLevel: 'High',
    source: 'Toronto Police Service Open Data – Neighbourhood Crime Rates (2024)',
    lastUpdated: '2024',
  },
};

export function getSafetyStats(neighbourhood: string): SafetyStats | null {
  return safetyDataByNeighbourhood[neighbourhood] ?? null;
}

export function getAllSafetyData(): Record<string, SafetyStats> {
  return safetyDataByNeighbourhood;
}
