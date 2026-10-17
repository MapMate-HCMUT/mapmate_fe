import { useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { reportPlaceStatusApi, undoPlaceReportApi } from '../api/placesApi';

// Báo cáo chỉ là phiếu của người dùng — MapMate (admin) kiểm tra rồi mới ẩn quán, không tự ẩn
const THANKS = { open: 'Cảm ơn bạn đã xác nhận nơi này vẫn mở' };
const THANKS_ISSUE = 'Cảm ơn bạn! MapMate sẽ kiểm tra lại nơi này';

// Báo lỗi (đóng cửa / sai giờ / giá / vị trí / khác + mô tả tự gõ), xác nhận "vẫn mở", sửa hoặc hoàn tác báo cáo của mình.
// Server đếm lại phiếu đóng / mở và trả về status mới.
export const usePlaceReport = (place) => {
  const [state, setState] = useState({ status: place.status ?? 'active', myReport: place.my_report ?? null, myNote: place.my_report_note ?? '' });
  const [isSending, setIsSending] = useState(false);
  const { showToast } = useToast();
  const requireAuth = useRequireAuth();

  const send = async (request) => {
    setIsSending(true);
    try {
      const data = await request();
      setState({ status: data.status, myReport: data.my_report, myNote: data.my_report_note ?? '' });
      return data;
    } catch (error) {
      showToast(error.message, 'danger');
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const undo = () => send(() => undoPlaceReportApi(place.id)); // gỡ xong nhãn tự đổi lại => không cần toast

  // Trả true khi gửi xong (khung báo lỗi tự đóng)
  const report = requireAuth(async (type, note = '') => {
    if (isSending || (state.myReport === type && state.myNote === note)) return true;
    const data = await send(() => reportPlaceStatusApi(place.id, type, note));
    if (data) showToast(THANKS[type] ?? THANKS_ISSUE, 'success', { action: { label: 'Hoàn tác', onClick: undo } });
    return Boolean(data);
  });

  return { ...state, isSending, report, undo };
};
