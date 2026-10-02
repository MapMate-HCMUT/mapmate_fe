import { formatShortVND } from '../../../utils/formatCurrencyVND';
import { formatDuration, formatVND } from '../../../utils/formatTrip';

const Stat = ({ label, value, tone = 'text-neutral-900' }) => (
  <div className="rounded-button bg-neutral-50 px-2 py-2 text-center">
    <dd className={`text-sm font-bold ${tone}`}>{value}</dd>
    <dt className="text-[11px] text-neutral-500">{label}</dt>
  </div>
);

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-3 py-1">
    <dt className="text-neutral-500">{label}</dt>
    <dd className="text-right font-medium text-neutral-800">{children}</dd>
  </div>
);

const Margin = ({ value, format, overText }) =>
  value >= 0 ? <span className="text-success-700">còn dư {format(value)}</span> : <span className="text-danger-600">{overText} {format(-value)}</span>;

/**
 * Bảng tổng hợp chuyến đi: 4 số chính luôn hiện; bấm "Xem chi tiết" để mở phần còn lại
 * (thời gian đi/chơi, chi phí địa điểm/di chuyển, so với ngân sách & thời lượng, theo từng phương tiện).
 * `compact` = chỉ 3 số chính, dùng cho khung xem trước.
 */
export const TripSummary = ({ summary, compact = false }) => {
  const overBudget = summary.within_budget === false;
  const overTime = summary.within_duration === false;
  const stats = (
    <dl className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
      {!compact && <Stat label="Điểm dừng" value={summary.stop_count} />}
      <Stat label="Tổng thời gian" value={formatDuration(summary.total_minutes)} tone={overTime ? 'text-danger-600' : undefined} />
      <Stat label="Quãng đường" value={`${summary.total_distance_km} km`} />
      <Stat label="Chi phí / người" value={formatShortVND(summary.cost_per_person)} tone={overBudget ? 'text-danger-600' : undefined} />
    </dl>
  );
  if (compact) return stats;

  return (
    <div className="space-y-2">
      {stats}
      <details className="group text-xs">
        <summary className="cursor-pointer select-none list-none font-semibold text-info-700 hover:underline">
          <span className="group-open:hidden">Xem chi tiết thống kê ▾</span>
          <span className="hidden group-open:inline">Thu gọn ▴</span>
        </summary>
        <dl className="mt-2 divide-y divide-neutral-100">
          <Row label="Thời gian">
            di chuyển {formatDuration(summary.travel_minutes)} · tham quan {formatDuration(summary.visit_minutes)}
            {summary.end_time && <> · xong lúc {summary.end_time}</>}
          </Row>
          {summary.time_left_minutes != null && (
            <Row label={`So với ${formatDuration(summary.duration_limit_minutes)} dự định`}>
              <Margin value={summary.time_left_minutes} format={formatDuration} overText="quá" />
            </Row>
          )}
          <Row label="Chi phí / người">
            địa điểm {formatShortVND(summary.places_cost_per_person)} + di chuyển {formatShortVND(summary.transport_cost_per_person)}
          </Row>
          {summary.people > 1 && <Row label={`Cả nhóm ${summary.people} người`}>{formatVND(summary.total_cost)}</Row>}
          {summary.budget_left != null && (
            <Row label={`So với ngân sách ${formatShortVND(summary.trip_budget)}`}>
              <Margin value={summary.budget_left} format={formatShortVND} overText="vượt" />
            </Row>
          )}
          {summary.avg_rating != null && <Row label="Đánh giá trung bình">★ {summary.avg_rating}</Row>}
          {summary.transport.map((item) => (
            <Row key={item.mode} label={`${item.emoji} ${item.label} (${item.legs} chặng)`}>
              {item.distance_km} km · {formatDuration(item.minutes)} · {item.cost_per_person > 0 ? formatShortVND(item.cost_per_person) : 'miễn phí'}
            </Row>
          ))}
        </dl>
      </details>
    </div>
  );
};
