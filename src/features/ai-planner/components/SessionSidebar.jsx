import { MessageSquarePlus, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';

// Lịch sử trò chuyện (chỉ khi đăng nhập, màn hình rộng).
export const SessionSidebar = ({ sessions, activeId, onOpen, onDelete, onNew }) => (
  <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-surface">
    <div className="p-3">
      <button type="button" onClick={onNew} className="w-full inline-flex items-center justify-center gap-1.5 rounded-button bg-primary-50 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100">
        <MessageSquarePlus className="w-4 h-4" /> Cuộc trò chuyện mới
      </button>
    </div>
    <ul className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
      {sessions.length === 0 && <li className="px-2 py-3 text-xs text-neutral-400">Chưa có cuộc trò chuyện nào.</li>}
      {sessions.map((session) => (
        <li key={session.id} className={`group flex items-center gap-1 rounded-button ${session.id === activeId ? 'bg-primary-50' : 'hover:bg-neutral-100'}`}>
          <button type="button" onClick={() => onOpen(session.id)} className="flex-1 min-w-0 px-2 py-2 text-left">
            <p className="truncate text-sm text-neutral-800">{session.title || 'Cuộc trò chuyện'}</p>
            <p className="text-[11px] text-neutral-400">{formatRelativeTime(session.updated_at)}</p>
          </button>
          <button type="button" onClick={() => onDelete(session.id)} aria-label="Xoá cuộc trò chuyện" className="mr-1 p-1.5 rounded-button text-neutral-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-danger-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </li>
      ))}
    </ul>
  </aside>
);
