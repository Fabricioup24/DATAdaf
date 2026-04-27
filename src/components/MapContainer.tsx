import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * Interface for voting table coordinates
 */
export interface VotingTable {
  id: string | number;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  description?: string;
  mesa?: string;
}

interface MapContainerProps {
  /** Array of voting tables to display as markers */
  tables?: VotingTable[];
  /** Initial map center [longitude, latitude] */
  initialCenter?: [number, number];
  /** Initial zoom level */
  initialZoom?: number;
  /** Height of the map container */
  height?: string;
}

/**
 * MapContainer component to render an interactive map using MapLibre GL.
 * 
 * @param {MapContainerProps} props - The component props
 * @returns {JSX.Element} The rendered MapContainer
 */
const MapContainer = ({ 
  tables = [], 
  initialCenter = [-77.0428, -12.0464], 
  initialZoom = 12,
  height = "600px" 
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize the map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // Using a basic public style for initial setup
      // Note: For production, consider using MapTiler or another provider with a key
      style: 'https://demotiles.maplibre.org/style.json', 
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: true
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add markers for voting tables
    tables.forEach((table) => {
      if (!map.current) return;

      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2 font-manrope">
            <h3 class="font-bold text-[#121212] mb-1">${table.mesa || 'Mesa de Votación'}</h3>
            <p class="text-sm text-gray-600">${table.address}</p>
            ${table.description ? `<p class="text-xs mt-2 italic">${table.description}</p>` : ''}
          </div>
        `);

      new maplibregl.Marker({ color: '#0055ff' })
        .setLngLat(table.coordinates)
        .setPopup(popup)
        .addTo(map.current);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [tables, initialCenter, initialZoom]);

  return (
    <div className="map-premium-wrapper">
      <div 
        ref={mapContainer} 
        style={{ height }} 
        className="w-full bg-gray-100"
      />
    </div>
  );
};

export default MapContainer;
