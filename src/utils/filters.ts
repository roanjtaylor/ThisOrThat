import type { Car, FilterState } from '../types';

export const DECADES = [
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
];

export function getUniqueCountries(cars: Car[]): string[] {
  const countries = new Set(cars.map((car) => car.country));
  return Array.from(countries).sort();
}

export function getAvailableDecades(cars: Car[]): string[] {
  const decades = new Set(cars.map((car) => car.decade));
  return DECADES.filter((d) => decades.has(d));
}

export function filterCars(cars: Car[], filters: FilterState): Car[] {
  return cars.filter((car) => {
    const matchesDecade =
      filters.decades.length === 0 || filters.decades.includes(car.decade);
    const matchesCountry =
      filters.countries.length === 0 || filters.countries.includes(car.country);
    return matchesDecade && matchesCountry;
  });
}

export function getCarCounts(
  cars: Car[],
  filters: FilterState
): { decade: Record<string, number>; country: Record<string, number> } {
  const filtered = filterCars(cars, filters);

  const decadeCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};

  for (const car of filtered) {
    decadeCounts[car.decade] = (decadeCounts[car.decade] || 0) + 1;
    countryCounts[car.country] = (countryCounts[car.country] || 0) + 1;
  }

  return { decade: decadeCounts, country: countryCounts };
}
