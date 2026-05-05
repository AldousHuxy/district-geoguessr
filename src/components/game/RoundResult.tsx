import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import Button from '@/components/ui/button';
import ResultMap from '@/components/game/ResultMap';

const RoundResult = () => {
  const results = useGameStore((s) => s.results);
  const rounds = useGameStore((s) => s.rounds);
  const currentRoundIndex = useGameStore((s) => s.currentRoundIndex);
  const nextRound = useGameStore((s) => s.nextRound);

  const lastResult = results[results.length - 1];
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const isLast = currentRoundIndex >= rounds.length - 1;

  if (!lastResult) return null;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-dark-blue/85 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-dark-blue-100 border border-sky-blue/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.05 }}
      >
        <ResultMap guess={lastResult.guess} actual={lastResult.actualCoordinates} />

        <h2 className="text-2xl font-bold text-bright-yellow mb-1 mt-4">
          {lastResult.locationName}
        </h2>
        <p className="text-sky-blue/60 text-sm mb-4">{lastResult.actualCoordinates.lat.toFixed(4)}° N, {Math.abs(lastResult.actualCoordinates.lng).toFixed(4)}° W</p>

        <div className="rounded-xl bg-dark-blue/60 border border-sky-blue/10 px-4 py-3 mb-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sky-blue/60 text-sm">Distance</span>
            <span className="text-sky-blue font-medium">
              {lastResult.distanceKm !== null
                ? `${lastResult.distanceKm.toFixed(1)} km away`
                : 'No guess placed'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sky-blue/60 text-sm">This round</span>
            <span className="text-xl font-bold text-soft-green">
              +{lastResult.score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-sky-blue/10 pt-2 mt-1">
            <span className="text-sky-blue/60 text-sm">Total score</span>
            <span className="text-lg font-bold text-sky-blue">
              {totalScore.toLocaleString()}
            </span>
          </div>
        </div>

        <Button variant="primary" size="lg" className="w-full" onClick={nextRound}>
          {isLast ? 'See Results' : 'Next Round'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default RoundResult;
