import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { CarCard } from '../components/game/CarCard';
import { useGame } from '../context/GameContext';
import { getEloRankings } from '../utils/elo';
import type { Car, TournamentBracket } from '../types';

export function ResultsPage() {
  const navigate = useNavigate();
  const { state, resetGame } = useGame();

  // Check if results are actually ready
  const hasResults =
    (state.mode === 'tournament' && state.tournament?.winner) ||
    (state.mode === 'elo' && state.elo?.completed);

  // Redirect to home if no game is complete and no results
  useEffect(() => {
    if (!state.isGameComplete && !hasResults) {
      navigate('/');
    }
  }, [state.isGameComplete, hasResults, navigate]);

  const handlePlayAgain = () => {
    resetGame();
    navigate('/');
  };

  // Show loading state while waiting for results to be ready
  if (!hasResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageContainer className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-600 text-xl">Loading results...</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (state.mode === 'tournament' && state.tournament?.winner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <PageContainer>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-6xl block mb-4">🏆</span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Champion!
              </h1>
              <p className="text-gray-600">
                Your favorite car has emerged victorious
              </p>
            </div>

            <div className="max-w-md mx-auto mb-8">
              <CarCard
                car={state.tournament.winner}
                isClickable={false}
                showViewMore={true}
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Tournament Bracket
              </h2>
              <BracketVisualization bracket={state.tournament} />
            </div>

            <div className="text-center">
              <Button size="lg" onClick={handlePlayAgain}>
                Play Again
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (state.mode === 'elo' && state.elo?.completed) {
    const rankings = getEloRankings(state.elo);

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <PageContainer>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-6xl block mb-4">📊</span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Rankings
              </h1>
              <p className="text-gray-600">
                Based on your {state.elo.totalMatchups} comparisons
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              {rankings.map((rating, index) => (
                <div
                  key={rating.car.id}
                  className={`flex items-center gap-4 p-4 ${
                    index !== rankings.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : index === 1
                        ? 'bg-gray-200 text-gray-700'
                        : index === 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-shrink-0 w-16 h-12 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={rating.car.imageUrl}
                      alt={rating.car.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">
                      {rating.car.year} {rating.car.brand} {rating.car.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {rating.wins}W - {rating.losses}L
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">
                      {rating.rating}
                    </span>
                    <p className="text-xs text-gray-500">ELO</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" onClick={handlePlayAgain}>
                Play Again
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return null;
}

// Calculate tournament rankings based on how far each car got
function getTournamentRankings(bracket: TournamentBracket): { car: Car; placement: string; roundEliminated: number }[] {
  const rankings: { car: Car; placement: string; roundEliminated: number }[] = [];
  const processedCarIds = new Set<string>();

  // Winner gets 1st place
  if (bracket.winner) {
    rankings.push({ car: bracket.winner, placement: '1st', roundEliminated: bracket.totalRounds + 1 });
    processedCarIds.add(bracket.winner.id);
  }

  // Go through rounds in reverse to find when each car was eliminated
  for (let r = bracket.rounds.length - 1; r >= 0; r--) {
    const round = bracket.rounds[r];
    for (const match of round) {
      // Skip empty matches or matches without a winner
      if (!match.winner) continue;

      // Find the loser of this match
      const loser = match.car1?.id === match.winner.id ? match.car2 : match.car1;

      if (loser && !processedCarIds.has(loser.id)) {
        processedCarIds.add(loser.id);

        // Determine placement based on round eliminated
        let placement: string;
        const roundsFromFinal = bracket.totalRounds - (r + 1);

        if (roundsFromFinal === 0) {
          placement = '2nd'; // Lost in final
        } else if (roundsFromFinal === 1) {
          placement = '3rd-4th'; // Lost in semifinal
        } else if (roundsFromFinal === 2) {
          placement = '5th-8th'; // Lost in quarterfinal
        } else {
          const minPlace = Math.pow(2, roundsFromFinal) + 1;
          const maxPlace = Math.pow(2, roundsFromFinal + 1);
          placement = `${minPlace}th-${maxPlace}th`;
        }

        rankings.push({ car: loser, placement, roundEliminated: r + 1 });
      }
    }
  }

  // Sort by round eliminated (descending) - those eliminated later rank higher
  rankings.sort((a, b) => b.roundEliminated - a.roundEliminated);

  return rankings;
}

// Get the winner's path through the tournament
function getWinnerPath(bracket: TournamentBracket): { round: number; opponent: Car | null; roundName: string }[] {
  if (!bracket.winner) return [];

  const path: { round: number; opponent: Car | null; roundName: string }[] = [];

  for (let r = 0; r < bracket.rounds.length; r++) {
    const round = bracket.rounds[r];
    for (const match of round) {
      if (match.winner?.id === bracket.winner.id) {
        const opponent = match.car1?.id === bracket.winner.id ? match.car2 : match.car1;

        let roundName: string;
        const roundsFromFinal = bracket.totalRounds - (r + 1);
        if (roundsFromFinal === 0) roundName = 'Final';
        else if (roundsFromFinal === 1) roundName = 'Semifinal';
        else if (roundsFromFinal === 2) roundName = 'Quarterfinal';
        else roundName = `Round ${r + 1}`;

        // Only add if there was an actual opponent (not a bye)
        path.push({ round: r + 1, opponent, roundName });
        break;
      }
    }
  }

  return path;
}

function BracketVisualization({
  bracket,
}: {
  bracket: TournamentBracket;
}) {
  const rankings = getTournamentRankings(bracket);
  const winnerPath = getWinnerPath(bracket);
  const actualMatchesPlayed = winnerPath.filter(p => p.opponent !== null).length;

  return (
    <div className="space-y-8">
      {/* Winner's Journey */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Path to Victory
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {winnerPath.map((step, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <div className="text-gray-400 mx-2">→</div>
              )}
              <div className={`px-3 py-2 rounded-lg ${
                step.opponent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
              }`}>
                <div className="text-xs font-medium text-gray-500">{step.roundName}</div>
                {step.opponent ? (
                  <div className="text-sm font-medium">
                    vs {step.opponent.brand} {step.opponent.name.slice(0, 12)}
                    {step.opponent.name.length > 12 ? '...' : ''}
                  </div>
                ) : (
                  <div className="text-sm italic">Bye</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Won {actualMatchesPlayed} match{actualMatchesPlayed !== 1 ? 'es' : ''} to claim victory
        </p>
      </div>

      {/* Final Rankings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Final Rankings
        </h3>
        <div className="grid gap-2">
          {rankings.map((entry, index) => (
            <div
              key={entry.car.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                index === 0
                  ? 'bg-yellow-50 border border-yellow-200'
                  : index === 1
                  ? 'bg-gray-100 border border-gray-200'
                  : index === 2
                  ? 'bg-orange-50 border border-orange-200'
                  : 'bg-white border border-gray-100'
              }`}
            >
              <div
                className={`flex-shrink-0 w-12 h-8 rounded flex items-center justify-center font-bold text-sm ${
                  index === 0
                    ? 'bg-yellow-200 text-yellow-800'
                    : index === 1
                    ? 'bg-gray-300 text-gray-700'
                    : index === 2
                    ? 'bg-orange-200 text-orange-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {entry.placement}
              </div>
              <div className="flex-shrink-0 w-12 h-8 overflow-hidden rounded bg-gray-100">
                <img
                  src={entry.car.imageUrl}
                  alt={entry.car.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {entry.car.year} {entry.car.brand} {entry.car.name}
                </div>
              </div>
              {index === 0 && <span className="text-xl">🏆</span>}
              {index === 1 && <span className="text-xl">🥈</span>}
              {index === 2 && <span className="text-xl">🥉</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
