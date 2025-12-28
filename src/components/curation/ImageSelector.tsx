import { useState } from 'react';
import { BRANDS } from '../../data/brands';
import type { BrandData, ModelData } from '../../types';

interface ImageSelectorProps {
  selectedBrands: string[];
  selectedModels: Record<string, string[]>;
  imageSelections: Record<string, string>;
  onSaveImage: (modelKey: string, imageUrl: string) => void;
  onSkipModel: (modelKey: string) => void;
  onFinish: () => void;
  onBack: () => void;
}

interface FlatModel {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  yearStart: number;
  yearEnd?: number;
  country: string;
  key: string;
}

export function ImageSelector({
  selectedBrands,
  selectedModels,
  imageSelections,
  onSaveImage,
  onSkipModel,
  onFinish,
  onBack,
}: ImageSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);

  // Build flat list of all selected models
  const flatModels: FlatModel[] = [];
  for (const brandId of selectedBrands) {
    const brand = BRANDS.find((b: BrandData) => b.id === brandId);
    if (!brand) continue;

    const modelIds = selectedModels[brandId] || [];
    for (const modelId of modelIds) {
      const model = brand.models.find((m: ModelData) => m.id === modelId);
      if (!model) continue;

      flatModels.push({
        brandId: brand.id,
        brandName: brand.name,
        modelId: model.id,
        modelName: model.name,
        yearStart: model.yearStart,
        yearEnd: model.yearEnd,
        country: brand.country,
        key: `${brand.id}-${model.id}`,
      });
    }
  }

  const currentModel = flatModels[currentIndex];
  const totalModels = flatModels.length;
  const completedCount = Object.keys(imageSelections).length;

  // Generate Google Images search URL
  const getSearchUrl = (model: FlatModel) => {
    const query = encodeURIComponent(
      `${model.brandName} ${model.modelName} ${model.yearStart} car`
    );
    return `https://www.google.com/search?q=${query}&tbm=isch`;
  };

  const handleSave = () => {
    if (imageUrl.trim()) {
      onSaveImage(currentModel.key, imageUrl.trim());
      setImageUrl('');
      setImageError(false);
      if (currentIndex < totalModels - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleSkip = () => {
    onSkipModel(currentModel.key);
    setImageUrl('');
    setImageError(false);
    if (currentIndex < totalModels - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setImageUrl('');
      setImageError(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalModels - 1) {
      setCurrentIndex(currentIndex + 1);
      setImageUrl('');
      setImageError(false);
    }
  };

  // Check if current model already has an image
  const existingImage = currentModel ? imageSelections[currentModel.key] : null;

  if (!currentModel) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">No models selected</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">Select Images</h1>
          <div className="text-gray-400">
            {currentIndex + 1} of {totalModels} | {completedCount} completed
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / totalModels) * 100}%` }}
          />
        </div>
      </div>

      {/* Current model info */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-1">
          {currentModel.brandName} {currentModel.modelName}
        </h2>
        <p className="text-gray-400">
          {currentModel.yearStart}{currentModel.yearEnd ? ` - ${currentModel.yearEnd}` : ' - present'}
          {' '}&middot;{' '}{currentModel.country}
        </p>

        {/* Google Images search button */}
        <a
          href={getSearchUrl(currentModel)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.53 20.47l-3.66-3.66A8.95 8.95 0 0019 12a9 9 0 10-9 9 8.95 8.95 0 004.81-1.13l3.66 3.66a.75.75 0 001.06-1.06zM4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
          </svg>
          Search Google Images
        </a>
      </div>

      {/* Image URL input */}
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Paste Image URL:</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setImageError(false);
          }}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Image preview */}
      {(imageUrl || existingImage) && (
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Preview:</label>
          <div className="bg-gray-800 rounded-lg p-4">
            {imageError ? (
              <div className="aspect-video flex items-center justify-center bg-gray-700 rounded text-gray-400">
                Failed to load image. Check the URL.
              </div>
            ) : (
              <img
                src={imageUrl || existingImage || ''}
                alt={`${currentModel.brandName} ${currentModel.modelName}`}
                className="w-full aspect-video object-cover rounded"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* Existing image indicator */}
      {existingImage && !imageUrl && (
        <div className="mb-6 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-400">
          This model already has an image selected. Enter a new URL to replace it.
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mb-24">
        <button
          onClick={handleSave}
          disabled={!imageUrl.trim() || imageError}
          className={`
            flex-1 py-3 rounded-lg font-semibold transition-all
            ${imageUrl.trim() && !imageError
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Save & Next
        </button>
        <button
          onClick={handleSkip}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
        >
          Skip
        </button>
      </div>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Back to Models
            </button>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`
                px-4 py-2 rounded transition-all
                ${currentIndex === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-500'
                }
              `}
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalModels - 1}
              className={`
                px-4 py-2 rounded transition-all
                ${currentIndex === totalModels - 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-500'
                }
              `}
            >
              Next
            </button>
          </div>

          <button
            onClick={onFinish}
            disabled={completedCount < 1}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all
              ${completedCount >= 1
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Export {completedCount} Cars
          </button>
        </div>
      </div>
    </div>
  );
}
