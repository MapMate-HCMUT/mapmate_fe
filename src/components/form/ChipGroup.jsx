// Nhóm chip chọn 1 (value là 1 giá trị) hoặc chọn nhiều (value là mảng).
export const ChipGroup = ({ options, value, onChange, multiple = false, size = 'md', ariaLabel }) => {
  const isActive = (option) => (multiple ? value.includes(option.value) : value === option.value);
  const toggle = (option) => {
    if (!multiple) return onChange(option.value);
    return onChange(isActive(option) ? value.filter((item) => item !== option.value) : [...value, option.value]);
  };
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          aria-pressed={isActive(option)}
          onClick={() => toggle(option)}
          className={`${sizeClass} rounded-pill border font-medium whitespace-nowrap transition ${
            isActive(option)
              ? 'bg-primary-600 border-primary-600 text-white'
              : 'bg-surface border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-700'
          }`}
        >
          {option.emoji && <span className="mr-1" aria-hidden="true">{option.emoji}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
};
