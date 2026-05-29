import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RaceLocation } from '../services/location.service';

interface ChallengeMapProps {
  location: RaceLocation;
}

export default function ChallengeMap({ location }: ChallengeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let coordinates: [number, number][] = [];
    try {
      coordinates = JSON.parse(location.ruta);
    } catch (e) {
      console.error(e);
      return;
    }

    if (coordinates.length === 0) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: coordinates[0],
        zoom: 15,
        layers: [
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
          })
        ]
      });
    } else {
      mapInstance.current.setView(coordinates[0], 15);
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapInstance.current?.removeLayer(layer);
        }
      });
    }

    const startPoint = coordinates[0];
    const finishPoint = coordinates[coordinates.length - 1];

    const startIcon = L.divIcon({
      html: '<span style="background-color: #ffd700; width: 12px; height: 12px; border-radius: 50%; display: block; border: 2px solid white; box-shadow: 0 0 8px #ffd700;"></span>',
      className: 'custom-map-marker',
      iconSize: [12, 12]
    });

    const finishIcon = L.divIcon({
      html: '<span style="background-color: #ff5719; width: 12px; height: 12px; border-radius: 50%; display: block; border: 2px solid white; box-shadow: 0 0 8px #ff5719;"></span>',
      className: 'custom-map-marker',
      iconSize: [12, 12]
    });

    L.marker(startPoint, { icon: startIcon }).addTo(mapInstance.current).bindPopup('SALIDA');

    if (coordinates.length > 1) {
      L.marker(finishPoint, { icon: finishIcon }).addTo(mapInstance.current).bindPopup('LLEGADA');
      L.polyline(coordinates, {
        color: '#00e3fd',
        weight: 4,
        opacity: 0.8
      }).addTo(mapInstance.current);

      const bounds = L.latLngBounds(coordinates);
      mapInstance.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [location]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full border border-outline-variant/40 bg-surface-container relative">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '250px' }} />
    </div>
  );
}
