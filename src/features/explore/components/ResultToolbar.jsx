import { Icon } from '../../../components/Icon';

export const ResultToolbar = ({ total, isLoading, keyword, sort, sortOptions, onSortChange, activeCount, onOpenFilters }) => (
  <div className="flex flex-wrap items-center gap-2 mb-3">
    <p className="flex-1 min-w-40 text-sm text-neutral-600">
      {isLoading ? 'Đang tìm…' : <><b className="text-neutral-900">{total}</b> địa điểm phù hợp</>}
      {keyword && <> cho “<b className="text-neutral-900">{keyword}</b>”</>}
    </p>
    <button type="button" onClick={onOpenFilters} className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-button bg-surface shadow-card text-sm font-semibold text-neutral-700">
      <Icon name="search" className="w-4 h-4" />
      Bộ lọc{activeCount > 0 && <span className="px-1.5 rounded-pill bg-primary-600 text-white text-[11px]">{activeCount}</span>}
    </button>
    <select
      value={sort}
      onChange={(event) => onSortChange(event.target.value)}
      aria-label="Sắp xếp"
      className="py-2 px-3 bg-surface shadow-card rounded-button text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);
