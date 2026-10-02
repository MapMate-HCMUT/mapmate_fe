import { getCategory } from '../utils/placeCategory';

const SIZES = { sm: 'w-14 h-14 text-2xl', md: 'w-20 h-20 text-3xl', wide: 'w-full h-24 text-4xl' };

export const PlaceThumb = ({ category, size = 'sm' }) => {
  const { tile, emoji } = getCategory(category);
  return (
    <div className={`${tile} ${SIZES[size]} rounded-button flex items-center justify-center shrink-0`} aria-hidden="true">
      {emoji}
    </div>
  );
};
