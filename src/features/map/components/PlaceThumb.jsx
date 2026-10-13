import { useState } from 'react';
import { getCategory } from '../utils/placeCategory';
import { getPlaceImageUrl } from '../utils/placeImage';

const SIZES = {
  sm: 'w-14 h-14',
  md: 'w-16 h-16 sm:w-20 sm:h-20',
  wide: 'w-full h-28',
  cover: 'absolute inset-0 w-full h-full', // ảnh phủ kín khung ngoài (khung quyết định kích thước)
};

const TEXT_SIZES = {
  sm: 'text-2xl',
  md: 'text-3xl',
  wide: 'text-4xl',
  cover: 'text-6xl',
};

// Ảnh bìa nằm sát mép thẻ => không bo góc / viền riêng
const FRAME = { cover: '' };
const DEFAULT_FRAME = 'rounded-button shadow-sm border border-neutral-200/60';

/**
 * Component hiển thị ảnh preview địa điểm
 * - Tự động tải ảnh thật độ nét cao (Tầng 1 & Tầng 2)
 * - Tự động fallback về icon danh mục nếu ảnh lỗi hoặc không có mạng (Tầng 3)
 */
export const PlaceThumb = ({ place, category, size = 'sm' }) => {
  const [hasError, setHasError] = useState(false);
  const effectiveCategory = category ?? place?.category;
  const { tile, emoji } = getCategory(effectiveCategory);

  const imageUrl = !hasError ? getPlaceImageUrl(place ?? (category ? { category } : null), { large: size === 'cover' }) : null;

  if (imageUrl) {
    return (
      <div className={`${size === 'cover' ? '' : 'relative'} ${SIZES[size]} ${FRAME[size] ?? DEFAULT_FRAME} overflow-hidden shrink-0 bg-neutral-100`}>
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
    <div className={`${tile} ${SIZES[size]} ${TEXT_SIZES[size]} ${size === 'cover' ? '' : 'rounded-button border border-black/5'} flex items-center justify-center shrink-0`} aria-hidden="true">
      {emoji}
    </div>
  );
};
