import { BRANDS } from '../../data/brands';
import type { BrandData, ModelData } from '../../types';

interface ModelSelectorProps {
  selectedBrands: string[];
  selectedModels: Record<string, string[]>;
  currentBrandIndex: number;
  onToggleModel: (brandId: string, modelId: string) => void;
  onSelectAll: (brandId: string) => void;
  onDeselectAll: (brandId: string) => void;
  onNextBrand: () => void;
  onPrevBrand: () => void;
  onFinish: () => void;
}

export function ModelSelector({
  selectedBrands,
  selectedModels,
  currentBrandIndex,
  onToggleModel,
  onSelectAll,
  onDeselectAll,
  onNextBrand,
  onPrevBrand,
  onFinish,
}: ModelSelectorProps) {
  const currentBrandId = selectedBrands[currentBrandIndex];
  const currentBrand = BRANDS.find((b: BrandData) => b.id === currentBrandId);

  if (!currentBrand) {
    return <div className="text-white p-6">Brand not found</div>;
  }

  const brandModelSelections = selectedModels[currentBrandId] || [];
  const isLastBrand = currentBrandIndex === selectedBrands.length - 1;
  const isFirstBrand = currentBrandIndex === 0;

  // Calculate total selected models across all brands
  const totalSelectedModels = Object.values(selectedModels).reduce(
    (sum, models) => sum + models.length,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">Select Models</h1>
          <div className="text-gray-400">
            Brand {currentBrandIndex + 1} of {selectedBrands.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentBrandIndex + 1) / selectedBrands.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current brand header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{currentBrand.name}</h2>
            <p className="text-gray-400">{currentBrand.country}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSelectAll(currentBrandId)}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Select All
            </button>
            <button
              onClick={() => onDeselectAll(currentBrandId)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Deselect All
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          Selected: {brandModelSelections.length} / {currentBrand.models.length} models
        </div>
      </div>

      {/* Model grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-24">
        {currentBrand.models.map((model: ModelData) => {
          const isSelected = brandModelSelections.includes(model.id);
          return (
            <button
              key={model.id}
              onClick={() => onToggleModel(currentBrandId, model.id)}
              className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                }
              `}
            >
              <div className="font-medium">{model.name}</div>
              <div className="text-sm text-gray-400">
                {model.yearStart}{model.yearEnd ? ` - ${model.yearEnd}` : ' - present'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={onPrevBrand}
            disabled={isFirstBrand}
            className={`
              px-4 py-2 rounded-lg font-semibold transition-all
              ${isFirstBrand
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-500'
              }
            `}
          >
            Previous Brand
          </button>

          <div className="text-gray-400 text-center">
            <div>Total: {totalSelectedModels} models selected</div>
          </div>

          {isLastBrand ? (
            <button
              onClick={onFinish}
              disabled={totalSelectedModels < 1}
              className={`
                px-6 py-2 rounded-lg font-semibold transition-all
                ${totalSelectedModels >= 1
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Continue to Images
            </button>
          ) : (
            <button
              onClick={onNextBrand}
              className="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Next Brand
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
