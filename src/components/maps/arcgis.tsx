import { useEffect, useRef, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import { FaExpand, FaCompress } from 'react-icons/fa';
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
        'absolute bottom-4 right-16 z-10 flex flex-col overflow-hidden rounded-xl shadow-2xl transition-all duration-300',
        expanded ? 'w-1/2 top-4 bottom-4 h-auto rounded-xl' : 'w-64 h-48',
        className
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="absolute top-2 left-2 z-20 flex items-center justify-center rounded-md bg-white/90 p-2 text-gray-800 shadow hover:bg-white transition-colors"
        aria-label={expanded ? 'Collapse map' : 'Expand map'}
      >
        {expanded ? <FaCompress size={12} /> : <FaExpand size={12} />}
      </button>

      <div ref={ref} className="w-full h-full" />
    </div>
  );
};

export default ArcGISMap;
