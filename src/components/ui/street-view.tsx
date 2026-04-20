import { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import cn from '@/utils/cn';

type StreetViewProps = {
  position: { lat: number; lng: number };
  className?: string;
};

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  v: 'weekly',
});

const StreetView = ({ position, className }: StreetViewProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const container = ref.current;

    (importLibrary('streetView') as Promise<google.maps.StreetViewLibrary>).then(({ StreetViewPanorama }) => {
      if (!container) return;
      new StreetViewPanorama(container, {
        position,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        addressControl: false,
        showRoadLabels: false,
      });
    });

    return () => {
      container.innerHTML = '';
    };
  }, [position.lat, position.lng]);

  return <div ref={ref} className={cn('w-full h-full', className)} />;
};

export default StreetView;
