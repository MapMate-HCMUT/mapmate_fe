import { useState } from 'react';
import { ErrorPage } from '../components/ErrorPage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ERROR_KINDS } from '../utils/errorMessages';

// Mất mạng ở BẤT KỲ trang nào (kể cả trang không tải gì như Cảnh báo, hoặc đang chat với AI) => phủ trang
// "Không kết nối được tới MapMate". Trang bên dưới vẫn giữ nguyên (không mất cuộc trò chuyện / bản đồ),
// có mạng lại là tự ẩn.
export const OfflineGate = ({ children }) => {
  const { isOffline, recheck } = useNetworkStatus();
  const [retriedAt, setRetriedAt] = useState(null); // bấm "Thử lại" mà vẫn mất mạng => báo ngay trên trang
  const retry = () => setRetriedAt(recheck() ? null : new Date().toLocaleTimeString('vi-VN'));

  return (
    <>
      {children}
      {isOffline && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-neutral-50">
          <ErrorPage kind={ERROR_KINDS.OFFLINE} onRetry={retry} note={retriedAt && `Lúc ${retriedAt} thiết bị vẫn chưa có mạng — trang này tự đóng ngay khi có mạng lại.`} />
        </div>
      )}
    </>
  );
};
