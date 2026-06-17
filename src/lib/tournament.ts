import type { Item, TournamentBracket, TournamentMatch } from '../types';

function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// Resolve all byes (a match with exactly one entrant auto-advances) across every round
// until the bracket is stable. Used at creation and after each pick.
function resolveByes(rounds: TournamentMatch[][]): void {
  let progress = true;
  while (progress) {
    progress = false;
    for (let r = 0; r < rounds.length; r++) {
      for (let m = 0; m < rounds[r].length; m++) {
        const match = rounds[r][m];
        if (match.winner) continue;
        const isBye = (match.a && !match.b) || (!match.a && match.b);
        if (!isBye) continue;
        // Only treat as a bye if the empty slot can never be filled (no producing
        // source match, or that source is already resolved/empty).
        if (r > 0) {
          const srcIdx = m * 2 + (match.a ? 1 : 0);
          const src = rounds[r - 1][srcIdx];
          const sourceDone = !src || src.winner || (!src.a && !src.b);
          if (!sourceDone) continue;
        }
        const byeWinner = match.a || match.b;
        match.winner = byeWinner;
        if (r < rounds.length - 1) {
          const nextIdx = Math.floor(m / 2);
          if (m % 2 === 0) rounds[r + 1][nextIdx].a = byeWinner;
          else rounds[r + 1][nextIdx].b = byeWinner;
        }
        progress = true;
      }
    }
  }
}

function findNextPlayable(bracket: TournamentBracket): void {
  for (let r = 0; r < bracket.rounds.length; r++) {
    for (let m = 0; m < bracket.rounds[r].length; m++) {
      const match = bracket.rounds[r][m];
      if (match.a && match.b && !match.winner) {
        bracket.currentRound = r + 1;
        bracket.currentMatch = m;
        return;
      }
    }
  }
  // None playable → tournament complete.
  bracket.winner = bracket.rounds[bracket.totalRounds - 1][0].winner;
}

export function createTournamentBracket(items: Item[]): TournamentBracket {
  const shuffled = shuffle(items);
  const size = nextPowerOf2(shuffled.length);
  const totalRounds = Math.log2(size);

  const padded: (Item | null)[] = [...shuffled];
  while (padded.length < size) padded.push(null);

  const firstRound: TournamentMatch[] = [];
  for (let i = 0; i < padded.length; i += 2) {
    const a = padded[i];
    const b = padded[i + 1];
    const isBye = a === null || b === null;
    firstRound.push({ id: `r1-m${i / 2}`, round: 1, matchIndex: i / 2, a, b, winner: isBye ? a || b : null });
  }

  const rounds: TournamentMatch[][] = [firstRound];
  let matchesInRound = firstRound.length / 2;
  for (let round = 2; round <= totalRounds; round++) {
    const roundMatches: TournamentMatch[] = [];
    for (let i = 0; i < matchesInRound; i++) {
      roundMatches.push({ id: `r${round}-m${i}`, round, matchIndex: i, a: null, b: null, winner: null });
    }
    rounds.push(roundMatches);
    matchesInRound /= 2;
  }

  resolveByes(rounds);
  const bracket: TournamentBracket = {
    rounds,
    currentRound: 1,
    currentMatch: 0,
    totalRounds,
    winner: rounds[rounds.length - 1][0].winner,
  };
  findNextPlayable(bracket);
  return bracket;
}

export function getCurrentTournamentMatchup(bracket: TournamentBracket): { a: Item; b: Item } | null {
  if (bracket.winner) return null;
  const match = bracket.rounds[bracket.currentRound - 1][bracket.currentMatch];
  if (match.a && match.b && !match.winner) return { a: match.a, b: match.b };
  return null;
}

export function selectTournamentWinner(bracket: TournamentBracket, winner: Item): TournamentBracket {
  const next = JSON.parse(JSON.stringify(bracket)) as TournamentBracket;
  const match = next.rounds[next.currentRound - 1][next.currentMatch];
  match.winner = winner;

  if (next.currentRound < next.totalRounds) {
    const nextIdx = Math.floor(next.currentMatch / 2);
    if (next.currentMatch % 2 === 0) next.rounds[next.currentRound][nextIdx].a = winner;
    else next.rounds[next.currentRound][nextIdx].b = winner;
  }

  resolveByes(next.rounds);
  findNextPlayable(next);
  return next;
}

export function getTournamentProgress(bracket: TournamentBracket): { completed: number; total: number } {
  let completed = 0;
  let total = 0;
  for (const round of bracket.rounds) {
    for (const match of round) {
      if (match.a || match.b) {
        total++;
        if (match.winner) completed++;
      }
    }
  }
  return { completed, total };
}
