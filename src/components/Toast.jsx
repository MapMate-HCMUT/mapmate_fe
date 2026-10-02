import { Icon } from './Icon';

const TONE_CLASSES = {
  success: 'bg-neutral-900 text-white',
  info: 'bg-info-600 text-white',
  warning: 'bg-warning-600 text-white',
  danger: 'bg-danger-600 text-white',
};

const TONE_EMOJI = { success: '✅', info: 'ℹ️', warning: '⚠️', danger: '⛔' };

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-24 lg:bottom-auto lg:top-20 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <div
        key={toast.id}
        role="status"
        className={`${TONE_CLASSES[toast.tone]} pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-button shadow-modal text-sm font-medium animate-[toast-in_200ms_ease-out]`}
      >
        <span aria-hidden="true">{TONE_EMOJI[toast.tone]}</span>
        <p className="flex-1">{toast.message}</p>
        <button type="button" onClick={onClose} aria-label="Đóng thông báo" className="opacity-70 hover:opacity-100">
          <Icon name="close" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
