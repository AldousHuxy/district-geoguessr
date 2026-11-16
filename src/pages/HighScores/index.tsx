import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import routes from '@/router';
import { useTopScores } from '@/hooks/useTopScores';
import { useClearScores } from '@/hooks/useClearScores';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import type { Score } from '@/types/score';

const HighScores = () => {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();
  const { topScores, isLoading, error } = useTopScores();
  const clearScores = useClearScores();

  const openResetModal = () => {
    setResetToken('');
    clearScores.reset();
    setResetModalOpen(true);
  };

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
          <h1 className="text-3xl font-bold text-bright-yellow tracking-tight flex-1">High Scores</h1>
          <button
            type="button"
            onClick={openResetModal}
            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            aria-label="Reset high scores"
            title="Reset high scores"
          >
            <FiTrash2 size={20} />
          </button>
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

      <Modal
        open={resetModalOpen}
        onClose={() => {
          if (!clearScores.isPending) setResetModalOpen(false);
        }}
        title="Reset all high scores?"
      >
        <p className="text-sky-blue/70 mb-4">
          This permanently deletes every saved score and attempt. Enter the reset key to continue.
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            clearScores.mutate(resetToken, {
              onSuccess: () => {
                setResetToken('');
                setResetModalOpen(false);
              },
            });
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="score-reset-token" className="text-sm text-sky-blue/80">
              Reset key
            </label>
            <input
              id="score-reset-token"
              type="password"
              autoComplete="off"
              required
              value={resetToken}
              onChange={(event) => setResetToken(event.target.value)}
              className="w-full rounded-lg bg-dark-blue border border-sky-blue/30 text-sky-blue placeholder:text-sky-blue/30 px-4 py-3 text-base outline-none focus:border-sky-blue transition-colors"
              disabled={clearScores.isPending}
            />
          </div>
          {clearScores.error && (
            <p role="alert" className="text-red-400 text-sm">
              {clearScores.error.message || 'Unable to reset high scores.'}
            </p>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="dark"
              className="flex-1"
              onClick={() => setResetModalOpen(false)}
              disabled={clearScores.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 text-white hover:bg-red-500"
              disabled={clearScores.isPending || !resetToken}
            >
              {clearScores.isPending ? 'Clearing...' : 'Clear scores'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HighScores;
