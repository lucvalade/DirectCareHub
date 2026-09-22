// Developed by VertexAgent.io
// Project: DirectCare Hub - Geofencing Engine

/**
 * Calculates the distance between two geo-coordinates in meters using the Haversine formula.
 */
export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a = 
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * 
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
