import { Flag, Pencil, RotateCcw, TriangleAlert } from 'lucide-react';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { usePlaceReport } from '../hooks/usePlaceReport';
import { REPORT_LABELS } from '../utils/placeReports';
import { PlaceReportModal } from './PlaceReportModal';

const linkButton = 'font-semibold hover:underline disabled:opacity-50';
const pillButton = 'inline-flex items-center gap-1 rounded-pill border border-neutral-300 bg-surface px-2 py-0.5 font-semibold text-neutral-700 hover:border-primary-300 hover:text-primary-700 disabled:opacity-50 transition';

// Báo lỗi 1 địa điểm (đã đóng cửa, sai giờ / giá / vị trí, lỗi khác — tự gõ mô tả), sửa hoặc hoàn tác báo cáo của mình.
// Báo cáo chỉ là phiếu: MapMate (admin) kiểm tra rồi mới sửa thông tin / ẩn quán.
// inline: trạng thái bình thường chỉ là 1 link nhỏ nằm chung hàng với nhãn (thẻ gọn hơn); cảnh báo vẫn là 1 dòng riêng.
export const PlaceStatusReport = ({ place, inline = false }) => {
  const { status, myReport, myNote, isSending, report, undo } = usePlaceReport(place);
  const { isOpen, open, close } = useDisclosure();
  const row = `${inline ? 'basis-full' : 'mt-2'} flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]`;

  const mine = myReport && (
    <>
      <span className="text-neutral-500" title={myNote || undefined}>Bạn đã báo: {REPORT_LABELS[myReport] ?? myReport}</span>
      {myReport !== 'open' && (
        <button type="button" disabled={isSending} onClick={open} className={pillButton}>
          <Pencil className="w-3 h-3" aria-hidden="true" /> Sửa
        </button>
      )}
      <button type="button" disabled={isSending} onClick={undo} className={pillButton}>
        <RotateCcw className="w-3 h-3" aria-hidden="true" /> Hoàn tác báo cáo
      </button>
    </>
  );
  const modal = isOpen && <PlaceReportModal place={place} initialType={myReport} initialNote={myNote} isSending={isSending} onSubmit={report} onUndo={undo} onClose={close} />;

  if (status === 'closed') {
    return (
      <div className={row}>
        <span className="font-semibold text-danger-600">Nơi này đã đóng cửa — sẽ không còn hiện trong kết quả.</span>
        {mine}
        {modal}
      </div>
    );
  }

  if (status === 'maybe_closed') {
    return (
      <div className={`${row} rounded-button bg-warning-50 px-2.5 py-1.5 text-warning-700`}>
        <TriangleAlert className="w-3.5 h-3.5 shrink-0" />
        <span>Có người báo nơi này đã đóng cửa.</span>
        {mine || (
          <>
            <button type="button" disabled={isSending} onClick={() => report('open')} className={`${linkButton} text-primary-700`}>Vẫn mở cửa</button>
            <button type="button" disabled={isSending} onClick={() => report('closed')} className={`${linkButton} text-danger-600`}>Đúng, đã đóng</button>
            <button type="button" disabled={isSending} onClick={open} className={`${linkButton} text-neutral-500`}>Báo lỗi khác</button>
          </>
        )}
        {modal}
      </div>
    );
  }

  if (myReport) {
    return (
      <div className={row}>
        {mine}
        {modal}
      </div>
    );
  }

  return (
    <div className={`${inline ? 'ml-auto' : 'mt-2'} text-[11px] text-neutral-400`}>
      <button type="button" disabled={isSending} onClick={open} className={`${linkButton} inline-flex items-center gap-1 text-neutral-400 hover:text-danger-600`}>
        <Flag className="w-3 h-3" aria-hidden="true" /> Báo lỗi
      </button>
      {modal}
    </div>
  );
};
