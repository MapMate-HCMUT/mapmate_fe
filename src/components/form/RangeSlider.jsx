// Thanh trượt 1 giá trị, có thể tắt (hiện mờ) khi lựa chọn không áp dụng.
export const RangeSlider = ({ min, max, step = 1, value, onChange, ariaLabel, disabled = false }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    disabled={disabled}
    onChange={(event) => onChange(Number(event.target.value))}
    aria-label={ariaLabel}
    className="w-full accent-primary-600 disabled:opacity-40"
  />
);
