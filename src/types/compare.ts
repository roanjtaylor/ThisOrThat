import type { Item } from './item';

export type CompareMode = 'elo' | 'tournament';

export interface Matchup {
  a: Item;
  b: Item;
}

export interface EloRating {
  item: Item;
  rating: number;
  wins: number;
  losses: number;
  seen: number;
}

export interface EloState {
  ratings: Map<string, EloRating>;
  matchups: Matchup[];
  currentIndex: number;
  total: number;
  completed: boolean;
}

export interface TournamentMatch {
  id: string;
  round: number;
  matchIndex: number;
  a: Item | null;
  b: Item | null;
  winner: Item | null;
}

export interface TournamentBracket {
  rounds: TournamentMatch[][];
  currentRound: number;
  currentMatch: number;
  totalRounds: number;
  winner: Item | null;
}
