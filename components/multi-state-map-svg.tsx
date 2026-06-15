"use client";

import { memo, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { STATE_NAMES } from "@/lib/map-utils";
import type { Tavern } from "@/lib/tavern-service";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const SUPPORTED_FIPS: Record<string, string> = {
  "39": "OH",
  "42": "PA",
  "54": "WV",
  "21": "KY",
  "18": "IN",
  "26": "MI",
};

const CITIES = [
  { name: "Columbus",     coordinates: [-82.9988, 39.9612] as [number, number], state: "OH", size: "large" },
  { name: "Cleveland",    coordinates: [-81.6944, 41.4993] as [number, number], state: "OH", size: "large" },
  { name: "Cincinnati",   coordinates: [-84.512,  39.1031] as [number, number], state: "OH", size: "large" },
  { name: "Toledo",       coordinates: [-83.5379, 41.6528] as [number, number], state: "OH", size: "medium" },
  { name: "Dayton",       coordinates: [-84.1916, 39.7589] as [number, number], state: "OH", size: "medium" },
  { name: "Akron",        coordinates: [-81.519,  41.0814] as [number, number], state: "OH", size: "medium" },
  { name: "Youngstown",   coordinates: [-80.6496, 41.0994] as [number, number], state: "OH", size: "small" },
  { name: "Springfield",  coordinates: [-83.8093, 39.9211] as [number, number], state: "OH", size: "small" },
  { name: "Pittsburgh",   coordinates: [-79.9959, 40.4406] as [number, number], state: "PA", size: "large" },
  { name: "Indianapolis", coordinates: [-86.1581, 39.7684] as [number, number], state: "IN", size: "large" },
  { name: "Fort Wayne",   coordinates: [-85.1394, 41.0793] as [number, number], state: "IN", size: "medium" },
  { name: "Detroit",      coordinates: [-83.0458, 42.3314] as [number, number], state: "MI", size: "large" },
  { name: "Louisville",   coordinates: [-85.7585, 38.2527] as [number, number], state: "KY", size: "large" },
  { name: "Lexington",    coordinates: [-84.5037, 38.0406] as [number, number], state: "KY", size: "medium" },
  { name: "Charleston",   coordinates: [-81.6326, 38.3498] as [number, number], state: "WV", size: "large" },
];

interface MultiStateMapSVGProps {
  activeState: string | null;
  onStateClick: (stateAbbr: string) => void;
  highlightedStates: string[];
  taverns: Tavern[];
  activeTavernId: string | null;
  hoveredPinId: string | null;
  onTavernClick: (id: string) => void;
  onTavernHover: (id: string | null) => void;
  className?: string;
}

// --- Clustering logic ---
// At a given zoom level, group taverns whose projected coordinates are within
// CLUSTER_RADIUS degrees of each other. We work in lon/lat space (cheap enough
// for this density of points).
function clusterTaverns(taverns: Tavern[], zoom: number) {
  // Radius shrinks as zoom increases — tighter cluster radius at high zoom
  const radius = 1.2 / zoom;

  const visited = new Set<string>();
  const clusters: { taverns: Tavern[]; lon: number; lat: number }[] = [];

  for (const t of taverns) {
    if (visited.has(t.id)) continue;
    visited.add(t.id);

    const group: Tavern[] = [t];
    for (const other of taverns) {
      if (visited.has(other.id)) continue;
      const dLon = Math.abs(other.longitude - t.longitude);
      const dLat = Math.abs(other.latitude - t.latitude);
      if (dLon <= radius && dLat <= radius) {
        group.push(other);
        visited.add(other.id);
      }
    }

    // Centre of the cluster = average lon/lat
    const lon = group.reduce((s, g) => s + g.longitude, 0) / group.length;
    const lat = group.reduce((s, g) => s + g.latitude, 0) / group.length;
    clusters.push({ taverns: group, lon, lat });
  }

  return clusters;
}

function MultiStateMapSVGComponent({
  activeState,
  onStateClick,
  highlightedStates = [],
  taverns = [],
  activeTavernId,
  hoveredPinId,
  onTavernClick,
  onTavernHover,
  className = "",
}: MultiStateMapSVGProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredClusterIdx, setHoveredClusterIdx] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([-83.0, 40.0]);

  const handleZoomIn  = () => setZoom(prev => Math.min(prev * 1.6, 12));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.6, 1));
  const handleReset   = () => { setZoom(1); setCenter([-83.0, 40.0]); };

  // Valid taverns only
  const validTaverns = useMemo(() =>
    taverns.filter(t =>
      typeof t.latitude  === "number" && !isNaN(t.latitude)  && t.latitude  >= 24 && t.latitude  <= 50 &&
      typeof t.longitude === "number" && !isNaN(t.longitude) && t.longitude >= -125 && t.longitude <= -66
    ), [taverns]);

  // Re-cluster whenever zoom or tavern list changes
  const clusters = useMemo(() => clusterTaverns(validTaverns, zoom), [validTaverns, zoom]);

  // Is any cluster/tavern active?
  const activeClusterIdx = clusters.findIndex(c => c.taverns.some(t => t.id === activeTavernId));

  return (
    <div className={`relative w-full h-full ${className}`}>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-darker-wood/90 border border-border rounded-sm flex items-center justify-center text-foreground hover:bg-card hover:border-amber/50 transition-colors"
          aria-label="Zoom in"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-darker-wood/90 border border-border rounded-sm flex items-center justify-center text-foreground hover:bg-card hover:border-amber/50 transition-colors"
          aria-label="Zoom out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12" />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 bg-darker-wood/90 border border-border rounded-sm flex items-center justify-center text-foreground hover:bg-card hover:border-amber/50 transition-colors text-xs font-bold"
          aria-label="Reset view"
        >
          R
        </button>
      </div>

      {/* Zoom hint */}
      <div className="absolute bottom-14 right-4 z-10 text-xs text-muted-foreground/50 hidden lg:block">
        Scroll to zoom · Drag to pan
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [-83.0, 40.0], scale: 5500 }}
        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          minZoom={0.8}
          maxZoom={12}
          onMoveEnd={({ coordinates, zoom: z }) => {
            setCenter(coordinates as [number, number]);
            setZoom(z);
          }}
        >
          {/* State fills */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips = geo.id;
                const stateAbbr = SUPPORTED_FIPS[fips];
                if (!stateAbbr) return null;

                const isHighlighted = highlightedStates.includes(stateAbbr);
                const isActive  = stateAbbr === activeState;
                const isHovered = stateAbbr === hoveredState;
                const isOhio   = stateAbbr === "OH";

                let fillColor   = "rgba(30, 28, 26, 0.6)";
                let strokeColor = "rgba(180, 140, 80, 0.3)";
                let strokeWidth = 0.5;

                if (isOhio) {
                  fillColor   = isActive || isHovered ? "rgba(217, 165, 75, 0.45)" : "rgba(217, 165, 75, 0.25)";
                  strokeColor = "rgba(217, 165, 75, 0.9)";
                  strokeWidth = 1;
                } else if (isActive || isHovered) {
                  fillColor   = "rgba(217, 165, 75, 0.3)";
                  strokeColor = "rgba(217, 165, 75, 0.7)";
                  strokeWidth = 0.8;
                } else if (isHighlighted) {
                  fillColor   = "rgba(217, 165, 75, 0.15)";
                  strokeColor = "rgba(217, 165, 75, 0.5)";
                  strokeWidth = 0.6;
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredState(stateAbbr)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => onStateClick(stateAbbr)}
                    style={{
                      default: { fill: fillColor, stroke: strokeColor, strokeWidth, outline: "none", cursor: "pointer", transition: "all 0.2s" },
                      hover:   { fill: isOhio ? "rgba(217, 165, 75, 0.5)" : "rgba(217, 165, 75, 0.35)", stroke: "rgba(217, 165, 75, 0.9)", strokeWidth: isOhio ? 1.2 : 1, outline: "none", cursor: "pointer" },
                      pressed: { fill: "rgba(217, 165, 75, 0.4)", stroke: "rgba(217, 165, 75, 1)", strokeWidth: 1.2, outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Lake Erie label */}
          <Marker coordinates={[-81.5, 41.8]}>
            <text textAnchor="middle" fill="rgba(100,160,200,0.4)" fontSize={8} fontFamily="system-ui" fontStyle="italic" fontWeight={500} style={{ pointerEvents: "none" }}>
              Lake Erie
            </text>
          </Marker>

          {/* City dots */}
          {CITIES.map((city) => {
            const dotSize  = city.size === "large" ? 2.5 : city.size === "medium" ? 2 : 1.5;
            const fontSize = city.size === "large" ? 6 : city.size === "medium" ? 5 : 4.2;
            const isOhio   = city.state === "OH";
            return (
              <Marker key={city.name} coordinates={city.coordinates}>
                <circle r={dotSize} fill={isOhio ? "rgba(217,165,75,0.8)" : "rgba(217,165,75,0.5)"} stroke="rgba(217,165,75,0.9)" strokeWidth={0.4} />
                <text textAnchor="middle" y={-dotSize - 3} fill={isOhio ? "rgba(245,235,220,0.9)" : "rgba(200,190,175,0.7)"} fontSize={fontSize} fontFamily="system-ui" fontWeight={city.size === "large" ? 700 : 600} style={{ pointerEvents: "none" }}>
                  {city.name}
                </text>
              </Marker>
            );
          })}

          {/* State labels */}
          {[
            { abbr: "OH", coords: [-82.7, 40.4] as [number, number], isMain: true  },
            { abbr: "PA", coords: [-77.5, 41.0] as [number, number], isMain: false },
            { abbr: "WV", coords: [-80.5, 38.8] as [number, number], isMain: false },
            { abbr: "KY", coords: [-85.5, 37.6] as [number, number], isMain: false },
            { abbr: "IN", coords: [-86.2, 40.2] as [number, number], isMain: false },
            { abbr: "MI", coords: [-84.5, 43.8] as [number, number], isMain: false },
          ].map(({ abbr, coords, isMain }) => (
            <Marker key={abbr} coordinates={coords}>
              <text textAnchor="middle" fill={isMain ? "rgba(35,30,25,0.8)" : "rgba(217,165,75,0.4)"} fontSize={isMain ? 12 : 9} fontFamily="system-ui" fontWeight={800} letterSpacing="0.1em" style={{ pointerEvents: "none" }}>
                {abbr}
              </text>
            </Marker>
          ))}

          {/* Clustered tavern pins */}
          {clusters.map((cluster, idx) => {
            const isSingle   = cluster.taverns.length === 1;
            const tavern     = cluster.taverns[0];
            const isActive   = isSingle ? activeTavernId === tavern.id : activeClusterIdx === idx;
            const isHovered  = hoveredClusterIdx === idx;
            const allApproved = cluster.taverns.every(t => t.dude_approved);
            const anyApproved = cluster.taverns.some(t => t.dude_approved);
            const coords: [number, number] = [cluster.lon, cluster.lat];

            // Cluster bubble
            if (!isSingle) {
              const r = 9;
              return (
                <Marker
                  key={`cluster-${idx}`}
                  coordinates={coords}
                  onClick={() => {
                    // If clicking a cluster, select the first tavern and let the
                    // sidebar show them — user can also zoom in to split the cluster
                    onTavernClick(tavern.id);
                  }}
                  onMouseEnter={() => setHoveredClusterIdx(idx)}
                  onMouseLeave={() => setHoveredClusterIdx(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Outer glow ring */}
                  <circle
                    r={r + 4}
                    fill={anyApproved ? "rgba(217,165,75,0.15)" : "rgba(217,165,75,0.08)"}
                    stroke={anyApproved ? "rgba(217,165,75,0.5)" : "rgba(217,165,75,0.25)"}
                    strokeWidth={0.8}
                  />
                  {/* Main bubble */}
                  <circle
                    r={r}
                    fill={isActive || isHovered
                      ? (anyApproved ? "#d9a54b" : "#444038")
                      : (anyApproved ? "rgba(217,165,75,0.85)" : "rgba(40,36,30,0.95)")}
                    stroke={anyApproved ? "#f5b942" : "rgba(217,165,75,0.7)"}
                    strokeWidth={isActive ? 1.5 : 1}
                    style={{ filter: isActive ? "drop-shadow(0 0 5px rgba(217,165,75,0.7))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
                  />
                  {/* Count */}
                  <text
                    textAnchor="middle"
                    y={3.5}
                    fill={isActive || isHovered
                      ? (anyApproved ? "#1e1c1a" : "#d9a54b")
                      : (anyApproved ? "#1e1c1a" : "#d9a54b")}
                    fontSize={7}
                    fontWeight={900}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {cluster.taverns.length}
                  </text>

                  {/* Hover tooltip */}
                  {isHovered && (
                    <g transform="translate(0, -22)">
                      <rect x={-52} y={-18} width={104} height={16} rx={3} fill="rgba(0,0,0,0.92)" />
                      <polygon points="-5,0 5,0 0,5" fill="rgba(0,0,0,0.92)" />
                      <text textAnchor="middle" y={-9} fill="white" fontSize={5.5} fontWeight={700} fontFamily="system-ui" style={{ pointerEvents: "none" }}>
                        {cluster.taverns.length} stops · zoom in to split
                      </text>
                      <text textAnchor="middle" y={-3} fill="rgba(217,165,75,0.8)" fontSize={4.5} fontFamily="system-ui" style={{ pointerEvents: "none" }}>
                        {cluster.taverns.map(t => `#${t.stop_number}`).join(" · ")}
                      </text>
                    </g>
                  )}
                </Marker>
              );
            }

            // Single pin — clean teardrop design
            return (
              <Marker
                key={tavern.id}
                coordinates={coords}
                onClick={() => onTavernClick(tavern.id)}
                onMouseEnter={() => { onTavernHover(tavern.id); setHoveredClusterIdx(idx); }}
                onMouseLeave={() => { onTavernHover(null); setHoveredClusterIdx(null); }}
                style={{ cursor: "pointer" }}
              >
                {/* Active pulse ring */}
                {isActive && (
                  <circle r={14} fill="none" stroke="rgba(217,165,75,0.4)" strokeWidth={2} className="animate-ping" />
                )}

                <g
                  transform={`scale(${isActive ? 1.25 : isHovered ? 1.12 : 1})`}
                  style={{ transition: "transform 0.15s ease-out", transformOrigin: "0 0" }}
                >
                  {/* Drop shadow */}
                  <ellipse cx={0} cy={10} rx={5} ry={2} fill="rgba(0,0,0,0.35)" />

                  {/* Pin body — teardrop */}
                  <path
                    d="M0,-14 C-7,-14 -11,-8 -11,-2 C-11,4 0,12 0,12 C0,12 11,4 11,-2 C11,-8 7,-14 0,-14 Z"
                    fill={
                      tavern.dude_approved
                        ? isActive ? "#f5c55a" : isHovered ? "#edb83a" : "#d9a54b"
                        : isActive ? "#3a3630" : isHovered ? "#322e28" : "rgba(28,26,22,0.97)"
                    }
                    stroke={tavern.dude_approved ? "#f5b942" : "rgba(217,165,75,0.8)"}
                    strokeWidth={isActive ? 1.8 : 1.2}
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 0 6px rgba(217,165,75,0.7))"
                        : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                    }}
                  />

                  {/* Stop number */}
                  <text
                    textAnchor="middle"
                    y={-2}
                    fill={tavern.dude_approved ? "#1e1c1a" : "#d9a54b"}
                    fontSize={tavern.stop_number && tavern.stop_number > 99 ? 5.5 : 6.5}
                    fontWeight={900}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {tavern.stop_number}
                  </text>

                  {/* Dude Approved check badge */}
                  {tavern.dude_approved && (
                    <g transform="translate(8, -18)">
                      <circle r={6} fill="white" stroke="#f5b942" strokeWidth={1.5} style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }} />
                      <path d="M-2.5,0.5 L-0.5,2.5 L3,-1.5" fill="none" stroke="#1a7a3c" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )}
                </g>

                {/* Hover / active name tooltip */}
                {(isActive || isHovered) && (
                  <g transform="translate(0, -32)">
                    <rect
                      x={-55} y={-20} width={110} height={19} rx={3}
                      fill={isActive ? "#d9a54b" : "rgba(10,9,8,0.93)"}
                    />
                    <polygon points="-5,0 5,0 0,5" fill={isActive ? "#d9a54b" : "rgba(10,9,8,0.93)"} />
                    <text textAnchor="middle" y={-10} fill={isActive ? "#1e1c1a" : "white"} fontSize={6} fontWeight={700} fontFamily="system-ui" style={{ pointerEvents: "none" }}>
                      {tavern.name.length > 22 ? tavern.name.slice(0, 20) + "…" : tavern.name}
                    </text>
                    <text textAnchor="middle" y={-3} fill={isActive ? "rgba(30,28,26,0.7)" : "rgba(217,165,75,0.8)"} fontSize={4.5} fontFamily="system-ui" style={{ pointerEvents: "none" }}>
                      #{tavern.stop_number} · {tavern.city}, {tavern.state}
                    </text>
                  </g>
                )}
              </Marker>
            );
          })}

        </ZoomableGroup>
      </ComposableMap>

      {/* State hover label */}
      {hoveredState && (
        <div className="absolute top-3 right-14 px-3 py-1.5 bg-darker-wood/95 backdrop-blur-sm border border-amber/40 rounded text-sm shadow-lg z-20">
          <span className="text-amber font-bold">{hoveredState}</span>
          <span className="text-muted-foreground ml-2">{STATE_NAMES[hoveredState]}</span>
        </div>
      )}

      {/* Compass */}
      <div className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center z-10">
        <div className="relative w-8 h-8 border border-amber/30 rounded-full bg-darker-wood/80 flex items-center justify-center">
          <span className="text-[8px] font-bold text-amber/70 absolute -top-0.5">N</span>
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-amber/60" />
        </div>
      </div>
    </div>
  );
}

export const MultiStateMapSVG = memo(MultiStateMapSVGComponent);
