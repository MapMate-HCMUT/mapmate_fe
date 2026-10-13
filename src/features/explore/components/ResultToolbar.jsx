import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { SearchBar } from '../../../components/SearchBar';
import { useSearchStore } from '../../../stores/searchStore';

// Đầu danh sách địa điểm: ô tìm kiếm · nút Bộ lọc (mở hộp thoại) · sắp xếp, dòng dưới là số kết quả.
export const ResultToolbar = ({ total, isLoading, keyword, searchRadiusKm, sort, sortOptions, onSortChange, activeCount, onOpenFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { query, setQuery, clearQuery } = useSearchStore();

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
    <div className="mb-3 space-y-2.5">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <div className="w-full sm:flex-1 min-w-0">
          <SearchBar value={query} onChange={setQuery} onClear={clearQuery} placeholder="Tìm quán, món ăn, địa điểm…" variant="floating" />
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          aria-haspopup="dialog"
          className={`shrink-0 inline-flex items-center gap-1.5 h-10.5 px-3.5 rounded-pill border text-sm font-semibold transition ${
            activeCount > 0 ? 'border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100' : 'border-neutral-200 bg-surface text-neutral-700 hover:bg-neutral-50 shadow-card'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Bộ lọc
          {activeCount > 0 && <span className="min-w-5 px-1.5 rounded-pill bg-primary-600 text-white text-[11px] leading-5 text-center">{activeCount}</span>}
        </button>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="inline-flex items-center gap-2 h-10.5 px-3.5 bg-surface hover:bg-neutral-50 border border-neutral-200 rounded-pill shadow-card text-sm font-semibold text-neutral-700 transition"
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

      <p className="text-sm text-neutral-600">
        {isLoading ? 'Đang tìm…' : <><b className="text-neutral-900">{total}</b> địa điểm phù hợp</>}
        {keyword && <> cho “<b className="text-neutral-900">{keyword}</b>”</>}
        {keyword && searchRadiusKm && <span className="text-neutral-400"> · tìm trong {searchRadiusKm} km</span>}
      </p>
    </div>
  );
};
