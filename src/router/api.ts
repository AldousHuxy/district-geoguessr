const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export default {
    TEST: `${BASE}/api`,
    ALL_SCORES: `${BASE}/api/scores`,
    TOP_SCORES: `${BASE}/api/scores/top`,
    POST_SCORE: `${BASE}/api/scores`
}