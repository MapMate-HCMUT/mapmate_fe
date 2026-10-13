import { Star } from 'lucide-react';

// ★★★★☆ — số sao của 1 đánh giá
export const StarRow = ({ value, size = 'w-3.5 h-3.5' }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} sao`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} className={`${size} ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} aria-hidden="true" />
    ))}
  </span>
);
