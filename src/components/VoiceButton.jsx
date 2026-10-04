import { Loader2, Mic, Square } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';

const LABELS = { idle: 'Nói để nhập (tiếng Việt / tiếng Anh)', recording: 'Đang nghe… bấm để dừng', transcribing: 'Đang nhận dạng giọng nói…' };
const STYLES = {
  idle: 'text-primary-500 hover:bg-primary-50',
  recording: 'bg-danger-500 text-white animate-pulse',
  transcribing: 'text-primary-500',
};

// Nút micro: bấm để nói, bấm lần nữa để dừng (tự dừng sau 20 giây). Trình duyệt không hỗ trợ ghi âm => ẩn.
export const VoiceButton = ({ onText, className = '' }) => {
  const voice = useVoiceInput({ onText });
  if (!voice.isSupported) return null;
  const VoiceIcon = voice.status === 'recording' ? Square : voice.status === 'transcribing' ? Loader2 : Mic;
  return (
    <button
      type="button"
      onClick={voice.toggle}
      disabled={voice.status === 'transcribing'}
      aria-label={LABELS[voice.status]}
      title={LABELS[voice.status]}
      aria-pressed={voice.status === 'recording'}
      className={`flex h-8 w-8 items-center justify-center rounded-pill transition ${STYLES[voice.status]} ${className}`}
    >
      <VoiceIcon className={`w-4 h-4 ${voice.status === 'transcribing' ? 'animate-spin' : ''}`} />
    </button>
  );
};
