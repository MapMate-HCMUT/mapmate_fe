import { Icon } from '../../../components/Icon';

const fabClass =
  'relative w-11 h-11 bg-surface rounded-pill shadow-card-hover flex items-center justify-center text-lg hover:bg-surface-hover transition';

// Bộ nút lọc nhanh (FABs) bên phải bản đồ — thao tác một tay trên điện thoại.
export const MapQuickActions = ({ filters, openKey, onToggle, onSelectOption, onLocate, isLocating }) => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
    {filters.map((filter) => (
      <div key={filter.key} className="relative">
        <button
          type="button"
          onClick={() => onToggle(filter.key)}
          title={filter.title}
          aria-label={filter.title}
          aria-expanded={openKey === filter.key}
          className={`${fabClass} ${openKey === filter.key ? 'ring-2 ring-primary-500' : ''}`}
        >
          <span aria-hidden="true">{filter.emoji}</span>
          {filter.badge && (
            <span className="absolute -top-1 -left-2 px-1.5 py-px rounded-pill bg-primary-600 text-white text-[10px] font-bold shadow-card">
              {filter.badge}
            </span>
          )}
        </button>

        {openKey === filter.key && (
          <div className="absolute right-14 top-0 w-44 bg-surface rounded-card shadow-modal p-1.5" role="menu">
            <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              {filter.title}
            </p>
            {filter.options.map((option) => (
              <button
                key={String(option.value)}
                type="button"
                role="menuitemradio"
                aria-checked={option.value === filter.value}
                onClick={() => onSelectOption(filter, option.value)}
                className={`w-full text-left px-2.5 py-2 rounded-input text-sm transition ${
                  option.value === filter.value
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    ))}

    <button type="button" onClick={onLocate} title="Vị trí của tôi" aria-label="Vị trí của tôi" className={fabClass}>
      <Icon name="locate" className={`w-5 h-5 text-info-600 ${isLocating ? 'animate-spin' : ''}`} />
    </button>
  </div>
);
