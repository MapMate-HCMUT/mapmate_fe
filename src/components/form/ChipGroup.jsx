import { isValidElement } from 'react';

// Nhóm chip chọn 1 (value là 1 giá trị) hoặc chọn nhiều (value là mảng).
export const ChipGroup = ({ options, value, onChange, multiple = false, size = 'md', ariaLabel, getIcon }) => {
  const isActive = (option) => (multiple ? value.includes(option.value) : value === option.value);
  const toggle = (option) => {
    if (!multiple) return onChange(option.value);
    return onChange(isActive(option) ? value.filter((item) => item !== option.value) : [...value, option.value]);
  };
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const rawIcon = getIcon ? getIcon(option) : option.icon;

        let iconContent = null;
        if (isValidElement(rawIcon)) {
          iconContent = rawIcon;
        } else if (typeof rawIcon === 'function' || (typeof rawIcon === 'object' && rawIcon !== null && rawIcon.$$typeof)) {
          const IconComponent = rawIcon;
          iconContent = <IconComponent className={`${iconSizeClass} shrink-0`} aria-hidden="true" />;
        } else if (typeof rawIcon === 'string') {
          iconContent = <span className="shrink-0" aria-hidden="true">{rawIcon}</span>;
        } else if (option.emoji) {
          iconContent = <span className="shrink-0" aria-hidden="true">{option.emoji}</span>;
        }

        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={isActive(option)}
            onClick={() => toggle(option)}
            className={`${sizeClass} rounded-pill border font-medium whitespace-nowrap transition inline-flex items-center gap-1.5 ${
              isActive(option)
                ? 'bg-primary-600 border-primary-600 text-white shadow-xs'
                : 'bg-surface border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-700'
            }`}
          >
            {iconContent}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
