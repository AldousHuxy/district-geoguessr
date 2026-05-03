import { useEffect, useRef, useState } from 'react';
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

const GoogleMap = ({ position, className }: StreetViewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const container = ref.current;
    let mounted = true;

    const initStreetView = async () => {
      try {
        const { StreetViewPanorama, StreetViewService, StreetViewStatus } = 
          await importLibrary('streetView') as google.maps.StreetViewLibrary;

        if (!mounted || !container) return;

        // Check if Street View is available at this location
        const service = new StreetViewService();
        service.getPanorama(
          { location: position, radius: 50 },
          (data, status) => {
            if (!mounted) return;

            if (status === StreetViewStatus.OK && data) {
              // Create panorama
              panoramaRef.current = new StreetViewPanorama(container, {
                position,
                pov: { heading: 0, pitch: 0 },
                zoom: 1,
                addressControl: false,
                showRoadLabels: false,
                linksControl: true,
                panControl: true,
                enableCloseButton: false,
              });

              setError(null);
            } else {
              setError('Street View not available at this location');
              console.error('Street View status:', status);
            }
          }
        );
      } catch (err) {
        if (mounted) {
          console.error('Error loading Google Maps:', err);
          setError('Failed to load Google Maps. Please check your API key and quota.');
        }
      }
    };

    initStreetView();

    return () => {
      mounted = false;
      if (panoramaRef.current) {
        // Properly clean up the panorama instance
        panoramaRef.current.setVisible(false);
        panoramaRef.current = null;
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [position.lat, position.lng]);

  if (error) {
    return (
      <div className={cn('w-full h-full flex items-center justify-center bg-gray-900 text-white p-4', className)}>
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">⚠️ Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return <div ref={ref} className={cn('w-full h-full', className)} />;
};

export default GoogleMap;
