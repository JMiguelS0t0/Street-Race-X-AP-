import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationDrawMapProps {
  onPathChange: (path: [number, number][]) => void;
}

export default function LocationDrawMap({ onPathChange }: LocationDrawMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [history, setHistory] = useState<[number, number][][]>([]);
  const [routing, setRouting] = useState(false);

  const tempCoords = useRef<[number, number][]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const routingRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: [6.2442, -75.5812],
        zoom: 13,
        layers: [
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
          })
        ]
      });

      mapInstance.current.on('click', async (e: L.LeafletMouseEvent) => {
        if (routingRef.current) return;
        const newCoord: [number, number] = [e.latlng.lat, e.latlng.lng];
        if (tempCoords.current.length === 0) {
          const updated = [newCoord];
          setHistory(prev => [...prev, tempCoords.current]);
          tempCoords.current = updated;
          setCoordinates(updated);
          onPathChange(updated);
        } else {
          const lastPoint = tempCoords.current[tempCoords.current.length - 1];
          routingRef.current = true;
          setRouting(true);
          try {
            const response = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${lastPoint[1]},${lastPoint[0]};${newCoord[1]},${newCoord[0]}?overview=full&geometries=geojson`
            );
            const data = await response.json();
            if (data.code === 'Ok' && data.routes && data.routes[0]) {
              const routeCoords = data.routes[0].geometry.coordinates.map(
                (c: [number, number]) => [c[1], c[0]] as [number, number]
              );
              const finalRouteCoords = routeCoords.slice(1);
              const updated = [...tempCoords.current, ...finalRouteCoords];
              setHistory(prev => [...prev, tempCoords.current]);
              tempCoords.current = updated;
              setCoordinates(updated);
              onPathChange(updated);
            } else {
              const updated = [...tempCoords.current, newCoord];
              setHistory(prev => [...prev, tempCoords.current]);
              tempCoords.current = updated;
              setCoordinates(updated);
              onPathChange(updated);
            }
          } catch (error) {
            const updated = [...tempCoords.current, newCoord];
            setHistory(prev => [...prev, tempCoords.current]);
            tempCoords.current = updated;
            setCoordinates(updated);
            onPathChange(updated);
          } finally {
            routingRef.current = false;
            setRouting(false);
          }
        }
      });
    }
  }, [onPathChange]);

  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach((marker) => mapInstance.current?.removeLayer(marker));
    markersRef.current = [];

    if (polylineRef.current) {
      mapInstance.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    coordinates.forEach((coord, index) => {
      const isStart = index === 0;
      const isFinish = index === coordinates.length - 1 && coordinates.length > 1;

      const markerHtml = isStart 
        ? '<span style="background-color: #ffd700; width: 12px; height: 12px; border-radius: 50%; display: block; border: 2px solid white; box-shadow: 0 0 8px #ffd700;"></span>'
        : isFinish 
        ? '<span style="background-color: #ff5719; width: 12px; height: 12px; border-radius: 50%; display: block; border: 2px solid white; box-shadow: 0 0 8px #ff5719;"></span>'
        : '<span style="background-color: #00e3fd; width: 8px; height: 8px; border-radius: 50%; display: block; border: 1.5px solid white;"></span>';

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-draw-marker',
        iconSize: isStart || isFinish ? [12, 12] : [8, 8]
      });

      const marker = L.marker(coord, { icon }).addTo(mapInstance.current!);
      markersRef.current.push(marker);
    });

    if (coordinates.length > 1) {
      polylineRef.current = L.polyline(coordinates, {
        color: '#00e3fd',
        weight: 4,
        opacity: 0.8
      }).addTo(mapInstance.current);
    }
  }, [coordinates]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousPath = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    tempCoords.current = previousPath;
    setCoordinates(previousPath);
    onPathChange(previousPath);
  };

  const handleClear = () => {
    tempCoords.current = [];
    setCoordinates([]);
    onPathChange([]);
    setHistory([]);
  };

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full border border-outline-variant/40 bg-surface-container relative">
        <div ref={mapRef} className="w-full h-48" style={{ minHeight: '200px' }} />
        {routing && (
          <div className="absolute inset-0 bg-black/60 z-[1000] flex items-center justify-center font-mono text-[11px] text-secondary-container uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px] animate-spin mr-2">progress_activity</span>
            Trazando ruta por carreteras...
          </div>
        )}
      </div>
      <div className="flex justify-between items-center font-mono text-[10px]">
        <span className="text-on-surface-variant uppercase">
          Puntos trazados: {coordinates.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-3 py-1 bg-surface border border-outline-variant text-on-surface disabled:opacity-40 hover:bg-surface-variant cursor-pointer"
          >
            DESHACER
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={coordinates.length === 0}
            className="px-3 py-1 bg-surface border border-error text-error disabled:opacity-40 hover:bg-error/10 cursor-pointer"
          >
            LIMPIAR
          </button>
        </div>
      </div>
    </div>
  );
}
