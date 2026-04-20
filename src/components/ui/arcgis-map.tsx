import { useEffect, useRef, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import cn from '@/utils/cn';

type ArcGISMapProps = {
  center?: { lat: number; lng: number };
  className?: string;
};

const ArcGISMap = ({ center, className }: ArcGISMapProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const view = new MapView({
      container: ref.current,
      map: new Map({ basemap: 'streets-navigation-vector' }),
      center: center ? [center.lng, center.lat] : [0, 0],
      zoom: 13,
      ui: { components: ['zoom'] },
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (!viewRef.current || !center) return;
    viewRef.current.goTo({ center: [center.lng, center.lat] });
  }, [center?.lat, center?.lng]);

  return (
    <div
      className={cn(
        'absolute bottom-0 right-0 z-10 flex flex-col overflow-hidden rounded-tl-xl shadow-2xl transition-all duration-300',
        expanded ? 'w-1/2 h-full rounded-tl-none' : 'w-64 h-48',
        className
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="absolute top-2 left-2 z-20 flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-gray-800 shadow hover:bg-white transition-colors"
        aria-label={expanded ? 'Collapse map' : 'Expand map'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('transition-transform duration-300', expanded ? 'rotate-180' : '')}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {expanded ? 'Collapse' : 'Expand map'}
      </button>

      <div ref={ref} className="w-full h-full" />
    </div>
  );
};

export default ArcGISMap;
