import { Bus, TrainFront } from 'lucide-react';

// Chú thích khi chọn phương tiện "Buýt & Metro": metro luôn hiện, trạm buýt hiện khi phóng to
export const TransitLegend = ({ stopCount, tooFar }) => (
  <div className="w-52 rounded-card bg-surface/95 px-2.5 py-2 shadow-card text-[11px] text-neutral-600 space-y-1" aria-label="Chú thích xe buýt và metro">
    <p className="font-bold text-neutral-800">🚌 Đang đi bằng Buýt & Metro</p>
    <p className="flex items-center gap-1.5">
      <span className="inline-flex w-4 h-4 items-center justify-center rounded-pill bg-[#2563eb]"><TrainFront className="w-2.5 h-2.5 text-white" /></span>
      Metro số 1 (Bến Thành – Suối Tiên)
    </p>
    <p className="flex items-center gap-1.5">
      <span className="inline-flex w-4 h-4 items-center justify-center rounded-[5px] bg-[#0284c7]"><Bus className="w-2.5 h-2.5 text-white" /></span>
      {tooFar ? 'Phóng to để thấy trạm buýt' : `Trạm buýt${stopCount ? ` (${stopCount})` : ''} · bấm xem xe tới`}
    </p>
  </div>
);
