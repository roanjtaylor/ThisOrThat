import type { Car, TournamentBracket, TournamentMatch } from '../types';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function nextPowerOf2(n: number): number {
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

export function createTournamentBracket(cars: Car[]): TournamentBracket {
  const shuffledCars = shuffleArray(cars);
  const bracketSize = nextPowerOf2(shuffledCars.length);
  const totalRounds = Math.log2(bracketSize);

  // Pad with null for byes
  const paddedCars: (Car | null)[] = [...shuffledCars];
  while (paddedCars.length < bracketSize) {
    paddedCars.push(null);
  }

  // Create first round matches
  const firstRound: TournamentMatch[] = [];
  for (let i = 0; i < paddedCars.length; i += 2) {
    const car1 = paddedCars[i];
    const car2 = paddedCars[i + 1];

    // Handle byes - if one car is null, the other automatically advances
    const isBye = car1 === null || car2 === null;
    const winner = isBye ? (car1 || car2) : null;

    firstRound.push({
      id: `r1-m${i / 2}`,
      round: 1,
      matchIndex: i / 2,
      car1,
      car2,
      winner,
    });
  }

  // Create empty rounds for the rest of the tournament
  const rounds: TournamentMatch[][] = [firstRound];
  let matchesInRound = firstRound.length / 2;
  for (let round = 2; round <= totalRounds; round++) {
    const roundMatches: TournamentMatch[] = [];
    for (let i = 0; i < matchesInRound; i++) {
      roundMatches.push({
        id: `r${round}-m${i}`,
        round,
        matchIndex: i,
        car1: null,
        car2: null,
        winner: null,
      });
    }
    rounds.push(roundMatches);
    matchesInRound /= 2;
  }

  // Process bye winners into second round
  const byeWinners = firstRound
    .filter((m) => m.winner !== null)
    .map((m) => m.winner!);

  if (byeWinners.length > 0 && rounds.length > 1) {
    for (let i = 0; i < firstRound.length; i++) {
      const match = firstRound[i];
      if (match.winner) {
        const nextRoundMatchIndex = Math.floor(i / 2);
        const isFirstCar = i % 2 === 0;
        if (isFirstCar) {
          rounds[1][nextRoundMatchIndex].car1 = match.winner;
        } else {
          rounds[1][nextRoundMatchIndex].car2 = match.winner;
        }
      }
    }
  }

  // Find first non-bye match
  let currentMatch = 0;
  for (let i = 0; i < firstRound.length; i++) {
    if (!firstRound[i].winner) {
      currentMatch = i;
      break;
    }
  }

  return {
    rounds,
    currentRound: 1,
    currentMatch,
    totalRounds,
    winner: null,
  };
}

export function selectTournamentWinner(
  bracket: TournamentBracket,
  winner: Car
): TournamentBracket {
  const newBracket = JSON.parse(JSON.stringify(bracket)) as TournamentBracket;
  const currentRound = newBracket.rounds[newBracket.currentRound - 1];
  const currentMatch = currentRound[newBracket.currentMatch];

  // Set the winner
  currentMatch.winner = winner;

  // Advance winner to next round
  if (newBracket.currentRound < newBracket.totalRounds) {
    const nextRound = newBracket.rounds[newBracket.currentRound];
    const nextMatchIndex = Math.floor(newBracket.currentMatch / 2);
    const isFirstSlot = newBracket.currentMatch % 2 === 0;

    if (isFirstSlot) {
      nextRound[nextMatchIndex].car1 = winner;
    } else {
      nextRound[nextMatchIndex].car2 = winner;
    }
  }

  // Find next match
  let nextMatchFound = false;
  let round = newBracket.currentRound;
  let match = newBracket.currentMatch + 1;

  while (!nextMatchFound && round <= newBracket.totalRounds) {
    const roundMatches = newBracket.rounds[round - 1];

    while (match < roundMatches.length) {
      const m = roundMatches[match];
      // Check if this match is ready to be played (both cars present, no winner yet)
      if (m.car1 && m.car2 && !m.winner) {
        nextMatchFound = true;
        break;
      }
      match++;
    }

    if (!nextMatchFound) {
      round++;
      match = 0;
    }
  }

  if (nextMatchFound) {
    newBracket.currentRound = round;
    newBracket.currentMatch = match;
  } else {
    // Tournament complete - find the final winner
    const finalRound = newBracket.rounds[newBracket.totalRounds - 1];
    newBracket.winner = finalRound[0].winner;
  }

  return newBracket;
}

export function getCurrentTournamentMatchup(
  bracket: TournamentBracket
): { car1: Car; car2: Car } | null {
  if (bracket.winner) return null;

  const currentRound = bracket.rounds[bracket.currentRound - 1];
  const currentMatch = currentRound[bracket.currentMatch];

  if (currentMatch.car1 && currentMatch.car2 && !currentMatch.winner) {
    return {
      car1: currentMatch.car1,
      car2: currentMatch.car2,
    };
  }

  return null;
}

export function getTournamentProgress(bracket: TournamentBracket): {
  completedMatches: number;
  totalMatches: number;
} {
  let completed = 0;
  let total = 0;

  for (const round of bracket.rounds) {
    for (const match of round) {
      // Only count real matches (where both cars exist or it's not a bye)
      if (match.car1 || match.car2) {
        total++;
        if (match.winner) {
          completed++;
        }
      }
    }
  }

  return { completedMatches: completed, totalMatches: total };
}
