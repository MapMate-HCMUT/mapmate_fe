import { Link } from 'react-router';
import { MessageSquarePlus, PanelLeftClose, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';

// Lịch sử trò chuyện: thanh bên bật ra / gập vào trên Desktop, dạng drawer trượt trên Mobile.
export const SessionSidebar = ({
  isOpen,
  onClose,
  sessions = [],
  activeId,
  onOpen,
  onDelete,
  onNew,
  isAuthenticated,
}) => {
  const content = (
    <div className="flex h-full flex-col bg-surface border-r border-neutral-200">
      <div className="p-3 border-b border-neutral-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            onNew();
            onClose?.();
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-button bg-primary-50 py-2 px-3 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition shadow-xs"
        >
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          <span>Cuộc trò chuyện mới</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Đóng thanh bên"
          aria-label="Đóng thanh bên"
          className="p-2 rounded-button text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
        Gần đây
      </div>

      <ul className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {!isAuthenticated ? (
          <li className="px-3 py-6 text-center">
            <p className="text-xs text-neutral-500 mb-3">Đăng nhập để xem và lưu lại lịch sử cuộc trò chuyện.</p>
            <Link
              to="/login?redirect=/ai-planner"
              className="inline-block px-3 py-1.5 text-xs font-semibold rounded-button bg-primary-600 hover:bg-primary-700 text-white transition shadow-xs"
            >
              Đăng nhập
            </Link>
          </li>
        ) : sessions.length === 0 ? (
          <li className="px-3 py-4 text-xs text-neutral-400 text-center">
            Chưa có cuộc trò chuyện nào.
          </li>
        ) : (
          sessions.map((session) => (
            <li
              key={session.id}
              className={`group flex items-center gap-1 rounded-button transition ${
                session.id === activeId ? 'bg-primary-50 text-primary-900 font-medium' : 'hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onOpen(session.id);
                  onClose?.();
                }}
                className="flex-1 min-w-0 px-2.5 py-2 text-left"
              >
                <p className="truncate text-sm">{session.title || 'Cuộc trò chuyện'}</p>
                <p className="text-[11px] text-neutral-400 font-normal">{formatRelativeTime(session.updated_at)}</p>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(session.id);
                }}
                aria-label="Xoá cuộc trò chuyện"
                className="mr-1 p-1.5 rounded-button text-neutral-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-danger-600 hover:bg-danger-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none overflow-hidden'
        }`}
      >
        {content}
      </aside>
    </>
  );
};
