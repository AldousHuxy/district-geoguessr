import { Wrapper } from '@googlemaps/react-wrapper';
import { useEffect, useRef, useState } from 'react';
import cn from '@/utils/cn';

type StreetViewProps = {
  position: { lat: number; lng: number };
  pov?: { heading: number; pitch: number };
  className?: string;
};

const PANORAMA_OPTIONS: Omit<google.maps.StreetViewPanoramaOptions, 'position' | 'pov'> = {
  zoom: 1,
  visible: true,
  addressControl: false,
  showRoadLabels: false,
  linksControl: true,
  panControl: true,
  enableCloseButton: false,
};

const StreetView = ({ position, pov, className }: StreetViewProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  // Create panorama once with all options — avoids the two-effect black-frame gap
  useEffect(() => {
    if (!divRef.current) return;
    panoramaRef.current = new window.google.maps.StreetViewPanorama(divRef.current, {
      ...PANORAMA_OPTIONS,
      position,
      pov: pov ?? { heading: 0, pitch: 0 },
    });
    return () => {
      panoramaRef.current = null;
    };
  }, []);

  // Update position and POV individually — cheaper than setOptions, avoids tile burst
  useEffect(() => {
    if (!panoramaRef.current) return;
    panoramaRef.current.setPosition(position);
    panoramaRef.current.setPov(pov ?? { heading: 0, pitch: 0 });
  }, [position.lat, position.lng, pov?.heading, pov?.pitch]);

  return <div ref={divRef} className={cn('w-full h-full', className)} />;
};

const GoogleMap = (props: StreetViewProps) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <Wrapper
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}
      render={(status) => {
        switch (status) {
          case 'LOADING':
            return (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                Loading...
              </div>
            );
          case 'FAILURE':
            setError(
              'Failed to load Google Maps. Please check your API key and quota.',
            );
            return <></>;
          case 'SUCCESS':
            return <StreetView {...props} />;
          default:
            return <></>;
        }
      }}
    >
      {error && (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center bg-gray-900 text-white p-4',
            props.className,
          )}
        >
          <div className="text-center">
            <p className="text-red-500 font-semibold mb-2">⚠️ Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default GoogleMap;
