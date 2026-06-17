import type { EloRating, EloState, Item, Matchup } from '../types';

const K_FACTOR = 32;
const INITIAL_RATING = 1500;

function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate balanced matchups so every item appears roughly equally often.
function generateMatchups(items: Item[], count: number): Matchup[] {
  const matchups: Matchup[] = [];
  const appearances = new Map<string, number>();
  items.forEach((it) => appearances.set(it.id, 0));

  for (let i = 0; i < count; i++) {
    const sorted = [...items].sort(
      (a, b) => (appearances.get(a.id) || 0) - (appearances.get(b.id) || 0)
    );
    const a = sorted[0];
    const pool = sorted.slice(0, Math.max(2, Math.ceil(items.length / 2))).filter((c) => c.id !== a.id);
    const b = pool[Math.floor(Math.random() * pool.length)];
    matchups.push({ a, b });
    appearances.set(a.id, (appearances.get(a.id) || 0) + 1);
    appearances.set(b.id, (appearances.get(b.id) || 0) + 1);
  }
  return shuffle(matchups);
}

export function createEloState(items: Item[]): EloState {
  const ratings = new Map<string, EloRating>();
  items.forEach((item) => ratings.set(item.id, { item, rating: INITIAL_RATING, wins: 0, losses: 0, seen: 0 }));
  const matchups = generateMatchups(items, items.length * 2);
  return { ratings, matchups, currentIndex: 0, total: matchups.length, completed: false };
}

function expectedScore(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

export function getCurrentEloMatchup(state: EloState): Matchup | null {
  if (state.completed) return null;
  return state.matchups[state.currentIndex];
}

export function selectEloWinner(state: EloState, winner: Item): EloState {
  const matchup = state.matchups[state.currentIndex];
  const loser = matchup.a.id === winner.id ? matchup.b : matchup.a;
  const ratings = new Map(state.ratings);

  const w = ratings.get(winner.id)!;
  const l = ratings.get(loser.id)!;
  const ew = expectedScore(w.rating, l.rating);
  const el = expectedScore(l.rating, w.rating);

  ratings.set(winner.id, {
    ...w,
    rating: Math.round(w.rating + K_FACTOR * (1 - ew)),
    wins: w.wins + 1,
    seen: w.seen + 1,
  });
  ratings.set(loser.id, {
    ...l,
    rating: Math.round(l.rating + K_FACTOR * (0 - el)),
    losses: l.losses + 1,
    seen: l.seen + 1,
  });

  const currentIndex = state.currentIndex + 1;
  return { ...state, ratings, currentIndex, completed: currentIndex >= state.total };
}

export function getEloRankings(state: EloState): EloRating[] {
  return Array.from(state.ratings.values()).sort((a, b) => b.rating - a.rating);
}
