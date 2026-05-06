import { create } from 'zustand';
import { calcDistance } from '@/utils/distance';
import { calcScore } from '@/utils/score';

export type Location = {
  id: string;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number };
  pov: { heading: number; pitch: number };
  district: string;
};

export type RoundResult = {
  locationId: string;
  locationName: string;
  guess: { lat: number; lng: number } | null;
  actualCoordinates: { lat: number; lng: number };
  distanceKm: number | null;
  score: number;
};

type Phase = 'idle' | 'playing' | 'result' | 'complete';

type GameState = {
  phase: Phase;
  playerEmail: string;
  rounds: Location[];
  currentRoundIndex: number;
  currentGuess: { lat: number; lng: number } | null;
  results: RoundResult[];
  timeRemaining: number;
};

type GameActions = {
  startGame: (email: string, locations: Location[]) => void;
  setGuess: (coords: { lat: number; lng: number }) => void;
  submitGuess: () => void;
  nextRound: () => void;
  tick: () => void;
  resetGame: () => void;
};

export const ROUND_TIME: number = 45;

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  phase: 'idle',
  playerEmail: '',
  rounds: [],
  currentRoundIndex: 0,
  currentGuess: null,
  results: [],
  timeRemaining: ROUND_TIME,

  startGame: (email, locations) => {
    set({
      phase: 'playing',
      playerEmail: email,
      rounds: locations,
      currentRoundIndex: 0,
      currentGuess: null,
      results: [],
      timeRemaining: ROUND_TIME,
    });
  },

  setGuess: (coords) => {
    set({ currentGuess: coords });
  },

  submitGuess: () => {
    const { phase, rounds, currentRoundIndex, currentGuess, results } = get();
    if (phase !== 'playing') return;

    const location = rounds[currentRoundIndex];
    const distanceKm = currentGuess
      ? calcDistance(currentGuess, location.coordinates)
      : null;
    const score = distanceKm !== null ? calcScore(distanceKm) : 0;

    const result: RoundResult = {
      locationId: location.id,
      locationName: location.name,
      guess: currentGuess,
      actualCoordinates: location.coordinates,
      distanceKm,
      score,
    };

    set({ results: [...results, result], phase: 'result' });
  },

  nextRound: () => {
    const { rounds, currentRoundIndex } = get();
    const isLast = currentRoundIndex >= rounds.length - 1;
    if (isLast) {
      set({ phase: 'complete' });
    } else {
      set({
        currentRoundIndex: currentRoundIndex + 1,
        currentGuess: null,
        timeRemaining: ROUND_TIME,
        phase: 'playing',
      });
    }
  },

  tick: () => {
    const { phase, timeRemaining } = get();
    if (phase !== 'playing') return;
    if (timeRemaining <= 1) {
      get().submitGuess();
    } else {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  resetGame: () => {
    set({
      phase: 'idle',
      playerEmail: '',
      rounds: [],
      currentRoundIndex: 0,
      currentGuess: null,
      results: [],
      timeRemaining: ROUND_TIME,
    });
  },
}));
