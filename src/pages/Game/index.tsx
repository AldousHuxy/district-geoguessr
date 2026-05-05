import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleMap from '@/components/maps/google';
import ArcGISMap from '@/components/maps/arcgis';
import HUD from '@/components/game/HUD';
import RoundResult from '@/components/game/RoundResult';
import GameSummary from '@/components/game/GameSummary';
import Button from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import routes from '@/router';

const Game = () => {
  const phase = useGameStore((s) => s.phase);
  const rounds = useGameStore((s) => s.rounds);
  const currentRoundIndex = useGameStore((s) => s.currentRoundIndex);
  const currentGuess = useGameStore((s) => s.currentGuess);
  const setGuess = useGameStore((s) => s.setGuess);
  const submitGuess = useGameStore((s) => s.submitGuess);
  const tick = useGameStore((s) => s.tick);
  const navigate = useNavigate();

  useEffect(() => {
    if (phase === 'idle') {
      navigate(routes.menu, { replace: true });
    }
  }, [phase, navigate]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, tick]);

  if (phase === 'idle') return null;

  const currentLocation = rounds[currentRoundIndex];
  if (!currentLocation) return null;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-dark-blue">
      <GoogleMap
        position={currentLocation.coordinates}
        pov={currentLocation.pov}
        className="w-full h-full"
      />

      <HUD />

      <ArcGISMap
        center={currentLocation.coordinates}
        onGuess={setGuess}
        guessCoords={currentGuess}
      />

      {phase === 'playing' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <Button
            variant={currentGuess ? 'primary' : 'dark'}
            size="lg"
            onClick={submitGuess}
            disabled={!currentGuess}
          >
            {currentGuess ? 'Lock In Guess' : 'Click map to place pin'}
          </Button>
        </div>
      )}

      {phase === 'result' && <RoundResult />}
      {phase === 'complete' && <GameSummary />}
    </div>
  );
};

export default Game;