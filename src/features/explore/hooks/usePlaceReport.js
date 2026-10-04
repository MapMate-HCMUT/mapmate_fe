import { useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { reportPlaceStatusApi } from '../api/placesApi';

const THANKS = {
  closed: 'Cảm ơn bạn! Khi đủ người xác nhận, nơi này sẽ được ẩn khỏi kết quả',
  open: 'Cảm ơn bạn đã xác nhận nơi này vẫn mở',
};

// Báo quán "đã đóng cửa" / "vẫn mở". Server tính lại trạng thái theo số phiếu và trả về status mới.
export const usePlaceReport = (place) => {
  const [state, setState] = useState({ status: place.status ?? 'active', myReport: place.my_report ?? null });
  const [isSending, setIsSending] = useState(false);
  const { showToast } = useToast();
  const requireAuth = useRequireAuth();

  const report = requireAuth(async (type) => {
    if (isSending || state.myReport === type) return;
    setIsSending(true);
    try {
      const data = await reportPlaceStatusApi(place.id, type);
      setState({ status: data.status, myReport: data.my_report });
      showToast(data.status === 'closed' ? 'Đã xác nhận nơi này đóng cửa — cảm ơn bạn!' : THANKS[type]);
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setIsSending(false);
    }
  });

  return { ...state, isSending, report };
};
