import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdHome } from 'react-icons/md';
import { useGameStore } from '@/store/gameStore';
import { useSaveScore } from '@/hooks/useSaveScore';
import Button from '@/components/ui/button';
import routes from '@/router';

const GameSummary = () => {
  const results = useGameStore((s) => s.results);
  const resetGame = useGameStore((s) => s.resetGame);
  const playerEmail = useGameStore((s) => s.playerEmail);
  const navigate = useNavigate();
  const { mutate: saveScore, error: saveError, isSuccess: saveSuccess } = useSaveScore();
  const scoreSaved = useRef(false);

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const maxScore = results.length * 5000;

  useEffect(() => {
    if (playerEmail && !scoreSaved.current) {
      scoreSaved.current = true;
      saveScore({ email: playerEmail, score: totalScore });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayAgain = () => {
    resetGame();
    navigate(routes.menu, { replace: true });
  };

  return (
    <motion.div
      className="absolute inset-0 z-30 bg-dark-blue overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-lg mx-auto px-4 pt-10 pb-16">
        <img
          src={`${import.meta.env.BASE_URL}MHFD%20Logo.png`}
          alt="MHFD Logo"
          className="h-10 object-contain mx-auto mb-6 opacity-70"
        />

        <h1 className="text-4xl font-bold text-bright-yellow text-center mb-1">
          Game Complete!
        </h1>
        <p className="text-center text-sky-blue/60 mb-2">
          {totalScore.toLocaleString()} / {maxScore.toLocaleString()} pts
        </p>

        {/* Score bar */}
        <div className="w-full bg-dark-blue-100 rounded-full h-2 mb-8">
          <div
            className="bg-soft-green h-2 rounded-full transition-all"
            style={{ width: `${(totalScore / maxScore) * 100}%` }}
          />
        </div>

        <div className="flex flex-col gap-2 mb-8">
          {results.map((result, i) => (
            <div
              key={result.locationId}
              className="flex items-center gap-3 bg-dark-blue-100 rounded-xl p-3 border border-sky-blue/10"
            >
              <span className="text-sky-blue/40 text-sm w-5 text-right shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sky-blue font-medium text-sm truncate">
                  {result.locationName}
                </p>
                <p className="text-sky-blue/40 text-xs">
                  {result.distanceKm !== null
                    ? `${result.distanceKm.toFixed(1)} km away`
                    : 'No guess'}
                </p>
              </div>
              <span className="text-soft-green font-bold text-sm shrink-0">
                {result.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {saveError && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
            {saveError.message}
          </div>
        )}
        {saveSuccess && (
          <div className="mb-4 rounded-xl border border-soft-green/40 bg-soft-green/10 px-4 py-3 text-center text-sm text-soft-green">
            Score saved!
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="dark" size="lg" className="shrink-0" onClick={handlePlayAgain} aria-label="Home">
            <MdHome className="text-xl" />
          </Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={handlePlayAgain}>
            Play Again
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameSummary;
