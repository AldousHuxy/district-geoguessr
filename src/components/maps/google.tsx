import { Wrapper } from '@googlemaps/react-wrapper';
import { useEffect, useRef, useState } from 'react';
import cn from '@/utils/cn';

type StreetViewProps = {
  position: { lat: number; lng: number };
  pov?: { heading: number; pitch: number };
  className?: string;
};

const StreetView = ({ position, pov, className }: StreetViewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [panorama, setPanorama] =
    useState<google.maps.StreetViewPanorama | null>(null);

  useEffect(() => {
    if (ref.current && !panorama) {
      setPanorama(new window.google.maps.StreetViewPanorama(ref.current, {}));
    }
  }, [ref, panorama]);

  useEffect(() => {
    if (panorama) {
      panorama.setOptions({
        position,
        pov: pov ?? { heading: 0, pitch: 0 },
        zoom: 1,
        addressControl: false,
        showRoadLabels: false,
        linksControl: true,
        panControl: true,
        enableCloseButton: false,
      });
    }
  }, [panorama, position, pov]);

  return <div ref={ref} className={cn('w-full h-full', className)} />;
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
