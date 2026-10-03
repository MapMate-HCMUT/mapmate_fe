import { TriangleAlert } from 'lucide-react';
import { usePlaceReport } from '../hooks/usePlaceReport';

const linkButton = 'font-semibold hover:underline disabled:opacity-50';

// Dòng cuối thẻ địa điểm: cảnh báo "có thể đã đóng cửa" + cho người dùng báo / xác nhận.
export const PlaceStatusReport = ({ place }) => {
  const { status, myReport, isSending, report } = usePlaceReport(place);

  if (status === 'closed') {
    return <p className="mt-2 text-[11px] font-semibold text-danger-600">Nơi này đã đóng cửa — sẽ không còn hiện trong kết quả.</p>;
  }

  if (status === 'maybe_closed') {
    return (
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-button bg-warning-50 px-2.5 py-1.5 text-[11px] text-warning-700">
        <TriangleAlert className="w-3.5 h-3.5 shrink-0" />
        <span>Có người báo nơi này đã đóng cửa.</span>
        {myReport ? (
          <span className="text-neutral-500">Bạn đã báo: {myReport === 'closed' ? 'đã đóng' : 'vẫn mở'}</span>
        ) : (
          <>
            <button type="button" disabled={isSending} onClick={() => report('open')} className={`${linkButton} text-primary-700`}>Vẫn mở cửa</button>
            <button type="button" disabled={isSending} onClick={() => report('closed')} className={`${linkButton} text-danger-600`}>Đúng, đã đóng</button>
          </>
        )}
      </p>
    );
  }

  return (
    <p className="mt-2 text-[11px] text-neutral-400">
      {myReport === 'closed' ? (
        'Bạn đã báo nơi này đóng cửa — cảm ơn bạn!'
      ) : (
        <button type="button" disabled={isSending} onClick={() => report('closed')} className={`${linkButton} text-neutral-400 hover:text-danger-600`}>
          Nơi này đã đóng cửa?
        </button>
      )}
    </p>
  );
};
