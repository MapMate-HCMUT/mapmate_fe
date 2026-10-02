import { Icon } from './Icon';

// Hộp thoại dùng chung. containerRef lấy từ useDisclosure() để bấm ra ngoài / Esc là đóng.
export const Modal = ({ isOpen, title, onClose, containerRef, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-0 sm:p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full sm:max-w-lg bg-surface rounded-t-card sm:rounded-card shadow-modal p-6 sm:p-7 max-h-[92dvh] overflow-y-auto animate-[sheet-up_200ms_ease-out]"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="p-1.5 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
