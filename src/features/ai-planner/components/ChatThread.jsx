import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { AiWelcome } from './AiWelcome';
import { AssistantMessage } from './AssistantMessage';

const THINKING_STEPS = 'Đang hiểu yêu cầu → tìm địa điểm → lên lộ trình → viết tư vấn…';

// Luồng hội thoại; tự cuộn xuống tin mới nhất.
export const ChatThread = ({ messages, isSending, onSend, examples, personalized = [], llmEnabled }) => {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isSending]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 lg:px-8">
      {messages.length === 0 ? (
        <AiWelcome examples={examples} personalized={personalized} llmEnabled={llmEnabled} onPick={onSend} />
      ) : (
        <ol className="mx-auto max-w-3xl space-y-5" aria-live="polite">
          {messages.map((message) => (
            <li key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex gap-2.5'}>
              {message.role === 'user' ? (
                <p className="max-w-[85%] rounded-card rounded-br-sm bg-primary-600 px-3.5 py-2 text-sm text-white whitespace-pre-line">{message.text}</p>
              ) : (
                <>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-xs ring-1 ring-white/30">
                    <Sparkles className="w-3.5 h-3.5 drop-shadow-xs" />
                  </span>
                  <div className="flex-1 min-w-0"><AssistantMessage message={message} onFollowUp={onSend} isSending={isSending} /></div>
                </>
              )}
            </li>
          ))}
          {isSending && (
            <li className="flex gap-2.5 text-sm text-neutral-500">
              <span className="flex h-7 w-7 shrink-0 animate-pulse items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-xs ring-1 ring-white/30">
                <Sparkles className="w-3.5 h-3.5 drop-shadow-xs" />
              </span>
              <span className="pt-1">{THINKING_STEPS}</span>
            </li>
          )}
        </ol>
      )}
      <div ref={endRef} />
    </div>
  );
};
