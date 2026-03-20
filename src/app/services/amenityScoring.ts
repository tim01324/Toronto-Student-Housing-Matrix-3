import { NearbyPOI, getDistanceMeters } from './osmAmenityService';

/**
 * Calculate the amenities score based on:
 * 1. Presence: 20 pts per category present within 1km (max 60 pts)
 * 2. Count: Up to 10 pts per category based on total count
 * 3. Proximity: Up to 10 pts per category based on how close the nearest one is
 * Maximum score is 100.
 */
export function calculateAmenityScore(listingLat: number, listingLng: number, pois: NearbyPOI[]): number {
    const categories = ['supermarket', 'pharmacy', 'library'] as const;
    let score = 0;

    for (const category of categories) {
        const categoryPOIs = pois.filter((p) => p.category === category);
        
        let nearestDistance = Infinity;
        for (const p of categoryPOIs) {
            const dist = getDistanceMeters(listingLat, listingLng, p.lat, p.lng);
            if (dist <= 1000) {
                if (dist < nearestDistance) nearestDistance = dist;
            }
        }

        const validPOICount = categoryPOIs.filter(p => getDistanceMeters(listingLat, listingLng, p.lat, p.lng) <= 1000).length;

        if (validPOICount > 0) {
            // 1. Presence Bonus
            score += 20;

            // 2. Count Bonus (diminishing returns)
            // 1 = 0, 2 = 5, 3+ = 10
            if (validPOICount >= 3) {
                score += 10;
            } else if (validPOICount === 2) {
                score += 5;
            }

            // 3. Proximity Bonus (closer is better, max 10 points for < 100m, 0 points for 1000m)
            const proximityBonus = Math.max(0, 10 - Math.floor(nearestDistance / 100));
            score += proximityBonus;
        }
    }

    // Ensure it doesn't exceed 100
    return Math.min(100, score);
}
