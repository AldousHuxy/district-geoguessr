const MAX_SCORE = 5000;
/** Distance (km) at which score decays to ~37% of max. Tuned for a metro-scale game. */
const DECAY_KM = 10;

export function calcScore(distanceKm: number): number {
  return Math.round(MAX_SCORE * Math.exp(-distanceKm / DECAY_KM));
}
