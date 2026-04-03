'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  taverns: Array<{
    id: string;
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    dudeApproved: boolean;
    stopNumber: number;
  }>;
  activeTavernId: string | null;
  onTavernSelect: (id: string) => void;
}

export default function InteractiveMap({
  taverns,
  activeTavernId,
  onTavernSelect,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on Ohio
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([40.3888, -82.7649], 7);

      // Add OpenStreetMap tiles with dark theme styling
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add markers for each tavern
    taverns.forEach((tavern) => {
      const isActive = activeTavernId === tavern.id;

      // Create custom marker HTML
      const markerHtml = `
        <div class="flex items-center justify-center">
          <div class="${isActive ? 'scale-125' : 'scale-100'} transition-transform duration-200">
            <div class="relative">
              <div class="w-10 h-10 rounded-full ${
                tavern.dudeApproved
                  ? 'bg-gradient-to-br from-amber to-yellow-500'
                  : 'bg-amber/80'
              } border-2 ${
                isActive ? 'border-white shadow-lg shadow-amber/60' : 'border-amber'
              } flex items-center justify-center text-darker-wood font-black shadow-xl">
                ${tavern.stopNumber}
              </div>
              ${tavern.dudeApproved
                ? `<div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-darker-wood flex items-center justify-center shadow-md">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="w-2 h-2 text-darker-wood">
                      <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>`
                : ''
              }
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([tavern.latitude, tavern.longitude], {
        icon: L.divIcon({
          html: markerHtml,
          className: 'custom-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        }),
      });

      marker.on('click', () => {
        onTavernSelect(tavern.id);
        if (map.current) {
          map.current.setView([tavern.latitude, tavern.longitude], 10, {
            animate: true,
            duration: 0.5,
          });
        }
      });

      marker.addTo(map.current!);
      markersRef.current[tavern.id] = marker;
    });

    return () => {
      // Cleanup is handled by React
    };
  }, [taverns, activeTavernId, onTavernSelect]);

  return <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />;
}
