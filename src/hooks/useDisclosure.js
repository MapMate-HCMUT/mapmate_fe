import { useCallback, useEffect, useRef, useState } from 'react';

// Trạng thái mở/đóng cho Modal, Dropdown. Tự đóng khi nhấn Esc hoặc bấm ra ngoài `containerRef`.
export const useDisclosure = (initial = false) => {
  const [isOpen, setIsOpen] = useState(initial);
  const containerRef = useRef(null);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setIsOpen(false);
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isOpen]);

  return { isOpen, open, close, toggle, containerRef };
};
