import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useAiChat } from '../hooks/useAiChat';
import { useAiOptions } from '../hooks/useAiOptions';
import { useAiSessions } from '../hooks/useAiSessions';
import { ChatThread } from './ChatThread';
import { PromptComposer } from './PromptComposer';
import { SessionSidebar } from './SessionSidebar';

// Chọn model Groq: Nhanh (rẻ, nhanh) / Thông minh (tư vấn kỹ hơn)
const ModelToggle = ({ models, value, onChange }) => (
  <div role="radiogroup" aria-label="Chế độ AI" className="inline-flex rounded-pill bg-neutral-100 p-0.5">
    {models.map((model) => (
      <button
        key={model.value}
        type="button"
        role="radio"
        aria-checked={model.value === value}
        title={model.description}
        onClick={() => onChange(model.value)}
        className={`px-3 py-1 rounded-pill text-xs font-semibold transition ${model.value === value ? 'bg-surface text-primary-700 shadow-card' : 'text-neutral-500 hover:text-neutral-800'}`}
      >
        {model.label}
      </button>
    ))}
  </div>
);

// Trang /ai-planner: người dùng nhập yêu cầu tự do -> Agent hiểu yêu cầu -> tiêu chí -> lộ trình từ DB -> Groq tư vấn.
export const AiPlannerPage = () => {
  const options = useAiOptions();
  const { isAuthenticated } = useAuth();
  const [version, setVersion] = useState(0);
  const chat = useAiChat({ defaultTier: options.default_model, onSent: () => setVersion((value) => value + 1) });
  const sessions = useAiSessions(version);

  return (
    <section className="flex-1 min-h-0 flex bg-neutral-50">
      {isAuthenticated && <SessionSidebar sessions={sessions.items} activeId={chat.sessionId} onOpen={chat.openSession} onDelete={sessions.remove} onNew={chat.newChat} />}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-surface px-4 py-2 lg:px-8">
          <h1 className="text-sm font-bold text-neutral-900">MapMate AI <span className="font-normal text-neutral-400">· Groq</span></h1>
          <div className="flex items-center gap-2">
            <ModelToggle models={options.models} value={chat.tier} onChange={chat.setTier} />
            {chat.messages.length > 0 && (
              <button type="button" onClick={chat.newChat} aria-label="Cuộc trò chuyện mới" className="lg:hidden p-1.5 rounded-button text-neutral-500 hover:bg-neutral-100">
                <MessageSquarePlus className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>
        <ChatThread messages={chat.messages} isSending={chat.isSending} onSend={chat.send} examples={options.examples} llmEnabled={options.llm_enabled} />
        <PromptComposer onSend={chat.send} isSending={chat.isSending} maxLength={options.prompt_max_length} origin={chat.origin} isLocating={chat.isLocating} onLocate={chat.locateMe} />
      </div>
    </section>
  );
};
