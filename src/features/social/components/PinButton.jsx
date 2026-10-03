import { usePinToggle } from '../hooks/usePinToggle';
import { getPinOption, PIN_OPTIONS } from '../utils/socialConfig';

// Nút ghim địa điểm: chọn "Đã đi" / "Muốn đi" hoặc bỏ ghim.
export const PinButton = ({ placeId, initialStatus }) => {
  const { status, menu, menuRef, choose } = usePinToggle(placeId, initialStatus);
  const current = getPinOption(status);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={menu.toggle}
        aria-haspopup="menu"
        aria-expanded={menu.isOpen}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold transition ${
          current ? 'bg-accent-100 text-accent-800 hover:bg-accent-200' : 'text-neutral-600 hover:bg-neutral-100'
        }`}
      >
        <span aria-hidden="true">{current ? current.emoji : '📌'}</span>
        {current ? current.label : 'Ghim'}
      </button>
      {menu.isOpen && (
        <div role="menu" className="absolute left-0 top-full mt-1 w-40 bg-surface rounded-card shadow-modal border border-neutral-100 p-1 z-30">
          {PIN_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={status === option.value}
              onClick={() => choose(option.value)}
              className={`w-full text-left px-3 py-2 rounded-input text-sm transition ${status === option.value ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-100'}`}
            >
              {option.emoji} {option.label}
            </button>
          ))}
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
