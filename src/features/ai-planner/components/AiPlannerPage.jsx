import { useState } from 'react';
import { PanelLeft, SquarePen } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useAiChat } from '../hooks/useAiChat';
import { useAiOptions } from '../hooks/useAiOptions';
import { useAiMemory } from '../hooks/useAiMemory';
import { useAiSessions } from '../hooks/useAiSessions';
import { AiMemoryPanel } from './AiMemoryPanel';
import { ChatThread } from './ChatThread';
import { PromptComposer } from './PromptComposer';
import { SessionSidebar } from './SessionSidebar';

// Chọn model AI: Nhanh (rẻ, nhanh) / Thông minh (tư vấn kỹ hơn)
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

// Trang /ai-planner: người dùng nhập yêu cầu tự do -> Agent hiểu yêu cầu -> tiêu chí -> lộ trình từ DB -> AI tư vấn.
export const AiPlannerPage = () => {
  const options = useAiOptions();
  const { isAuthenticated } = useAuth();
  const [version, setVersion] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chat = useAiChat({ defaultTier: options.default_model, onSent: () => setVersion((value) => value + 1) });
  const sessions = useAiSessions(version);
  const memory = useAiMemory(version);

  return (
    <section className="flex-1 min-h-0 flex bg-neutral-50 relative overflow-hidden">
      <SessionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions.items}
        activeId={chat.sessionId}
        onOpen={chat.openSession}
        onDelete={sessions.remove}
        onNew={chat.newChat}
        isAuthenticated={isAuthenticated}
        footer={<AiMemoryPanel memoryState={memory} />}
      />
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <header className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-surface px-3 py-2 sm:px-4 lg:px-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              title={isSidebarOpen ? 'Đóng thanh bên' : 'Mở thanh bên'}
              aria-label={isSidebarOpen ? 'Đóng thanh bên' : 'Mở thanh bên'}
              className="p-1.5 sm:p-2 rounded-button text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={chat.newChat}
              title="Cuộc trò chuyện mới"
              aria-label="Cuộc trò chuyện mới"
              className="p-1.5 sm:p-2 rounded-button text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
            >
              <SquarePen className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-neutral-900 ml-1">MapMate AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModelToggle models={options.models} value={chat.tier} onChange={chat.setTier} />
          </div>
        </header>
        <ChatThread messages={chat.messages} isSending={chat.isSending} onSend={chat.send} examples={options.examples} personalized={memory.memory?.suggestions ?? []} llmEnabled={options.llm_enabled} />
        <PromptComposer onSend={chat.send} isSending={chat.isSending} maxLength={options.prompt_max_length} origin={chat.origin} isLocating={chat.isLocating} onLocate={chat.locateMe} />
      </div>
    </section>
  );
};
