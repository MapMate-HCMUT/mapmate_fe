import { useState } from 'react';
import { LocateFixed, SendHorizontal } from 'lucide-react';

// Ô nhập: gõ tự do (Enter gửi, Shift+Enter xuống dòng), kèm điểm xuất phát dùng chung với trang Khám phá.
export const PromptComposer = ({ onSend, isSending, maxLength, origin, isLocating, onLocate }) => {
  const [text, setText] = useState('');

  const submit = async () => {
    if (await onSend(text)) setText('');
  };
  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-neutral-200 bg-surface px-4 py-3 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-card border border-neutral-200 bg-neutral-50 p-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            maxLength={maxLength}
            placeholder="VD: Tối nay 2 người đi hẹn hò ở Quận 1, khoảng 500k/người…"
            aria-label="Nhập yêu cầu cho MapMate AI"
            className="flex-1 resize-none bg-transparent px-1.5 py-1 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={isSending || !text.trim()}
            aria-label="Gửi"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-button bg-primary-600 text-white hover:bg-primary-700 disabled:bg-neutral-200 disabled:text-neutral-400 transition"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-neutral-500">
          <button type="button" onClick={onLocate} disabled={isLocating} className="inline-flex min-w-0 items-center gap-1 hover:text-primary-700">
            <LocateFixed className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isLocating ? 'Đang lấy vị trí…' : origin.isDefault ? 'Dùng vị trí của tôi' : origin.label}</span>
          </button>
          <span className="tabular-nums">{text.length}/{maxLength}</span>
        </div>
      </div>
    </div>
  );
};
