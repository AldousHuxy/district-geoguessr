import StreetView from '@/components/ui/street-view';
import ArcGISMap from '@/components/ui/arcgis-map';

// Replace with real coordinates for the location you want to show
const PLACEHOLDER_POSITION = { lat: 48.8584, lng: 2.2945 };

const Game = () => {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-dark-blue">
      <StreetView position={PLACEHOLDER_POSITION} className="w-full h-full" />
      <ArcGISMap center={PLACEHOLDER_POSITION} />
    </div>
  );
};

export default Game;