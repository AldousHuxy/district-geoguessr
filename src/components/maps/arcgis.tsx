import { useEffect, useRef, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Extent from '@arcgis/core/geometry/Extent';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import { FaExpand, FaCompress } from 'react-icons/fa';
import cn from '@/utils/cn';

// MHFD boundary service full extent (Web Mercator)
const MHFD_EXTENT = new Extent({
  xmin: -11727407.9442,
  ymin: 4779445.2844,
  xmax: -11631076.5300,
  ymax: 4884173.4419,
  spatialReference: { wkid: 102100 },
});

type ArcGISMapProps = {
  center?: { lat: number; lng: number };
  onGuess?: (coords: { lat: number; lng: number }) => void;
  guessCoords?: { lat: number; lng: number } | null;
  className?: string;
};

const ArcGISMap = ({ center, onGuess, guessCoords, className }: ArcGISMapProps) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  const onGuessRef = useRef(onGuess);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    onGuessRef.current = onGuess;
  }, [onGuess]);

  useEffect(() => {
    if (!mapDivRef.current) return;

    const mhfdLayer = new MapImageLayer({
      url: 'https://gis.mhfd.org/server/rest/services/Boundaries/MHFDBoundary/MapServer',
    });
    const graphicsLayer = new GraphicsLayer();
    graphicsLayerRef.current = graphicsLayer;

    const view = new MapView({
      container: mapDivRef.current,
      map: new Map({ basemap: 'streets-navigation-vector', layers: [mhfdLayer, graphicsLayer] }),
      extent: MHFD_EXTENT,
      ui: { components: ['zoom'] },
    });
    viewRef.current = view;

    const clickHandle = view.on('click', (event) => {
      const { latitude, longitude } = event.mapPoint;
      if (latitude == null || longitude == null) return;
      onGuessRef.current?.({ lat: latitude, lng: longitude });
    });

    return () => {
      clickHandle.remove();
      view.destroy();
    };
  }, []);

  // Reset to MHFD extent and collapse when a new round starts (center prop changes)
  useEffect(() => {
    if (!viewRef.current) return;
    setExpanded(false);
    viewRef.current.goTo(MHFD_EXTENT).catch(() => {});
  }, [center?.lat, center?.lng]);

  useEffect(() => {
    const layer = graphicsLayerRef.current;
    if (!layer) return;
    layer.removeAll();
    if (guessCoords) {
      const point = new Point({ latitude: guessCoords.lat, longitude: guessCoords.lng });
      layer.add(
        new Graphic({
          geometry: point,
          symbol: new SimpleMarkerSymbol({
            color: '#ffdd00',
            size: 14,
            style: 'circle',
            outline: { color: '#06242d', width: 2 },
          }),
        }),
      );
    }
  }, [guessCoords]);

  return (
    // inline cursor:default overrides the crosshair Google Street View sets globally
    <div
      style={{ cursor: 'default' }}
      className={cn(
        'absolute bottom-4 right-16 z-10 overflow-hidden rounded-xl shadow-2xl transition-all duration-300',
        expanded ? 'left-1/2 top-18 bottom-4' : 'w-64 h-48',
        className,
      )}
    >
      <div ref={mapDivRef} className="w-full h-full" />

      {/* Expand/collapse — stopPropagation prevents ArcGIS from swallowing the click */}
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded((prev) => !prev); }}
        style={{ cursor: 'pointer' }}
        className="absolute top-2 left-2 z-20 flex items-center justify-center rounded-md bg-white/90 p-2 text-gray-800 shadow hover:bg-white transition-colors"
        aria-label={expanded ? 'Collapse map' : 'Expand map'}
      >
        {expanded ? <FaCompress size={12} /> : <FaExpand size={12} />}
      </button>
    </div>
  );
};

export default ArcGISMap;
