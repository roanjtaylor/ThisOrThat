import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { Toggle } from '../components/common/Toggle';
import { useGame } from '../context/GameContext';
import { filterCars, getAvailableDecades, getUniqueCountries } from '../utils/filters';
import { useCuratedCars } from '../hooks/useCuratedCars';
import type { FilterState } from '../types';

export function SetupPage() {
  const navigate = useNavigate();
  const { state, setMode, startGame } = useGame();
  const { cars, isLoading, error } = useCuratedCars();

  const [filters, setFilters] = useState<FilterState>({
    decades: [],
    countries: [],
  });

  const availableDecades = useMemo(() => getAvailableDecades(cars), [cars]);
  const availableCountries = useMemo(() => getUniqueCountries(cars), [cars]);

  const filteredCars = useMemo(
    () => filterCars(cars, filters),
    [cars, filters]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageContainer>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="text-4xl mb-4">Loading...</div>
              <p className="text-gray-600">Loading your curated cars...</p>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Error or no cars
  if (error || cars.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageContainer>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🚗</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Cars Available</h2>
              <p className="text-gray-600 mb-6">
                {error || 'No curated cars found. Visit /curate to add cars to your dataset.'}
              </p>
              <Button onClick={() => navigate('/curate')}>
                Go to Curation Tool
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  const toggleDecade = (decade: string) => {
    setFilters((prev) => ({
      ...prev,
      decades: prev.decades.includes(decade)
        ? prev.decades.filter((d) => d !== decade)
        : [...prev.decades, decade],
    }));
  };

  const toggleCountry = (country: string) => {
    setFilters((prev) => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter((c) => c !== country)
        : [...prev.countries, country],
    }));
  };

  const clearFilters = () => {
    setFilters({ decades: [], countries: [] });
  };

  const handleStart = () => {
    if (filteredCars.length >= 2) {
      startGame(filteredCars);
      navigate('/game');
    }
  };

  const handleModeToggle = (value: 'left' | 'right') => {
    setMode(value === 'left' ? 'tournament' : 'elo');
  };

  const canStart = filteredCars.length >= 2;

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

      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Select Your Cars
            </h1>
            <p className="text-gray-600">
              Filter by decade and country to customize your matchup pool
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Filter by Decade
              </h2>
              {(filters.decades.length > 0 || filters.countries.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableDecades.map((decade) => (
                <button
                  key={decade}
                  onClick={() => toggleDecade(decade)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filters.decades.includes(decade)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {decade}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Filter by Country
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableCountries.map((country) => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filters.countries.includes(country)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="mb-4">
              <span className="text-4xl font-bold text-blue-600">
                {filteredCars.length}
              </span>
              <span className="text-lg text-gray-600 ml-2">cars selected</span>
            </div>

            {!canStart && (
              <p className="text-red-500 mb-4">
                Select at least 2 cars to start the game
              </p>
            )}

            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleStart}
                disabled={!canStart}
              >
                Begin {state.mode === 'tournament' ? 'Tournament' : 'ELO'}
                {' '}({filteredCars.length} cars)
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
