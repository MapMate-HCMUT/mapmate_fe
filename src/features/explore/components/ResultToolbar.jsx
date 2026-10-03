import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { Icon } from '../../../components/Icon';

export const ResultToolbar = ({ total, isLoading, keyword, searchRadiusKm, sort, sortOptions, onSortChange, activeCount, onOpenFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentOption = sortOptions.find((opt) => opt.value === sort) ?? sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <p className="flex-1 min-w-40 text-sm text-neutral-600">
        {isLoading ? 'Đang tìm…' : <><b className="text-neutral-900">{total}</b> địa điểm phù hợp</>}
        {keyword && <> cho “<b className="text-neutral-900">{keyword}</b>”</>}
        {keyword && searchRadiusKm && <span className="text-neutral-400"> · tìm trong {searchRadiusKm} km</span>}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-button bg-surface shadow-card text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
        >
          <Icon name="search" className="w-4 h-4" />
          Bộ lọc{activeCount > 0 && <span className="px-1.5 rounded-pill bg-primary-600 text-white text-[11px]">{activeCount}</span>}
        </button>

        {/* Menu sắp xếp được thiết kế lại đẹp mắt, hiện đại */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="inline-flex items-center gap-2 py-1.5 px-3 bg-surface hover:bg-neutral-50 border border-neutral-200/90 rounded-lg shadow-xs text-xs sm:text-sm font-semibold text-neutral-700 transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span>{currentOption?.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-surface rounded-xl shadow-lg border border-neutral-200/80 py-1.5 z-30">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Sắp xếp theo
              </div>
              {sortOptions.map((option) => {
                const isSelected = option.value === sort;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSortChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-left transition ${
                      isSelected
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
