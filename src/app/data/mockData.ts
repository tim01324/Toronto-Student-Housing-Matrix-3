export interface Listing {
    id: string;
    neighborhood: string;
    type: string;
    rent: number;
    commute: number;
    safety: 'Low' | 'Medium' | 'High';
    valueScore: number;
    lat: number;
    lng: number;
    scores: { rent: number; commute: number; safety: number; amenities: number };
    amenities: string[];
    description: string;
    crimeIndex: string;
    nearestTransit: string;
}

export const mockListings: Listing[] = [
    {
        id: '1',
        neighborhood: 'The Annex',
        type: 'Apartment',
        rent: 1450,
        commute: 15,
        safety: 'High',
        valueScore: 85,
        lat: 43.6698,
        lng: -79.4025,
        scores: { rent: 82, commute: 90, safety: 88, amenities: 85 },
        amenities: ['WiFi', 'Laundry', 'Kitchen', 'Parking'],
        description: 'Well-connected neighborhood near University of Toronto with excellent transit access. Close to Bloor-Danforth subway line, grocery stores, and libraries.',
        crimeIndex: 'Low',
        nearestTransit: 'Spadina Station (2 min walk)',
    },
    {
        id: '2',
        neighborhood: 'Kensington Market',
        type: 'Shared House',
        rent: 1300,
        commute: 20,
        safety: 'Medium',
        valueScore: 78,
        lat: 43.6543,
        lng: -79.4004,
        scores: { rent: 88, commute: 80, safety: 70, amenities: 75 },
        amenities: ['WiFi', 'Kitchen', 'Nearby Transit'],
        description: 'Vibrant cultural area with diverse dining and shopping options. Public transit access via Dundas streetcar and Spadina line.',
        crimeIndex: 'Moderate',
        nearestTransit: 'St. Patrick Station (8 min walk)',
    },
    {
        id: '3',
        neighborhood: 'Little Italy',
        type: 'Apartment',
        rent: 1550,
        commute: 18,
        safety: 'High',
        valueScore: 82,
        lat: 43.6560,
        lng: -79.4192,
        scores: { rent: 78, commute: 85, safety: 90, amenities: 80 },
        amenities: ['WiFi', 'Laundry', 'Kitchen', 'Parking', 'Storage'],
        description: 'Historic neighborhood with excellent dining and safe streets. Connected by College streetcar and Ossington bus.',
        crimeIndex: 'Low',
        nearestTransit: 'Ossington Station (5 min walk)',
    },
    {
        id: '4',
        neighborhood: 'Chinatown',
        type: 'Room Rental',
        rent: 1200,
        commute: 25,
        safety: 'Medium',
        valueScore: 75,
        lat: 43.6531,
        lng: -79.3979,
        scores: { rent: 92, commute: 75, safety: 65, amenities: 68 },
        amenities: ['WiFi', 'Kitchen'],
        description: 'Bustling area with amazing affordable grocery options. Right on the Spadina streetcar line.',
        crimeIndex: 'Moderate',
        nearestTransit: 'Dundas St & Spadina Ave (1 min walk)',
    },
    {
        id: '5',
        neighborhood: 'Trinity Bellwoods',
        type: 'Studio',
        rent: 1650,
        commute: 22,
        safety: 'High',
        valueScore: 80,
        lat: 43.6475,
        lng: -79.4144,
        scores: { rent: 70, commute: 82, safety: 92, amenities: 78 },
        amenities: ['WiFi', 'Kitchen', 'Pet Friendly'],
        description: 'Beautiful area next to the park. Very safe and trendy, slightly further from campus but worth it for the lifestyle.',
        crimeIndex: 'Low',
        nearestTransit: 'Queen St & Ossington Ave (4 min walk)',
    },
    {
        id: '6',
        neighborhood: 'Christie Pits',
        type: 'Basement',
        rent: 1400,
        commute: 17,
        safety: 'High',
        valueScore: 83,
        lat: 43.6639,
        lng: -79.4177,
        scores: { rent: 85, commute: 88, safety: 85, amenities: 74 },
        amenities: ['WiFi', 'Laundry', 'Kitchen', 'Backyard Access'],
        description: 'Quiet residential street right by the park and subway station. Excellent value and very safe.',
        crimeIndex: 'Low',
        nearestTransit: 'Christie Station (3 min walk)',
    },
];
