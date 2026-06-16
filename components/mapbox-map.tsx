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

  // Build GeoJSON from taverns
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

  // Initialize map once
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
style: "mapbox://styles/mapbox/dark-v11",        center: [-82.5, 40.3],
        zoom: 7,
        minZoom: 4,
        maxZoom: 18,
      });

      mapRef.current = map;

      // Custom styled nav controls
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      // Popup
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 20,
      });

      map.on("load", () => {
        if (cancelled) return;
        mapLoadedRef.current = true;

        // Add GeoJSON source with clustering
        map.addSource("taverns", {
          type: "geojson",
          data: buildGeoJSON(taverns),
          cluster: true,
          clusterMaxZoom: 11,
          clusterRadius: 50,
        });

        // --- CLUSTER CIRCLES ---
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "taverns",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step", ["get", "point_count"],
              "#e8b44f", 5,
              "#d9a54b", 10,
              "#c4922e"
            ],
            "circle-radius": [
              "step", ["get", "point_count"],
              20, 5,
              26, 10,
              32
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 1,
          },
        });

        // --- CLUSTER COUNT LABELS ---
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "taverns",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
            "text-size": 14,
          },
          paint: {
            "text-color": "#1e1c1a",
          },
        });

        // --- INDIVIDUAL PINS (unclustered) ---
        // Dark pin for non-approved
        map.addLayer({
          id: "unclustered-pin",
          type: "circle",
          source: "taverns",
          filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "dude_approved"], 0]],
          paint: {
            "circle-color": [
              "case", ["==", ["get", "is_active"], 1], "#5a5248", "#2e2820"
            ],
            "circle-radius": [
              "case", ["==", ["get", "is_active"], 1], 18, 15
            ],
            "circle-stroke-width": [
              "case", ["==", ["get", "is_active"], 1], 3, 2.5
            ],
            "circle-stroke-color": "#d9a54b",
            "circle-opacity": 0.95,
          },
        });

        // Amber pin for dude-approved
        map.addLayer({
          id: "unclustered-pin-approved",
          type: "circle",
          source: "taverns",
          filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "dude_approved"], 1]],
          paint: {
            "circle-color": [
              "case", ["==", ["get", "is_active"], 1], "#f5c55a", "#d9a54b"
            ],
            "circle-radius": [
              "case", ["==", ["get", "is_active"], 1], 18, 15
            ],
            "circle-stroke-width": [
              "case", ["==", ["get", "is_active"], 1], 3, 2.5
            ],
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.95,
          },
        });

        // --- STOP NUMBER LABELS ---
        map.addLayer({
          id: "pin-labels",
          type: "symbol",
          source: "taverns",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "text-field": ["to-string", ["get", "stop_number"]],
            "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
            "text-size": 11,
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": [
              "case",
              ["==", ["get", "dude_approved"], 1], "#1a1710",
              "#ffffff"
            ],
          },
        });

        // --- ACTIVE PULSE RING ---
        map.addLayer({
          id: "active-ring",
          type: "circle",
          source: "taverns",
          filter: ["==", ["get", "is_active"], 1],
          paint: {
            "circle-color": "transparent",
            "circle-radius": 26,
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(217,165,75,0.45)",
            "circle-opacity": 0,
          },
        });

        // --- INTERACTIONS ---

        // Click cluster → zoom in
        map.on("click", "clusters", (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
          if (!features.length) return;
          const clusterId = features[0].properties.cluster_id;
          (map.getSource("taverns") as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;
            map.easeTo({ center: features[0].geometry.coordinates, zoom });
          });
        });

        // Click individual pin
        const handlePinClick = (e: any) => {
          if (!e.features?.length) return;
          const props = e.features[0].properties;
          onTavernClick(props.id);
        };
        map.on("click", "unclustered-pin", handlePinClick);
        map.on("click", "unclustered-pin-approved", handlePinClick);
        map.on("click", "pin-labels", handlePinClick);

        // Hover popup
        const handleMouseEnter = (e: any) => {
          if (!e.features?.length) return;
          map.getCanvas().style.cursor = "pointer";
          const props = e.features[0].properties;
          const coords = e.features[0].geometry.coordinates.slice();
          onTavernHover(props.id);
          popup
            .setLngLat(coords)
            .setHTML(`
              <div style="font-family:system-ui,sans-serif">
                <div style="font-weight:800;font-size:13px;color:#fff;margin-bottom:3px;max-width:200px">${props.name}</div>
                <div style="font-size:11px;color:rgba(217,165,75,0.9)">Stop #${props.stop_number} · ${props.city}, ${props.state}</div>
              </div>
            `)
            .addTo(map);
        };

        const handleMouseLeave = () => {
          map.getCanvas().style.cursor = "";
          onTavernHover(null);
          popup.remove();
        };

        map.on("mouseenter", "unclustered-pin", handleMouseEnter);
        map.on("mouseenter", "unclustered-pin-approved", handleMouseEnter);
        map.on("mouseenter", "pin-labels", handleMouseEnter);
        map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "unclustered-pin", handleMouseLeave);
        map.on("mouseleave", "unclustered-pin-approved", handleMouseLeave);
        map.on("mouseleave", "pin-labels", handleMouseLeave);
        map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
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

  // Update GeoJSON data when taverns or active selection changes
  useEffect(() => {
    if (!mapRef.current || !mapLoadedRef.current) return;
    const source = mapRef.current.getSource("taverns") as any;
    if (!source) return;
    source.setData(buildGeoJSON(taverns));
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
          background: rgba(12, 10, 8, 0.97) !important;
          border: 1px solid rgba(217,165,75,0.3) !important;
          border-radius: 4px !important;
          padding: 10px 14px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.7) !important;
          color: white;
        }
        .mapboxgl-popup-tip {
          border-top-color: rgba(12,10,8,0.97) !important;
        }
        .mapboxgl-ctrl-group {
          background: rgba(18, 16, 12, 0.97) !important;
          border: 1px solid rgba(217,165,75,0.2) !important;
          border-radius: 3px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
        }
        .mapboxgl-ctrl-group button {
          border-bottom: 1px solid rgba(217,165,75,0.15) !important;
        }
        .mapboxgl-ctrl-group button:last-child { border-bottom: none !important; }
        .mapboxgl-ctrl-icon { filter: invert(0.8) sepia(0.5) saturate(2) hue-rotate(10deg) !important; }
        .mapboxgl-ctrl-attrib { display: none !important; }
        .mapboxgl-ctrl-logo { display: none !important; }
      `}</style>
      <div ref={containerRef} className={`w-full h-full ${className}`} />
    </>
  );
}
