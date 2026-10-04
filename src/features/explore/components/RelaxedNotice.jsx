import { Info } from 'lucide-react';

// Không có kết quả khớp đủ bộ lọc => server đã tự nới; báo rõ đã tạm bỏ gì, cho bỏ hẳn để bảng bộ lọc khớp với kết quả.
export const RelaxedNotice = ({ relaxed, onApply }) => (
  <div className="mb-3 flex flex-wrap items-center gap-2 rounded-card border border-info-100 bg-info-50 px-3 py-2 text-xs text-info-700">
    <Info className="w-4 h-4 shrink-0" />
    <p className="flex-1 min-w-48">
      Không có địa điểm khớp đủ bộ lọc — đang hiện kết quả khi tạm bỏ <b>{relaxed.labels.join(', ')}</b>
      {relaxed.radius_km ? ` (tìm trong ${relaxed.radius_km} km)` : ''}.
    </p>
    <button type="button" onClick={onApply} className="px-2.5 py-1 rounded-pill bg-surface border border-info-100 font-semibold hover:bg-info-100">
      Bỏ hẳn các bộ lọc này
    </button>
  </div>
);
