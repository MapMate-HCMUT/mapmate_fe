import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { PLACE_REPORT_NOTE_MAX_LENGTH, REPORT_ISSUES } from '../utils/placeReports';

// Khung "Báo lỗi": chọn loại lỗi + tự gõ mô tả. Đang có báo cáo => mở sẵn nội dung cũ để sửa.
// onUndo: đang có báo cáo => nút "Hoàn tác báo cáo" ngay trong khung (không muốn báo quán này nữa)
export const PlaceReportModal = ({ place, initialType, initialNote, isSending, onSubmit, onUndo, onClose }) => {
  const [type, setType] = useState(initialType && initialType !== 'open' ? initialType : 'closed');
  const [note, setNote] = useState(initialNote ?? '');
  const issue = REPORT_ISSUES.find((item) => item.value === type);
  const missingNote = issue?.noteRequired && !note.trim();

  const submit = async (event) => {
    event.preventDefault();
    if (missingNote || isSending) return;
    if (await onSubmit(type, note.trim())) onClose();
  };

  return (
    <Modal isOpen title="Báo lỗi địa điểm" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-neutral-600">
          <span className="font-semibold text-neutral-900">{place.name}</span> — MapMate sẽ kiểm tra lại trước khi sửa thông tin hay ẩn quán.
        </p>
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-semibold text-neutral-800">Lỗi bạn gặp</legend>
          {REPORT_ISSUES.map((item) => (
            <label
              key={item.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-input border px-3 py-2 transition ${type === item.value ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 hover:bg-neutral-50'}`}
            >
              <input type="radio" name="issue" value={item.value} checked={type === item.value} onChange={() => setType(item.value)} className="mt-1 accent-primary-600" />
              <span>
                <span className="block text-sm font-medium text-neutral-900">{item.label}</span>
                <span className="block text-xs text-neutral-500">{item.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <label className="block">
          <span className="text-sm font-semibold text-neutral-800">Mô tả {issue?.noteRequired ? '' : <span className="font-normal text-neutral-500">(không bắt buộc)</span>}</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, PLACE_REPORT_NOTE_MAX_LENGTH))}
            rows={3}
            placeholder={issue?.hint}
            className="mt-1.5 w-full resize-none rounded-input border border-neutral-200 bg-surface px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <span className="block text-right text-xs text-neutral-400">{note.length}/{PLACE_REPORT_NOTE_MAX_LENGTH}</span>
        </label>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {initialType && (
            <button
              type="button"
              disabled={isSending}
              onClick={async () => {
                await onUndo();
                onClose();
              }}
              className="mr-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-button text-sm font-semibold text-danger-600 hover:bg-danger-50 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" /> Hoàn tác báo cáo
            </button>
          )}
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-button text-sm font-semibold text-neutral-600 hover:bg-neutral-100">Huỷ</button>
          <button type="submit" disabled={missingNote || isSending} className="px-4 py-2 rounded-button bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-neutral-200 disabled:text-neutral-400 transition">
            {isSending ? 'Đang gửi…' : initialType ? 'Cập nhật báo cáo' : 'Gửi báo cáo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
