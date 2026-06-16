"use client";

import { useEffect, useRef } from "react";
import type { Tavern } from "@/lib/tavern-service";

const MAPBOX_TOKEN = "pk.eyJ1IjoiZHVkZWRlc3RpbmF0aW9ucyIsImEiOiJjbXFmZ2lndmYxcDlkMnJwcjN1azcxaHZzIn0.btO8HxiO3JVgSuETuCUxmw";

interface MapboxMapProps {
  taverns: Tavern[];
  activeTavernId: string | null;
  onTavernClick: (id: string) => void;
  onTavernHover: (id: string | null) => void;
  className?: string;
}

export default function MapboxMap({
  taverns,
  activeTavernId,
  onTavernClick,
  onTavernHover,
  className = "",
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const mapLoadedRef = useRef(false);

  const buildGeoJSON = (taverns: Tavern[]) => ({
    type: "FeatureCollection" as const,
    features: taverns
      .filter(t =>
        typeof t.latitude === "number" && !isNaN(t.latitude) &&
        typeof t.longitude === "number" && !isNaN(t.longitude) &&
        t.latitude >= 24 && t.latitude <= 50 &&
        t.longitude >= -125 && t.longitude <= -66
      )
      .map(t => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [t.longitude, t.latitude] },
        properties: {
          id: t.id,
          name: t.name,
          city: t.city,
          state: t.state,
          stop_number: t.stop_number ?? 0,
          dude_approved: t.dude_approved ? 1 : 0,
          is_active: t.id === activeTavernId ? 1 : 0,
        },
      })),
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");
      if (cancelled) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-82.5, 40.3],
        zoom: 7,
        minZoom: 4,
        maxZoom: 18,
      });

      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 20,
      });

      map.on("load", () => {
        if (cancelled) return;
        mapLoadedRef.current = true;

        // GeoJSON source — no clustering
        map.addSource("taverns", {
          type: "geojson",
          data: buildGeoJSON(taverns),
        });

        // Non-approved pins — dark with amber stroke
        map.addLayer({
          id: "pin-dark",
          type: "circle",
          source: "taverns",
          filter: ["==", ["get", "dude_approved"], 0],
          paint: {
            "circle-color": ["case", ["==", ["get", "is_active"], 1], "#3a3530", "#1e1b17"],
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 5, 8, 8, 12, 12, 15, 16],
            "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 5, 1, 10, 1.5, 15, 2.5],
            "circle-stroke-color": "#d9a54b",
            "circle-opacity": 0.95,
          },
        });

        // Dude Approved pins — full amber
        map.addLayer({
          id: "pin-approved",
          type: "circle",
          source: "taverns",
          filter: ["==", ["get", "dude_approved"], 1],
          paint: {
            "circle-color": ["case", ["==", ["get", "is_active"], 1], "#f5c55a", "#d9a54b"],
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 5, 8, 8, 12, 12, 15, 16],
            "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 5, 1, 10, 1.5, 15, 2.5],
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.95,
          },
        });



        // Active pulse ring
        map.addLayer({
          id: "pin-active-ring",
          type: "circle",
          source: "taverns",
          filter: ["==", ["get", "is_active"], 1],
          paint: {
            "circle-color": "rgba(0,0,0,0)",
            "circle-radius": 24,
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(217,165,75,0.5)",
            "circle-opacity": 0,
          },
        });

        // Click handlers
        const handleClick = (e: any) => {
          if (!e.features?.length) return;
          onTavernClick(e.features[0].properties.id);
        };
        map.on("click", "pin-dark", handleClick);
        map.on("click", "pin-approved", handleClick);

        // Hover handlers
        const handleEnter = (e: any) => {
          if (!e.features?.length) return;
          map.getCanvas().style.cursor = "pointer";
          const p = e.features[0].properties;
          const coords = e.features[0].geometry.coordinates.slice();
          onTavernHover(p.id);
          popup.setLngLat(coords).setHTML(`
            <div style="font-family:system-ui,sans-serif">
              <div style="font-weight:800;font-size:13px;color:#fff;margin-bottom:3px;max-width:200px">${p.name}</div>
              <div style="font-size:11px;color:rgba(217,165,75,0.9)">Stop #${p.stop_number} · ${p.city}, ${p.state}</div>
            </div>
          `).addTo(map);
        };

        const handleLeave = () => {
          map.getCanvas().style.cursor = "";
          onTavernHover(null);
          popup.remove();
        };

        map.on("mouseenter", "pin-dark", handleEnter);
        map.on("mouseenter", "pin-approved", handleEnter);
        map.on("mouseleave", "pin-dark", handleLeave);
        map.on("mouseleave", "pin-approved", handleLeave);
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapLoadedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when taverns/active changes
  useEffect(() => {
    if (!mapRef.current || !mapLoadedRef.current) return;
    const source = mapRef.current.getSource("taverns") as any;
    if (source) source.setData(buildGeoJSON(taverns));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taverns, activeTavernId]);

  // Fly to active tavern
  useEffect(() => {
    if (!mapRef.current || !mapLoadedRef.current || !activeTavernId) return;
    const tavern = taverns.find(t => t.id === activeTavernId);
    if (!tavern?.latitude || !tavern?.longitude) return;
    mapRef.current.flyTo({
      center: [tavern.longitude, tavern.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      duration: 700,
      essential: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTavernId]);

  return (
    <>
      <style>{`
        .mapboxgl-popup-content {
          background: rgba(12,10,8,0.97) !important;
          border: 1px solid rgba(217,165,75,0.3) !important;
          border-radius: 4px !important;
          padding: 10px 14px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.7) !important;
        }
        .mapboxgl-popup-tip { border-top-color: rgba(12,10,8,0.97) !important; }
        .mapboxgl-ctrl-group {
          background: rgba(18,16,12,0.97) !important;
          border: 1px solid rgba(217,165,75,0.2) !important;
          border-radius: 3px !important;
        }
        .mapboxgl-ctrl-group button { border-bottom: 1px solid rgba(217,165,75,0.15) !important; }
        .mapboxgl-ctrl-group button:last-child { border-bottom: none !important; }
        .mapboxgl-ctrl-icon { filter: invert(0.8) sepia(0.5) saturate(2) hue-rotate(10deg) !important; }
        .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo { display: none !important; }
      `}</style>
      <div ref={containerRef} className={`w-full h-full ${className}`} />
    </>
  );
}
