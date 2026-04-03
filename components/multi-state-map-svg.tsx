"use client";

import { memo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { STATE_NAMES } from "@/lib/map-utils";
import type { Tavern } from "@/lib/tavern-service";

// US Atlas TopoJSON - contains all US states with accurate boundaries
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// States we support with their FIPS codes
const SUPPORTED_FIPS: Record<string, string> = {
  "39": "OH", // Ohio
  "42": "PA", // Pennsylvania
  "54": "WV", // West Virginia
  "21": "KY", // Kentucky
  "18": "IN", // Indiana
  "26": "MI", // Michigan
};

// Major cities with coordinates [longitude, latitude]
const CITIES = [
  { name: "Columbus", coordinates: [-82.9988, 39.9612] as [number, number], state: "OH", size: "large" },
  { name: "Cleveland", coordinates: [-81.6944, 41.4993] as [number, number], state: "OH", size: "large" },
  { name: "Cincinnati", coordinates: [-84.512, 39.1031] as [number, number], state: "OH", size: "large" },
  { name: "Toledo", coordinates: [-83.5379, 41.6528] as [number, number], state: "OH", size: "medium" },
  { name: "Dayton", coordinates: [-84.1916, 39.7589] as [number, number], state: "OH", size: "medium" },
  { name: "Akron", coordinates: [-81.519, 41.0814] as [number, number], state: "OH", size: "medium" },
  { name: "Youngstown", coordinates: [-80.6496, 41.0994] as [number, number], state: "OH", size: "small" },
  { name: "Springfield", coordinates: [-83.8093, 39.9211] as [number, number], state: "OH", size: "small" },
  { name: "Pittsburgh", coordinates: [-79.9959, 40.4406] as [number, number], state: "PA", size: "large" },
  { name: "Indianapolis", coordinates: [-86.1581, 39.7684] as [number, number], state: "IN", size: "large" },
  { name: "Fort Wayne", coordinates: [-85.1394, 41.0793] as [number, number], state: "IN", size: "medium" },
  { name: "Detroit", coordinates: [-83.0458, 42.3314] as [number, number], state: "MI", size: "large" },
  { name: "Louisville", coordinates: [-85.7585, 38.2527] as [number, number], state: "KY", size: "large" },
  { name: "Lexington", coordinates: [-84.5037, 38.0406] as [number, number], state: "KY", size: "medium" },
  { name: "Charleston", coordinates: [-81.6326, 38.3498] as [number, number], state: "WV", size: "large" },
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

function MultiStateMapSVGComponent({
  activeState,
  onStateClick,
  highlightedStates = [],
  taverns = [],
  activeTavernId = null,
  hoveredPinId = null,
  onTavernClick,
  onTavernHover,
  className = "",
}: MultiStateMapSVGProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([-83.0, 40.0]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 1));
  const handleReset = () => { setZoom(1); setCenter([-83.0, 40.0]); };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Zoom Controls */}
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
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [-83.0, 40.0], // Center on Ohio
          scale: 5500,
        }}
        style={{ 
          width: "100%", 
          height: "100%",
          backgroundColor: "transparent",
        }}
      >
        <ZoomableGroup 
          center={center} 
          zoom={zoom} 
          minZoom={0.8} 
          maxZoom={8}
          onMoveEnd={({ coordinates, zoom: newZoom }) => {
            setCenter(coordinates as [number, number]);
            setZoom(newZoom);
          }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips = geo.id;
                const stateAbbr = SUPPORTED_FIPS[fips];
                
                // Only render our supported states
                if (!stateAbbr) return null;

                const isHighlighted = highlightedStates.includes(stateAbbr);
                const isActive = stateAbbr === activeState;
                const isHovered = stateAbbr === hoveredState;
                const isOhio = stateAbbr === "OH";

                // Determine fill color
                let fillColor = "rgba(30, 28, 26, 0.6)";
                let strokeColor = "rgba(180, 140, 80, 0.3)";
                let strokeWidth = 0.5;

                if (isOhio) {
                  fillColor = isActive || isHovered 
                    ? "rgba(217, 165, 75, 0.45)" 
                    : "rgba(217, 165, 75, 0.25)";
                  strokeColor = "rgba(217, 165, 75, 0.9)";
                  strokeWidth = 1;
                } else if (isActive || isHovered) {
                  fillColor = "rgba(217, 165, 75, 0.3)";
                  strokeColor = "rgba(217, 165, 75, 0.7)";
                  strokeWidth = 0.8;
                } else if (isHighlighted) {
                  fillColor = "rgba(217, 165, 75, 0.15)";
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
                      default: {
                        fill: fillColor,
                        stroke: strokeColor,
                        strokeWidth: strokeWidth,
                        outline: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease-out",
                      },
                      hover: {
                        fill: isOhio ? "rgba(217, 165, 75, 0.5)" : "rgba(217, 165, 75, 0.35)",
                        stroke: "rgba(217, 165, 75, 0.9)",
                        strokeWidth: isOhio ? 1.2 : 1,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "rgba(217, 165, 75, 0.4)",
                        stroke: "rgba(217, 165, 75, 1)",
                        strokeWidth: 1.2,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Lake Erie Label */}
          <Marker coordinates={[-81.5, 41.8]}>
            <text
              textAnchor="middle"
              fill="rgba(100, 160, 200, 0.4)"
              fontSize={8}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontStyle="italic"
              fontWeight={500}
              style={{ pointerEvents: "none" }}
            >
              Lake Erie
            </text>
          </Marker>

          {/* City Markers */}
          {CITIES.map((city) => {
            const dotSize = city.size === "large" ? 2.5 : city.size === "medium" ? 2 : 1.5;
            const fontSize = city.size === "large" ? 6 : city.size === "medium" ? 5 : 4.2;
            const fontWeight = city.size === "large" ? 700 : city.size === "medium" ? 600 : 500;
            const isOhioCity = city.state === "OH";
            
            return (
              <Marker key={city.name} coordinates={city.coordinates}>
                <circle
                  r={dotSize}
                  fill={isOhioCity ? "rgba(217, 165, 75, 0.8)" : "rgba(217, 165, 75, 0.5)"}
                  stroke="rgba(217, 165, 75, 0.9)"
                  strokeWidth={0.4}
                />
                <text
                  textAnchor="middle"
                  y={-dotSize - 3}
                  fill={isOhioCity ? "rgba(245, 235, 220, 0.9)" : "rgba(200, 190, 175, 0.7)"}
                  fontSize={fontSize}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight={fontWeight}
                  style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
                >
                  {city.name}
                </text>
              </Marker>
            );
          })}

          {/* State Labels */}
          {[
            { abbr: "OH", coords: [-82.7, 40.4] as [number, number], isMain: true },
            { abbr: "PA", coords: [-77.5, 41.0] as [number, number], isMain: false },
            { abbr: "WV", coords: [-80.5, 38.8] as [number, number], isMain: false },
            { abbr: "KY", coords: [-85.5, 37.6] as [number, number], isMain: false },
            { abbr: "IN", coords: [-86.2, 40.2] as [number, number], isMain: false },
            { abbr: "MI", coords: [-84.5, 43.8] as [number, number], isMain: false },
          ].map(({ abbr, coords, isMain }) => (
            <Marker key={abbr} coordinates={coords}>
              <text
                textAnchor="middle"
                fill={isMain ? "rgba(35, 30, 25, 0.8)" : "rgba(217, 165, 75, 0.4)"}
                fontSize={isMain ? 12 : 9}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight={800}
                letterSpacing="0.1em"
                style={{ pointerEvents: "none" }}
              >
                {abbr}
              </text>
            </Marker>
          ))}

          {/* Tavern Pin Markers */}
          {(taverns || []).filter((t) => {
            // Only render taverns with valid coordinates in the US region
            const lat = t.latitude;
            const lon = t.longitude;
            const isValidLat = typeof lat === 'number' && !isNaN(lat) && lat >= 24 && lat <= 50;
            const isValidLon = typeof lon === 'number' && !isNaN(lon) && lon >= -125 && lon <= -66;
            return isValidLat && isValidLon;
          }).map((tavern) => {
            const isActive = activeTavernId === tavern.id;
            const isHovered = hoveredPinId === tavern.id;
            const coords: [number, number] = [tavern.longitude, tavern.latitude];
            
            return (
              <Marker 
                key={tavern.id} 
                coordinates={coords}
                onClick={() => onTavernClick(tavern.id)}
                onMouseEnter={() => onTavernHover(tavern.id)}
                onMouseLeave={() => onTavernHover(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Pulse ring for active */}
                {isActive && (
                  <circle
                    r={12}
                    fill="none"
                    stroke="rgba(217, 165, 75, 0.5)"
                    strokeWidth={2}
                    className="animate-ping"
                  />
                )}
                
                {/* Pin shadow */}
                <ellipse
                  cx={0}
                  cy={8}
                  rx={4}
                  ry={1.5}
                  fill="rgba(0,0,0,0.3)"
                />
                
                {/* Pin body */}
                <g transform={`scale(${isActive ? 1.2 : isHovered ? 1.1 : 1})`} style={{ transition: "transform 0.2s" }}>
                  {/* Pin shape */}
                  <path
                    d="M0,-12 C-6,-12 -10,-7 -10,0 C-10,4 0,10 0,10 C0,10 10,4 10,0 C10,-7 6,-12 0,-12 Z"
                    fill={tavern.dude_approved 
                      ? (isActive ? "#f5b942" : isHovered ? "#e5a730" : "#d9a54b")
                      : (isActive ? "#d9a54b" : isHovered ? "#c9953b" : "rgba(30, 28, 26, 0.95)")
                    }
                    stroke={tavern.dude_approved ? "#f5b942" : "#d9a54b"}
                    strokeWidth={isActive ? 1.5 : 1}
                    style={{ filter: isActive ? "drop-shadow(0 0 4px rgba(217, 165, 75, 0.6))" : "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}
                  />
                  
                  {/* Stop number */}
                  <text
                    textAnchor="middle"
                    y={-3}
                    fill={tavern.dude_approved ? "#1e1c1a" : "#d9a54b"}
                    fontSize={7}
                    fontWeight={800}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {tavern.stop_number}
                  </text>
                  
                  {/* Dude Approved Badge - Enhanced */}
                  {tavern.dude_approved && (
                    <g transform="translate(6, -16)">
                      {/* Badge circle background */}
                      <circle 
                        r={6.5} 
                        fill="white" 
                        stroke="#f5b942" 
                        strokeWidth={1.5}
                        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
                      />
                      {/* Inner circle */}
                      <circle 
                        r={5.5} 
                        fill="none"
                        stroke="#1e1c1a" 
                        strokeWidth={0.5}
                        opacity={0.3}
                      />
                      {/* Checkmark */}
                      <path
                        d="M-2.5,0.5 L-0.5,2 L2.5,-1.5"
                        fill="none"
                        stroke="#1e1c1a"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Top text arc indicator */}
                      <text
                        textAnchor="middle"
                        y={-5}
                        fill="#1e1c1a"
                        fontSize={2.5}
                        fontWeight={900}
                        fontFamily="system-ui, -apple-system, sans-serif"
                        letterSpacing="0.05em"
                        style={{ pointerEvents: "none" }}
                      >
                        ✓
                      </text>
                    </g>
                  )}
                </g>

                {/* Hover tooltip */}
                {(isActive || isHovered) && (
                  <g transform="translate(0, -28)">
                    <rect
                      x={-50}
                      y={-20}
                      width={100}
                      height={18}
                      rx={3}
                      fill={isActive ? "#d9a54b" : "rgba(0,0,0,0.9)"}
                    />
                    <polygon 
                      points="-5,0 5,0 0,5" 
                      fill={isActive ? "#d9a54b" : "rgba(0,0,0,0.9)"}
                    />
                    <text
                      textAnchor="middle"
                      y={-9}
                      fill={isActive ? "#1e1c1a" : "white"}
                      fontSize={6}
                      fontWeight={700}
                      fontFamily="system-ui, -apple-system, sans-serif"
                      style={{ pointerEvents: "none" }}
                    >
                      {tavern.name}
                    </text>
                    <text
                      textAnchor="middle"
                      y={-3}
                      fill={isActive ? "#1e1c1a" : "rgba(255,255,255,0.7)"}
                      fontSize={4}
                      fontWeight={500}
                      fontFamily="system-ui, -apple-system, sans-serif"
                      style={{ pointerEvents: "none" }}
                    >
                      {tavern.city}, {tavern.state}
                    </text>
                  </g>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover tooltip for state */}
      {hoveredState && (
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-darker-wood/95 backdrop-blur-sm border border-amber/40 rounded text-sm shadow-lg z-20">
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
