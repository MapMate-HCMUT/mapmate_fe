import { useState } from 'react';
import { getCategory } from '../utils/placeCategory';
import { getPlaceImageUrl } from '../utils/placeImage';

const SIZES = {
  sm: 'w-14 h-14',
  md: 'w-16 h-16 sm:w-20 sm:h-20',
  wide: 'w-full h-28',
};

const TEXT_SIZES = {
  sm: 'text-2xl',
  md: 'text-3xl',
  wide: 'text-4xl',
};

/**
 * Component hiển thị ảnh preview địa điểm
 * - Tự động tải ảnh thật độ nét cao (Tầng 1 & Tầng 2)
 * - Tự động fallback về icon danh mục nếu ảnh lỗi hoặc không có mạng (Tầng 3)
 */
export const PlaceThumb = ({ place, category, size = 'sm' }) => {
  const [hasError, setHasError] = useState(false);
  const effectiveCategory = category ?? place?.category;
  const { tile, emoji } = getCategory(effectiveCategory);

  const imageUrl = !hasError ? getPlaceImageUrl(place ?? (category ? { category } : null)) : null;

  if (imageUrl) {
    return (
      <div className={`relative ${SIZES[size]} rounded-button overflow-hidden shrink-0 shadow-sm bg-neutral-100 border border-neutral-200/60`}>
        <img
          src={imageUrl}
          alt={place?.name ?? 'Địa điểm'}
          onError={() => setHasError(true)}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className={`${tile} ${SIZES[size]} ${TEXT_SIZES[size]} rounded-button flex items-center justify-center shrink-0 border border-black/5`} aria-hidden="true">
      {emoji}
    </div>
  );
};
