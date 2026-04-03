// Utility functions for coordinate conversion
// Multi-state bounding box (OH, PA, WV, KY, IN, MI)
const REGION_BOUNDS = {
  north: 45.0,   // Northern MI
  south: 36.5,   // Southern KY
  east: -74.7,   // Eastern PA
  west: -88.1,   // Western IN
};

// Ohio-specific bounds (for Ohio-only view)
const OHIO_BOUNDS = {
  north: 41.98,
  south: 38.4,
  east: -80.52,
  west: -84.82,
};

// State bounding boxes for individual state views
export const STATE_BOUNDS: Record<string, { north: number; south: number; east: number; west: number }> = {
  OH: OHIO_BOUNDS,
  PA: { north: 42.27, south: 39.72, east: -74.69, west: -80.52 },
  WV: { north: 40.64, south: 37.20, east: -77.72, west: -82.64 },
  KY: { north: 39.15, south: 36.50, east: -81.97, west: -89.57 },
  IN: { north: 41.76, south: 37.77, east: -84.78, west: -88.10 },
  MI: { north: 48.30, south: 41.70, east: -82.12, west: -90.42 },
};

// Convert latitude/longitude to percentage positions on multi-state map
export function coordsToMapPosition(
  latitude: number,
  longitude: number,
  bounds = REGION_BOUNDS
): { x: number; y: number } {
  const x =
    ((longitude - bounds.west) /
      (bounds.east - bounds.west)) *
    100;
  const y =
    ((bounds.north - latitude) /
      (bounds.north - bounds.south)) *
    100;

  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}

// Convert percentage positions back to coordinates
export function mapPositionToCoords(
  x: number,
  y: number,
  bounds = REGION_BOUNDS
): { latitude: number; longitude: number } {
  const latitude =
    bounds.north - (y / 100) * (bounds.north - bounds.south);
  const longitude =
    bounds.west + (x / 100) * (bounds.east - bounds.west);

  return { latitude, longitude };
}

// Get bounds for a specific state or all states
export function getBoundsForState(state?: string) {
  if (state && STATE_BOUNDS[state]) {
    return STATE_BOUNDS[state];
  }
  return REGION_BOUNDS;
}

// Check if coordinates are within a state's bounds
export function isInStateBounds(lat: number, lng: number, state: string): boolean {
  const bounds = STATE_BOUNDS[state];
  if (!bounds) return false;
  
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

// Get all supported states
export const SUPPORTED_STATES = ["OH", "PA", "WV", "KY", "IN", "MI"] as const;
export type SupportedState = typeof SUPPORTED_STATES[number];

// State full names
export const STATE_NAMES: Record<SupportedState, string> = {
  OH: "Ohio",
  PA: "Pennsylvania", 
  WV: "West Virginia",
  KY: "Kentucky",
  IN: "Indiana",
  MI: "Michigan",
};
