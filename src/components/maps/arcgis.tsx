import { type ReactNode, useEffect, useRef, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Extent from '@arcgis/core/geometry/Extent';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import { FaExpand, FaCompress, FaMapMarkedAlt, FaStreetView } from 'react-icons/fa';
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
  roundIndex: number;
  playing: boolean;
  onGuess?: (coords: { lat: number; lng: number }) => void;
  guessCoords?: { lat: number; lng: number } | null;
  className?: string;
  children?: ReactNode;
};

const ArcGISMap = ({ center, roundIndex, playing, onGuess, guessCoords, className, children }: ArcGISMapProps) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  const onGuessRef = useRef(onGuess);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const focusAfterToggleRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  useEffect(() => {
    if (!focusAfterToggleRef.current) return;
    focusAfterToggleRef.current = false;
    (mobileMapOpen ? closeButtonRef : openButtonRef).current?.focus();
  }, [mobileMapOpen]);

  useEffect(() => {
    onGuessRef.current = onGuess;
  }, [onGuess]);

  useEffect(() => {
    if (!mapDivRef.current) return;

    const mhfdLayer = new MapImageLayer({
      url: 'https://gis.mhfd.org/server/rest/services/Boundaries/MHFDBoundary/MapServer',
    });
    // The companion map service renders the same Streams layer server-side.
    const streamsLayer = new MapImageLayer({
      url: 'https://gis.mhfd.org/server/rest/services/Hydrology/Streams/MapServer',
      sublayers: [{ id: 1, popupEnabled: false }],
    });
    const graphicsLayer = new GraphicsLayer();
    graphicsLayerRef.current = graphicsLayer;
    let disposed = false;
    streamsLayer.load().catch((error: unknown) => {
      if (!disposed) console.error('Unable to load MHFD streams layer:', error);
    });

    const view = new MapView({
      container: mapDivRef.current,
      map: new Map({ basemap: 'streets-navigation-vector', layers: [mhfdLayer, streamsLayer, graphicsLayer] }),
      extent: MHFD_EXTENT,
      ui: { components: ['zoom'] },
    });
    viewRef.current = view;

    const clickHandle = view.on('immediate-click', (event) => {
      const { latitude, longitude } = event.mapPoint;
      if (latitude == null || longitude == null) return;
      onGuessRef.current?.({ lat: latitude, lng: longitude });
    });

    return () => {
      disposed = true;
      clickHandle.remove();
      view.destroy();
    };
  }, []);

  // Reset even if consecutive rounds happen to have the same coordinates.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    setExpanded(false);
    setMobileMapOpen(false);
    let cancelled = false;
    view.when().then(() => {
      if (!cancelled) return view.goTo(MHFD_EXTENT, { animate: false });
    }).catch((error: unknown) => {
      if (cancelled || (error instanceof Error && error.name === 'AbortError')) return;
      console.error('Unable to reset guess map extent:', error);
    });
    return () => { cancelled = true; };
  }, [roundIndex, center?.lat, center?.lng]);

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
    <>
      {playing && !mobileMapOpen && (
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => { focusAfterToggleRef.current = true; setMobileMapOpen(true); }}
          aria-controls="guess-map"
          aria-expanded={false}
          className="absolute z-10 left-1/2 -translate-x-1/2 bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] flex min-h-11 items-center gap-2 rounded-lg bg-dark-blue-100 px-5 py-3 font-semibold text-sky-blue shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bright-yellow md:hidden"
        >
          <FaMapMarkedAlt aria-hidden="true" />
          {guessCoords ? 'View Guess Map' : 'Open Guess Map'}
        </button>
      )}

      <div
        id="guess-map"
        style={{ cursor: 'default' }}
        className={cn(
          'absolute z-10 flex flex-col gap-2 left-2 right-2 top-[max(4rem,calc(env(safe-area-inset-top)+3.5rem))] bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))]',
          'md:transition-all md:duration-300',
          mobileMapOpen ? 'visible' : 'invisible pointer-events-none md:visible md:pointer-events-auto',
          expanded
            ? 'md:left-1/2 md:top-18 md:bottom-4 md:right-16 md:w-auto'
            : 'md:left-auto md:top-auto md:w-64 md:bottom-4 md:right-16',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2 rounded-xl bg-dark-blue-100 px-3 py-1 text-sky-blue shadow-xl md:hidden">
          <span className="text-sm font-semibold">
            {guessCoords ? 'Tap to move your pin' : 'Tap the map to place a pin'}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => { focusAfterToggleRef.current = true; setMobileMapOpen(false); }}
            aria-controls="guess-map"
            aria-expanded={true}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 font-semibold text-bright-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bright-yellow"
          >
            <FaStreetView aria-hidden="true" />
            Street View
          </button>
        </div>
        <div
          className={cn(
            'relative w-full flex-1 min-h-0 overflow-hidden rounded-xl shadow-2xl',
            expanded ? 'md:flex-1 md:min-h-0' : 'md:flex-none md:h-48',
          )}
        >
          <div
            ref={mapDivRef}
            className="w-full h-full max-md:[&_.esri-zoom]:origin-top-left max-md:[&_.esri-zoom]:scale-[1.375]"
            style={{ touchAction: 'none', userSelect: 'none' }}
          />

          {/* Expand/collapse — stopPropagation prevents ArcGIS from swallowing the click */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded((prev) => !prev); }}
            style={{ cursor: 'pointer' }}
            className="absolute top-2 right-2 z-20 hidden md:flex items-center justify-center rounded-md bg-white/90 p-3 text-gray-800 shadow hover:bg-white transition-colors"
            aria-label={expanded ? 'Collapse map' : 'Expand map'}
          >
            {expanded ? <FaCompress size={12} /> : <FaExpand size={12} />}
          </button>
        </div>

        {children}
      </div>
    </>
  );
};

export default ArcGISMap;
