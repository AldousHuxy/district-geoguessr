import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import routes from '@/router';
import { useTopScores } from '@/hooks/useTopScores';
import type { Score } from '@/types/score';

const HighScores = () => {
  const navigate = useNavigate();
  const { topScores, isLoading, error } = useTopScores();

  return (
    <div className="min-h-dvh w-full bg-dark-blue flex flex-col items-center px-6 pt-12 pb-16">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(routes.menu)}
            className="text-sky-blue hover:text-bright-yellow transition-colors cursor-pointer"
            aria-label="Back to menu"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-bright-yellow tracking-tight">High Scores</h1>
        </div>

        {isLoading && (
          <p className="text-sky-blue/60 text-center mt-16">Loading scores...</p>
        )}

        {error && (
          <p className="text-red-400 text-center mt-16">Failed to load scores.</p>
        )}

        {topScores && (
          <ol className="flex flex-col gap-3">
            {(topScores as Score[]).map((entry, i) => (
              <li
                key={i}
                className="flex items-center gap-4 bg-medium-blue/10 border border-sky-blue/10 rounded-xl px-5 py-4"
              >
                <span
                  className={`text-lg font-bold w-7 shrink-0 ${
                    i === 0
                      ? 'text-bright-yellow'
                      : i === 1
                      ? 'text-sky-blue'
                      : i === 2
                      ? 'text-soft-green'
                      : 'text-sky-blue/40'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sky-blue font-medium truncate">{entry.email}</span>
                  <span className="text-sky-blue/50 text-sm">{entry.attempts} rounds</span>
                </div>
                <span className="text-bright-yellow font-bold text-lg shrink-0">
                  {entry.score.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        )}

        {topScores && topScores.length === 0 && (
          <p className="text-sky-blue/60 text-center mt-16">No scores yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default HighScores;
