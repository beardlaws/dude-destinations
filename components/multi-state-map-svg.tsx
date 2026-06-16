"use client";

import { memo, useState, useMemo, useCallback } from "react";
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

// State centers for zoom-to-state
const STATE_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  OH: { center: [-82.7, 40.2], zoom: 3.5 },
  PA: { center: [-77.5, 41.0], zoom: 3.0 },
  WV: { center: [-80.5, 38.8], zoom: 3.5 },
  KY: { center: [-84.5, 37.8], zoom: 3.0 },
  IN: { center: [-86.1, 40.0], zoom: 3.0 },
  MI: { center: [-84.5, 44.0], zoom: 2.5 },
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
  { name: "Louisville",   coordinates: [-85.7585, 38.2527] as [number, number], state: "KY", size: "large" },
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

// Cluster radius scales aggressively with zoom so pins split apart quickly
function clusterTaverns(taverns: Tavern[], zoom: number) {
  const radius = 0.35 / zoom; // tighter than before — splits at lower zoom level

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

  const handleZoomIn  = () => setZoom(prev => Math.min(prev * 1.8, 16));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.8, 1));
  const handleReset   = () => { setZoom(1); setCenter([-83.0, 40.0]); };

  // Zoom into a state when clicked
  const handleStateClick = useCallback((stateAbbr: string) => {
    onStateClick(stateAbbr);
    const target = STATE_CENTERS[stateAbbr];
    if (target) {
      setCenter(target.center);
      setZoom(target.zoom);
    }
  }, [onStateClick]);

  const validTaverns = useMemo(() =>
    taverns.filter(t =>
      typeof t.latitude  === "number" && !isNaN(t.latitude)  && t.latitude  >= 24 && t.latitude  <= 50 &&
      typeof t.longitude === "number" && !isNaN(t.longitude) && t.longitude >= -125 && t.longitude <= -66
    ), [taverns]);

  const clusters = useMemo(() => clusterTaverns(validTaverns, zoom), [validTaverns, zoom]);
  const activeClusterIdx = clusters.findIndex(c => c.taverns.some(t => t.id === activeTavernId));

  // Pin size scales with zoom — small dots at low zoom, readable at high zoom
  const pinScale = Math.min(1, Math.max(0.18, zoom * 0.14));

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

      {/* Hint */}
      <div className="absolute bottom-14 right-4 z-10 text-xs text-muted-foreground/40 hidden lg:block select-none">
        Click a state to zoom · Scroll to zoom · Drag to pan
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
          maxZoom={16}
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
                    onClick={() => handleStateClick(stateAbbr)}
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

          {/* Lake Erie */}
          <Marker coordinates={[-81.5, 41.8]}>
            <text textAnchor="middle" fill="rgba(100,160,200,0.35)" fontSize={7} fontFamily="system-ui" fontStyle="italic" fontWeight={500} style={{ pointerEvents: "none" }}>
              Lake Erie
            </text>
          </Marker>

          {/* City dots — only show at higher zoom levels */}
          {zoom >= 1.5 && CITIES.map((city) => {
            const dotSize  = city.size === "large" ? 2 : city.size === "medium" ? 1.5 : 1.2;
            const fontSize = city.size === "large" ? 5.5 : city.size === "medium" ? 4.5 : 3.8;
            const isOhio   = city.state === "OH";
            return (
              <Marker key={city.name} coordinates={city.coordinates}>
                <circle r={dotSize} fill={isOhio ? "rgba(217,165,75,0.7)" : "rgba(217,165,75,0.4)"} stroke="rgba(217,165,75,0.6)" strokeWidth={0.3} />
                <text textAnchor="middle" y={-dotSize - 2} fill={isOhio ? "rgba(245,235,220,0.8)" : "rgba(200,190,175,0.55)"} fontSize={fontSize} fontFamily="system-ui" fontWeight={city.size === "large" ? 700 : 600} style={{ pointerEvents: "none" }}>
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
              <text textAnchor="middle" fill={isMain ? "rgba(35,30,25,0.7)" : "rgba(217,165,75,0.35)"} fontSize={isMain ? 11 : 8} fontFamily="system-ui" fontWeight={800} letterSpacing="0.1em" style={{ pointerEvents: "none" }}>
                {abbr}
              </text>
            </Marker>
          ))}

          {/* Pins */}
          {clusters.map((cluster, idx) => {
            const isSingle  = cluster.taverns.length === 1;
            const tavern    = cluster.taverns[0];
            const isActive  = isSingle ? activeTavernId === tavern.id : activeClusterIdx === idx;
            const isHovered = hoveredClusterIdx === idx;
            const anyApproved = cluster.taverns.some(t => t.dude_approved);
            const coords: [number, number] = [cluster.lon, cluster.lat];

            // --- CLUSTER BUBBLE ---
            if (!isSingle) {
              const r = 5.5 * pinScale;
              const fontSize = Math.max(4, 6 * pinScale);
              return (
                <Marker
                  key={`cluster-${idx}`}
                  coordinates={coords}
                  onClick={() => {
                    onTavernClick(tavern.id);
                    // Zoom in to split
                    setZoom(prev => Math.min(prev * 2.5, 16));
                    setCenter(coords);
                  }}
                  onMouseEnter={() => setHoveredClusterIdx(idx)}
                  onMouseLeave={() => setHoveredClusterIdx(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Outer ring */}
                  <circle
                    r={r + 3 * pinScale}
                    fill="rgba(217,165,75,0.1)"
                    stroke={anyApproved ? "rgba(217,165,75,0.4)" : "rgba(217,165,75,0.2)"}
                    strokeWidth={0.6}
                  />
                  {/* Main circle */}
                  <circle
                    r={r}
                    fill={isHovered
                      ? (anyApproved ? "#d9a54b" : "#3a3630")
                      : (anyApproved ? "rgba(217,165,75,0.9)" : "rgba(35,32,28,0.97)")}
                    stroke={anyApproved ? "#f5b942" : "rgba(217,165,75,0.6)"}
                    strokeWidth={isHovered ? 1.2 : 0.8}
                    style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
                  />
                  <text
                    textAnchor="middle"
                    y={fontSize * 0.35}
                    fill={isHovered
                      ? (anyApproved ? "#1e1c1a" : "#d9a54b")
                      : (anyApproved ? "#1e1c1a" : "#d9a54b")}
                    fontSize={fontSize}
                    fontWeight={900}
                    fontFamily="system-ui, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {cluster.taverns.length}
                  </text>

                  {/* Tooltip on hover */}
                  {isHovered && zoom < 8 && (
                    <g transform={`translate(0, ${-(r + 14)})`}>
                      <rect x={-42} y={-14} width={84} height={13} rx={2} fill="rgba(0,0,0,0.9)" />
                      <polygon points="-4,0 4,0 0,4" fill="rgba(0,0,0,0.9)" />
                      <text textAnchor="middle" y={-5} fill="white" fontSize={4.5} fontWeight={700} fontFamily="system-ui" style={{ pointerEvents: "none" }}>
                        {cluster.taverns.length} stops — click to zoom in
                      </text>
                    </g>
                  )}
                </Marker>
              );
            }

            // --- SINGLE PIN ---
            // Dot size scales with zoom — tiny at zoom 1, full size at zoom 4+
            const dotR   = Math.max(2.5, 6 * pinScale);
            const isLargeEnough = dotR > 4.5;

            return (
              <Marker
                key={tavern.id}
                coordinates={coords}
                onClick={() => onTavernClick(tavern.id)}
                onMouseEnter={() => { onTavernHover(tavern.id); setHoveredClusterIdx(idx); }}
                onMouseLeave={() => { onTavernHover(null); setHoveredClusterIdx(null); }}
                style={{ cursor: "pointer" }}
              >
                {/* Active pulse */}
                {isActive && (
                  <circle r={dotR + 6} fill="none" stroke="rgba(217,165,75,0.35)" strokeWidth={1.5} />
                )}

                {/* Pin dot */}
                <circle
                  r={isActive ? dotR * 1.3 : isHovered ? dotR * 1.15 : dotR}
                  fill={
                    tavern.dude_approved
                      ? isActive ? "#f5c55a" : isHovered ? "#edb83a" : "#d9a54b"
                      : isActive ? "#4a4540" : isHovered ? "#3a3530" : "rgba(30,27,23,0.97)"
                  }
                  stroke={tavern.dude_approved ? "#f5b942" : "rgba(217,165,75,0.75)"}
                  strokeWidth={isActive ? 1.5 : 0.9}
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 0 5px rgba(217,165,75,0.6))"
                      : "drop-shadow(0 1px 3px rgba(0,0,0,0.55))",
                    transition: "r 0.1s ease-out",
                  }}
                />

                {/* Stop number — only show when pin is big enough */}
                {isLargeEnough && (
                  <text
                    textAnchor="middle"
                    y={dotR * 0.38}
                    fill={tavern.dude_approved ? "#1e1c1a" : "#d9a54b"}
                    fontSize={Math.max(3.5, dotR * 0.85)}
                    fontWeight={900}
                    fontFamily="system-ui, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {tavern.stop_number}
                  </text>
                )}

                {/* Dude Approved badge — only at higher zoom */}
                {tavern.dude_approved && isLargeEnough && (
                  <g transform={`translate(${dotR * 0.85}, ${-dotR * 0.85})`}>
                    <circle r={dotR * 0.55} fill="white" stroke="#f5b942" strokeWidth={0.8} />
                    <path
                      d={`M${-dotR*0.25},${dotR*0.05} L${-dotR*0.05},${dotR*0.28} L${dotR*0.3},${-dotR*0.2}`}
                      fill="none"
                      stroke="#1a7a3c"
                      strokeWidth={dotR * 0.18}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* Tooltip */}
                {(isActive || isHovered) && (
                  <g transform={`translate(0, ${-(dotR + 16)})`}>
                    <rect x={-50} y={-18} width={100} height={17} rx={2.5}
                      fill={isActive ? "#d9a54b" : "rgba(8,7,6,0.95)"}
                    />
                    <polygon points="-4,0 4,0 0,4"
                      fill={isActive ? "#d9a54b" : "rgba(8,7,6,0.95)"}
                    />
                    <text textAnchor="middle" y={-9}
                      fill={isActive ? "#1e1c1a" : "white"}
                      fontSize={5.5} fontWeight={700} fontFamily="system-ui"
                      style={{ pointerEvents: "none" }}
                    >
                      {tavern.name.length > 22 ? tavern.name.slice(0, 21) + "…" : tavern.name}
                    </text>
                    <text textAnchor="middle" y={-3}
                      fill={isActive ? "rgba(30,28,26,0.65)" : "rgba(217,165,75,0.85)"}
                      fontSize={4} fontFamily="system-ui"
                      style={{ pointerEvents: "none" }}
                    >
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
        <div className="absolute top-3 right-14 px-3 py-1.5 bg-darker-wood/95 backdrop-blur-sm border border-amber/40 rounded text-sm shadow-lg z-20 pointer-events-none">
          <span className="text-amber font-bold">{hoveredState}</span>
          <span className="text-muted-foreground ml-2 text-xs">{STATE_NAMES[hoveredState]}</span>
          <span className="text-muted-foreground/50 ml-2 text-xs">· click to zoom</span>
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
