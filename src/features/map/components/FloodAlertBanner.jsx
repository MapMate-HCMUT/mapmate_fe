import { Icon } from '../../../components/Icon';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';
import { getSeverity } from '../utils/floodSeverity';

// Banner cảnh báo ngập nổi trên bản đồ (Milestone 2: "Đường Nguyễn Hữu Cảnh đang ngập 30cm - 15 phút trước").
export const FloodAlertBanner = ({ alert, onFocus, onClose }) => {
  const { banner, label } = getSeverity(alert.severity);

  return (
    <div
      role="alert"
      className={`${banner} text-white rounded-card shadow-modal flex items-center gap-3 pl-3 pr-2 py-2.5 animate-[toast-in_200ms_ease-out]`}
    >
      <span className="text-xl animate-pulse" aria-hidden="true">⚠️</span>
      <button type="button" onClick={onFocus} className="flex-1 min-w-0 text-left">
        <p className="text-sm font-bold truncate">
          {alert.street} đang ngập {alert.depth_cm}cm
        </p>
        <p className="text-xs opacity-90 truncate">
          {label} · {alert.district} · {formatRelativeTime(alert.updated_at)} · {alert.report_count} báo cáo
        </p>
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label="Ẩn cảnh báo"
        className="p-1 rounded-pill opacity-80 hover:opacity-100 hover:bg-white/15"
      >
        <Icon name="close" className="w-4 h-4" />
      </button>
    </div>
  );
};
