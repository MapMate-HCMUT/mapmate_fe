import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

// Hộp thoại dùng chung: bấm ra ngoài khung (vùng nền mờ) hoặc nhấn Esc là đóng.
// containerRef (tuỳ chọn) lấy từ useDisclosure() — hộp thoại vẫn tự đóng được khi không truyền.
const SIZES = { md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

export const Modal = ({ isOpen, title, onClose, containerRef, children, size = 'md' }) => {
  const onCloseRef = useRef(onClose);
  const pressedOnBackdropRef = useRef(false);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onCloseRef.current?.();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Chỉ đóng khi nhấn VÀ thả chuột đều ở vùng nền (kéo bôi đen chữ trong khung rồi thả ra ngoài thì không đóng)
  const isBackdrop = (event) => event.target === event.currentTarget;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-sm p-0 sm:p-4"
      onPointerDown={(event) => {
        pressedOnBackdropRef.current = isBackdrop(event);
      }}
      onClick={(event) => {
        if (pressedOnBackdropRef.current && isBackdrop(event)) onClose?.();
        pressedOnBackdropRef.current = false;
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${SIZES[size]} bg-surface rounded-t-card sm:rounded-card shadow-modal p-6 sm:p-7 max-h-[92dvh] overflow-y-auto animate-[sheet-up_200ms_ease-out]`}
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
