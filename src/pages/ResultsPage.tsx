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

  // Redirect to home if no game is complete
  useEffect(() => {
    if (!state.isGameComplete) {
      navigate('/');
    }
  }, [state.isGameComplete, navigate]);

  const handlePlayAgain = () => {
    resetGame();
    navigate('/');
  };

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

function BracketVisualization({
  bracket,
}: {
  bracket: TournamentBracket;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-max p-4">
        {bracket.rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-gray-500 text-center">
              {roundIndex === bracket.totalRounds - 1
                ? 'Final'
                : roundIndex === bracket.totalRounds - 2
                ? 'Semifinal'
                : `Round ${roundIndex + 1}`}
            </h3>
            <div
              className="flex flex-col gap-4"
              style={{
                marginTop: `${Math.pow(2, roundIndex) * 20}px`,
                gap: `${Math.pow(2, roundIndex + 1) * 20}px`,
              }}
            >
              {round.map((match) => (
                <div
                  key={match.id}
                  className="bg-gray-50 rounded-lg p-2 min-w-[180px]"
                >
                  <MatchSlot
                    car={match.car1}
                    isWinner={match.winner?.id === match.car1?.id}
                  />
                  <div className="border-t my-1" />
                  <MatchSlot
                    car={match.car2}
                    isWinner={match.winner?.id === match.car2?.id}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchSlot({
  car,
  isWinner,
}: {
  car: Car | null;
  isWinner: boolean;
}) {
  if (!car) {
    return (
      <div className="text-sm text-gray-400 py-1 px-2">
        TBD
      </div>
    );
  }

  return (
    <div
      className={`text-sm py-1 px-2 rounded ${
        isWinner
          ? 'bg-green-100 text-green-800 font-medium'
          : 'text-gray-700'
      }`}
    >
      {car.year} {car.brand} {car.name.slice(0, 15)}
      {car.name.length > 15 ? '...' : ''}
    </div>
  );
}
