// Nút − số + cho các giá trị đếm nhỏ (số người...).
export const Stepper = ({ value, min, max, onChange, ariaLabel, suffix = '' }) => {
  const buttonClass = 'w-8 h-8 rounded-pill border border-neutral-200 text-neutral-700 font-bold hover:border-primary-400 hover:text-primary-700 disabled:opacity-40 disabled:hover:border-neutral-200 transition';
  return (
    <div className="inline-flex items-center gap-2.5" role="group" aria-label={ariaLabel}>
      <button type="button" className={buttonClass} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Giảm">−</button>
      <span className="min-w-14 text-center text-sm font-semibold text-neutral-800" aria-live="polite">
        {value}{suffix}
      </span>
      <button type="button" className={buttonClass} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Tăng">+</button>
    </div>
  );
};
