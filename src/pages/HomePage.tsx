import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Toggle } from '../components/common/Toggle';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { useGame } from '../context/GameContext';

export function HomePage() {
  const navigate = useNavigate();
  const { state, setMode } = useGame();

  const handleModeToggle = (value: 'left' | 'right') => {
    setMode(value === 'left' ? 'tournament' : 'elo');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        rightContent={
          <Toggle
            leftLabel="Tournament"
            rightLabel="ELO"
            value={state.mode === 'tournament' ? 'left' : 'right'}
            onChange={handleModeToggle}
          />
        }
      />

      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center max-w-2xl">
          <span className="text-6xl mb-6 block">🏎️</span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            This or That
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover your favorite car by comparing legendary machines head-to-head.
            Pick your winner in each matchup to find your ultimate champion.
          </p>

          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Game Mode: {state.mode === 'tournament' ? 'Tournament' : 'ELO Rating'}
            </h2>

            {state.mode === 'tournament' ? (
              <p className="text-gray-600">
                Classic elimination bracket. Cars compete in rounds until one champion remains.
                Perfect for finding your absolute favorite through direct competition.
              </p>
            ) : (
              <p className="text-gray-600">
                Statistical ranking system. Compare cars across many matchups to build
                a complete ranking from favorite to least favorite.
              </p>
            )}
          </div>

          <Button size="lg" onClick={() => navigate('/setup')}>
            Start Game
          </Button>
        </div>
      </PageContainer>
    </div>
  );
}
