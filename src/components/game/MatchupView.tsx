import type { Car } from '../../types';
import { CarCard } from './CarCard';

interface MatchupViewProps {
  car1: Car;
  car2: Car;
  onSelectWinner: (car: Car) => void;
}

export function MatchupView({ car1, car2, onSelectWinner }: MatchupViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col">
        <CarCard
          car={car1}
          onClick={() => onSelectWinner(car1)}
          isClickable={true}
        />
      </div>
      <div className="flex flex-col">
        <CarCard
          car={car2}
          onClick={() => onSelectWinner(car2)}
          isClickable={true}
        />
      </div>
    </div>
  );
}
