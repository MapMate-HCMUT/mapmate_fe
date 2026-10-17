import { useRef, useState } from 'react';
import { LocateFixed, SendHorizontal } from 'lucide-react';
import { VoiceButton } from '../../../components/VoiceButton';

const isPlainKey = (event) => !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey && !event.nativeEvent.isComposing;

// Ô nhập: gõ tự do (Enter gửi, Shift+Enter xuống dòng), kèm điểm xuất phát dùng chung với trang Khám phá.
// ↑ / ↓ (khi con trỏ ở dòng đầu / dòng cuối) = gọi lại câu đã gửi như terminal — sửa chút rồi gửi, khỏi gõ lại cả câu.
export const PromptComposer = ({ onSend, isSending, maxLength, origin, isLocating, onLocate, history = [] }) => {
  const [text, setText] = useState('');
  // index = đang xem câu thứ mấy trong lịch sử (null = đang gõ câu mới); draft = câu đang gõ dở trước khi bấm ↑
  const [browse, setBrowse] = useState({ index: null, draft: '' });
  const inputRef = useRef(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setText('');
    setBrowse({ index: null, draft: '' });
    onSend(trimmed);
  };
  const recall = (step) => {
    const next = (browse.index ?? history.length) + step;
    if (!history.length || next < 0 || next > history.length) return false;
    if (next === history.length) {
      setText(browse.draft);
      setBrowse({ index: null, draft: '' });
    } else {
      setText(history[next]);
      setBrowse({ index: next, draft: browse.index == null ? text : browse.draft });
    }
    requestAnimationFrame(() => {
      const input = inputRef.current;
      input?.setSelectionRange(input.value.length, input.value.length); // con trỏ về cuối câu vừa gọi lại
    });
    return true;
  };
  const onKeyDown = (event) => {
    if (!isPlainKey(event)) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
      return;
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    const { selectionStart, selectionEnd, value } = event.currentTarget;
    const atEdge = event.key === 'ArrowUp' ? !value.slice(0, selectionStart).includes('\n') : !value.slice(selectionEnd).includes('\n');
    if (atEdge && recall(event.key === 'ArrowUp' ? -1 : 1)) event.preventDefault();
  };

  return (
    <div className="border-t border-neutral-200 bg-surface px-3 py-2.5 sm:px-4 sm:py-3 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-card border border-neutral-200 bg-neutral-50 p-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={maxLength}
            placeholder="VD: Tối nay 2 người đi hẹn hò ở Quận 1, khoảng 500k/người…"
            aria-label="Nhập yêu cầu cho MapMate AI"
            className="flex-1 resize-none bg-transparent px-1.5 py-1 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none min-h-[38px] max-h-32"
          />
          <VoiceButton className="h-9 w-9 shrink-0" onText={(spoken) => setText((current) => (current ? `${current} ${spoken}` : spoken).slice(0, maxLength))} />
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
          <span className="flex items-center gap-3">
            {history.length > 0 && <span className="hidden sm:inline">↑ ↓ gọi lại câu đã gửi</span>}
            <span className="tabular-nums">{text.length}/{maxLength}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
