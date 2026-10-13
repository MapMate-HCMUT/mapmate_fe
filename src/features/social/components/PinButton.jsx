import { Bookmark } from 'lucide-react';
import { usePinToggle } from '../hooks/usePinToggle';
import { getPinOption, PIN_OPTIONS } from '../utils/socialConfig';

// Nút ghim địa điểm: chọn "Đã đi" / "Muốn đi" hoặc bỏ ghim.
// size: 'sm' (mặc định, thẻ nhỏ) | 'md' (thẻ địa điểm lớn ở Khám phá — cùng cỡ các nút bên cạnh)
const SIZE_CLASSES = { sm: 'px-3 py-1.5 text-xs', md: 'px-3 py-2 text-sm' };
const ICON_CLASSES = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4' };

export const PinButton = ({ placeId, initialStatus, size = 'sm' }) => {
  const { status, menu, menuRef, choose } = usePinToggle(placeId, initialStatus);
  const current = getPinOption(status);
  const CurrentIcon = current?.icon;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={menu.toggle}
        aria-haspopup="menu"
        aria-expanded={menu.isOpen}
        className={`inline-flex items-center gap-1.5 ${SIZE_CLASSES[size]} rounded-button font-semibold transition ${
          current ? 'bg-accent-100 text-accent-800 hover:bg-accent-200' : 'text-neutral-600 hover:bg-neutral-100'
        }`}
      >
        {CurrentIcon ? (
          <CurrentIcon className={`${ICON_CLASSES[size]} text-accent-700`} />
        ) : (
          <Bookmark className={`${ICON_CLASSES[size]} text-neutral-400`} />
        )}
        <span>{current ? current.label : 'Ghim'}</span>
      </button>
      {menu.isOpen && (
        <div role="menu" className="absolute left-0 top-full mt-1 w-40 bg-surface rounded-card shadow-modal border border-neutral-100 p-1 z-30">
          {PIN_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={status === option.value}
                onClick={() => choose(option.value)}
                className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-input text-sm transition ${
                  status === option.value ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {OptionIcon ? <OptionIcon className="w-4 h-4 shrink-0 text-primary-600" /> : option.emoji}
                <span>{option.label}</span>
              </button>
            );
          })}
          {current && (
            <button type="button" role="menuitem" onClick={() => choose(null)} className="w-full text-left px-3 py-2 rounded-input text-sm text-danger-600 hover:bg-danger-50">
              Bỏ ghim
            </button>
          )}
        </div>
      )}
    </div>
  );
};
