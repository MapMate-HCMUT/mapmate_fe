import { useCallback, useState } from 'react';

const STORAGE_PREFIX = 'mapmate.hint.';

const wasDismissed = (key) => {
  try {
    return localStorage.getItem(STORAGE_PREFIX + key) === 'seen';
  } catch {
    return false;
  }
};

// Lời nhắc hiện 1 lần cho tính năng khó đoán (VD nút "Vị trí của tôi"): bấm "Đã hiểu" hoặc dùng thử là thôi hiện.
export const useFeatureHint = (key) => {
  const [isVisible, setIsVisible] = useState(() => !wasDismissed(key));
  const dismiss = useCallback(() => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_PREFIX + key, 'seen');
    } catch {
      // trình duyệt chặn lưu trữ => lần sau vẫn hiện lại, không sao
    }
  }, [key]);
  return { isVisible, dismiss };
};
