import { useState } from 'react';
import type { Car } from '../../types';
import { CarCardModal } from './CarCardModal';

interface CarCardProps {
  car: Car;
  onClick?: () => void;
  isClickable?: boolean;
  showViewMore?: boolean;
}

export function CarCard({
  car,
  onClick,
  isClickable = true,
  showViewMore = true,
}: CarCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 ${
          isClickable
            ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]'
            : ''
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {!imageError ? (
            <img
              src={car.imageUrl}
              alt={`${car.year} ${car.brand} ${car.name}`}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white">
              <span className="text-5xl mb-2">🏎️</span>
              <span className="text-lg font-bold">{car.brand}</span>
              <span className="text-sm opacity-75">{car.name}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-xl font-bold text-white">
              {car.year} {car.brand} {car.name}
            </h3>
            <p className="text-sm text-gray-200">{car.country}</p>
          </div>
        </div>

        <div className="p-4">
          {car.stats ? (
            <div className="grid grid-cols-2 gap-3">
              <StatItem label="Horsepower" value={`${car.stats.horsepower} hp`} />
              <StatItem label="Top Speed" value={`${car.stats.topSpeedMph} mph`} />
              <StatItem label="0-60 mph" value={`${car.stats.zeroToSixty}s`} />
              <StatItem label="Weight" value={`${car.stats.weightLbs.toLocaleString()} lbs`} />
              <StatItem
                label="Engine"
                value={car.stats.engineDisplacementL > 0 ? `${car.stats.engineDisplacementL}L` : 'Electric'}
              />
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">{car.decade} {car.country}</p>
            </div>
          )}

          {showViewMore && car.stats && (
            <button
              onClick={handleViewMore}
              className="mt-4 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              View More Details
            </button>
          )}
        </div>
      </div>

      <CarCardModal
        car={car}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
