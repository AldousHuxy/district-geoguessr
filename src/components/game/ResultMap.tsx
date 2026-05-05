import { useEffect, useRef } from 'react';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';

type ResultMapProps = {
  guess: { lat: number; lng: number } | null;
  actual: { lat: number; lng: number };
};

const ResultMap = ({ guess, actual }: ResultMapProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const layer = new GraphicsLayer();
    const view = new MapView({
      container: divRef.current,
      map: new Map({ basemap: 'streets-navigation-vector', layers: [layer] }),
      ui: { components: [] },
      // Temporary center — goTo overrides this after ready
      center: [actual.lng, actual.lat],
      zoom: 10,
    });

    view.when(() => {
      const actualPoint = new Point({ latitude: actual.lat, longitude: actual.lng });

      // Actual location pin — teal/green
      layer.add(
        new Graphic({
          geometry: actualPoint,
          symbol: new SimpleMarkerSymbol({
            color: '#29c499',
            size: 14,
            style: 'circle',
            outline: { color: '#06242d', width: 2 },
          }),
        }),
      );

      if (guess) {
        const guessPoint = new Point({ latitude: guess.lat, longitude: guess.lng });

        // Guess pin — yellow
        layer.add(
          new Graphic({
            geometry: guessPoint,
            symbol: new SimpleMarkerSymbol({
              color: '#ffdd00',
              size: 14,
              style: 'circle',
              outline: { color: '#06242d', width: 2 },
            }),
          }),
        );

        // Dashed line connecting guess → actual
        layer.add(
          new Graphic({
            geometry: new Polyline({
              paths: [[[guess.lng, guess.lat], [actual.lng, actual.lat]]],
            }),
            symbol: new SimpleLineSymbol({
              color: '#66d4ff',
              width: 2,
              style: 'dash',
            }),
          }),
        );

        view.padding = { top: 24, right: 24, bottom: 24, left: 24 };
        view.goTo([guessPoint, actualPoint]).catch(() => {});
      } else {
        view.goTo({ target: actualPoint, zoom: 12 }).catch(() => {});
      }
    });

    return () => { view.destroy(); };
  }, []);

  return <div ref={divRef} className="w-full h-48 rounded-xl overflow-hidden" />;
};

export default ResultMap;
