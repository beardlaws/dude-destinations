"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Tavern } from "@/lib/tavern-service";

const MAPBOX_TOKEN = "pk.eyJ1IjoiZHVkZWRlc3RpbmF0aW9ucyIsImEiOiJjbXFmZ2lndmYxcDlkMnJwcjN1azcxaHZzIn0.btO8HxiO3JVgSuETuCUxmw";

// Dark amber tavern map style
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const popupRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let mapboxgl: any;

    const initMap = async () => {
      try {
        mapboxgl = (await import("mapbox-gl")).default;
        await import("mapbox-gl/dist/mapbox-gl.css");

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: MAP_STYLE,
          center: [-82.5, 40.2],
          zoom: 6.5,
          minZoom: 4,
          maxZoom: 18,
        });

        mapRef.current = map;

        // Custom amber navigation controls
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        map.on("load", () => {
          // Override map background to match site dark wood theme
          map.setPaintProperty("background", "background-color", "#1a1710");

          // Add Ohio highlight layer
          map.addSource("ohio", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [-82.9, 40.4],
              },
              properties: {},
            },
          });
        });

        // Popup instance
        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 25,
          className: "dude-popup",
        });

      } catch (err) {
        console.error("Mapbox init error:", err);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add/update markers when taverns change
  useEffect(() => {
    if (!mapRef.current) return;

    let mapboxgl: any;

    const updateMarkers = async () => {
      try {
        mapboxgl = (await import("mapbox-gl")).default;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = mapRef.current;
        const currentIds = new Set(taverns.map(t => t.id));

        // Remove markers no longer in list
        markersRef.current.forEach((marker, id) => {
          if (!currentIds.has(id)) {
            marker.remove();
            markersRef.current.delete(id);
          }
        });

        // Add or update markers
        taverns.forEach((tavern) => {
          if (
            typeof tavern.latitude !== "number" || isNaN(tavern.latitude) ||
            typeof tavern.longitude !== "number" || isNaN(tavern.longitude) ||
            tavern.latitude < 24 || tavern.latitude > 50 ||
            tavern.longitude < -125 || tavern.longitude > -66
          ) return;

          // Remove existing marker to recreate with fresh state
          if (markersRef.current.has(tavern.id)) {
            markersRef.current.get(tavern.id).remove();
          }

          const isActive = activeTavernId === tavern.id;

          // Build custom pin element
          const el = document.createElement("div");
          el.className = "dude-marker";
          el.setAttribute("data-id", tavern.id);
          el.style.cssText = `
            width: ${isActive ? "42px" : "34px"};
            height: ${isActive ? "42px" : "34px"};
            border-radius: 50%;
            background: ${tavern.dude_approved
              ? (isActive ? "#f5c55a" : "#d9a54b")
              : (isActive ? "#4a4540" : "#1e1b17")
            };
            border: ${isActive ? "3px" : "2px"} solid ${tavern.dude_approved ? "#f5b942" : "rgba(217,165,75,0.7)"};
            box-shadow: ${isActive
              ? "0 0 0 3px rgba(217,165,75,0.3), 0 4px 12px rgba(0,0,0,0.6)"
              : "0 2px 8px rgba(0,0,0,0.5)"
            };
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
            position: relative;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: ${isActive ? "12px" : "10px"};
            font-weight: 900;
            color: ${tavern.dude_approved ? "#1e1c1a" : "#d9a54b"};
            z-index: ${isActive ? 10 : 1};
          `;

          el.textContent = String(tavern.stop_number || "");

          // Dude Approved checkmark badge
          if (tavern.dude_approved) {
            const badge = document.createElement("div");
            badge.style.cssText = `
              position: absolute;
              top: -5px;
              right: -5px;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: white;
              border: 1.5px solid #f5b942;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 4px rgba(0,0,0,0.4);
            `;
            badge.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1a7a3c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
            el.appendChild(badge);
          }

          // Hover effects
          el.addEventListener("mouseenter", () => {
            if (!isActive) {
              el.style.transform = "scale(1.15)";
              el.style.zIndex = "5";
            }
            onTavernHover(tavern.id);

            if (popupRef.current) {
              popupRef.current
                .setLngLat([tavern.longitude, tavern.latitude])
                .setHTML(`
                  <div style="font-family:system-ui,sans-serif;padding:2px 0">
                    <div style="font-weight:800;font-size:13px;color:#fff;margin-bottom:2px;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tavern.name}</div>
                    <div style="font-size:11px;color:rgba(217,165,75,0.9)">#${tavern.stop_number} · ${tavern.city}, ${tavern.state}</div>
                  </div>
                `)
                .addTo(map);
            }
          });

          el.addEventListener("mouseleave", () => {
            if (!isActive) {
              el.style.transform = "scale(1)";
              el.style.zIndex = "1";
            }
            onTavernHover(null);
            if (popupRef.current) popupRef.current.remove();
          });

          el.addEventListener("click", () => {
            onTavernClick(tavern.id);
          });

          const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([tavern.longitude, tavern.latitude])
            .addTo(map);

          markersRef.current.set(tavern.id, marker);
        });

      } catch (err) {
        console.error("Marker update error:", err);
      }
    };

    updateMarkers();
  }, [taverns, activeTavernId, onTavernClick, onTavernHover]);

  // Fly to active tavern
  useEffect(() => {
    if (!mapRef.current || !activeTavernId) return;
    const tavern = taverns.find(t => t.id === activeTavernId);
    if (!tavern || !tavern.latitude || !tavern.longitude) return;

    mapRef.current.flyTo({
      center: [tavern.longitude, tavern.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      duration: 800,
      essential: true,
    });
  }, [activeTavernId, taverns]);

  return (
    <>
      <style>{`
        .dude-popup .mapboxgl-popup-content {
          background: rgba(15, 13, 10, 0.97) !important;
          border: 1px solid rgba(217,165,75,0.35) !important;
          border-radius: 4px !important;
          padding: 10px 14px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
        }
        .dude-popup .mapboxgl-popup-tip {
          border-top-color: rgba(217,165,75,0.35) !important;
        }
        .mapboxgl-ctrl-group {
          background: rgba(20, 18, 14, 0.95) !important;
          border: 1px solid rgba(217,165,75,0.25) !important;
          border-radius: 4px !important;
        }
        .mapboxgl-ctrl-group button {
          background: transparent !important;
          color: rgba(217,165,75,0.8) !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: rgba(217,165,75,0.1) !important;
        }
        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon {
          filter: invert(1) sepia(1) saturate(3) hue-rotate(10deg) !important;
        }
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${className}`}
        style={{ background: "#1a1710" }}
      />
    </>
  );
}
