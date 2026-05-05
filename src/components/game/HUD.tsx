import { useGameStore } from '@/store/gameStore';
import cn from '@/utils/cn';

const HUD = () => {
  const rounds = useGameStore((s) => s.rounds);
  const currentRoundIndex = useGameStore((s) => s.currentRoundIndex);
  const results = useGameStore((s) => s.results);
  const timeRemaining = useGameStore((s) => s.timeRemaining);

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const isLowTime = timeRemaining <= 15;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 bg-dark-blue/70 backdrop-blur-sm">
      <span className="text-sky-blue font-semibold text-sm">
        Round {currentRoundIndex + 1} / {rounds.length}
      </span>

      <span
        className={cn(
          'text-2xl font-bold tabular-nums transition-colors',
          isLowTime ? 'text-red-400 animate-pulse' : 'text-bright-yellow',
        )}
      >
        {timeRemaining}s
      </span>

      <span className="text-sky-blue font-semibold text-sm">
        {totalScore.toLocaleString()} pts
      </span>
    </div>
  );
};

export default HUD;
