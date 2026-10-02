const STARS = [1, 2, 3, 4, 5];

// Hiển thị số sao; truyền onChange để cho phép chọn (bấm lại sao đang chọn = bỏ đánh giá).
export const StarRating = ({ value, onChange, size = 'text-base' }) => (
  <span className={`inline-flex ${size}`} role={onChange ? 'radiogroup' : 'img'} aria-label={value ? `${value} trên 5 sao` : 'Chưa đánh giá'}>
    {STARS.map((star) => {
      const filled = value >= star;
      const className = filled ? 'text-accent-500' : 'text-neutral-300';
      return onChange ? (
        <button key={star} type="button" role="radio" aria-checked={value === star} aria-label={`${star} sao`} onClick={() => onChange(value === star ? null : star)} className={`${className} px-0.5 hover:scale-110 transition-transform`}>
          ★
        </button>
      ) : (
        <span key={star} className={className} aria-hidden="true">★</span>
      );
    })}
  </span>
);
