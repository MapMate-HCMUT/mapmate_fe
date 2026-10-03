import { Star } from 'lucide-react';

const STARS = [1, 2, 3, 4, 5];

// Hiển thị số sao; truyền onChange để cho phép chọn (bấm lại sao đang chọn = bỏ đánh giá).
export const StarRating = ({ value, onChange, size = 'w-4 h-4' }) => (
  <span className="inline-flex items-center gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={value ? `${value} trên 5 sao` : 'Chưa đánh giá'}>
    {STARS.map((star) => {
      const filled = value >= star;
      return onChange ? (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} sao`}
          onClick={() => onChange(value === star ? null : star)}
          className="p-0.5 hover:scale-110 transition-transform"
        >
          <Star className={`${size} ${filled ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} />
        </button>
      ) : (
        <Star key={star} className={`${size} ${filled ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} aria-hidden="true" />
      );
    })}
  </span>
);
