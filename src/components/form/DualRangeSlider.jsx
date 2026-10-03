// Thanh trượt 2 đầu (khoảng min–max): 2 input range chồng lên nhau, chỉ phần núm nhận thao tác (xem .dual-range trong index.css).
export const DualRangeSlider = ({ min, max, step, value, onChange, ariaLabel }) => {
  const [low, high] = value;
  const percent = (amount) => ((amount - min) / (max - min)) * 100;

  return (
    <div className="relative h-6" role="group" aria-label={ariaLabel}>
      <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1.5 rounded-pill bg-neutral-200" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-pill bg-primary-500"
        style={{ left: `${percent(low)}%`, right: `${100 - percent(high)}%` }}
      />
      <input
        type="range"
        className="dual-range"
        min={min}
        max={max}
        step={step}
        value={low}
        aria-label="Giá thấp nhất"
        onChange={(event) => onChange([Math.min(Number(event.target.value), high - step), high])}
      />
      <input
        type="range"
        className="dual-range"
        min={min}
        max={max}
        step={step}
        value={high}
        aria-label="Giá cao nhất"
        onChange={(event) => onChange([low, Math.max(Number(event.target.value), low + step)])}
      />
    </div>
  );
};
