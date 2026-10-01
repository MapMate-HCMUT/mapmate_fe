import { CATEGORY_FILTERS } from '../utils/placeCategory';

export const CategoryChips = ({ value, onChange, className = '' }) => (
  <div className={`flex gap-2 overflow-x-auto scrollbar-none ${className}`} role="tablist" aria-label="Loại địa điểm">
    {CATEGORY_FILTERS.map((item) => {
      const isActive = item.value === value;
      return (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(item.value)}
          className={`shrink-0 px-3.5 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap border transition ${
            isActive
              ? 'bg-primary-600 border-primary-600 text-white shadow-card'
              : 'bg-surface border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-700'
          }`}
        >
          <span className="mr-1" aria-hidden="true">{item.emoji}</span>
          {item.label}
        </button>
      );
    })}
  </div>
);
