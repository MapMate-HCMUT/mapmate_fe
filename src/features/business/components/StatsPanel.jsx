import { useState } from 'react';
import { Link } from 'react-router';
import { Lock } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { useBusinessStats } from '../hooks/useBusinessStats';
import { formatCompact, STAT_METRICS } from '../utils/businessConfig';

const RANGES = [7, 30, 90];
const CHART_HEIGHT = 160;
const TICKS = 4;

// Trục y "tròn số": 0 / 5 / 10 / 15 / 20 thay vì 0 / 4.75 / 9.5...
const niceMax = (value) => {
  if (value <= TICKS) return TICKS;
  const step = 10 ** Math.floor(Math.log10(value / TICKS));
  const nice = [1, 2, 2.5, 5, 10].map((factor) => factor * step).find((candidate) => candidate * TICKS >= value);
  return nice * TICKS;
};
const shortDate = (day) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

// Biểu đồ cột 1 chỉ số theo ngày: cột mảnh bo đầu, khe 2px, lưới mảnh; rê chuột / chạm vào cột để xem số của ngày đó
const DailyColumns = ({ daily, metric }) => {
  const [hovered, setHovered] = useState(null);
  const max = niceMax(Math.max(...daily.map((row) => row[metric.key])));
  const ticks = Array.from({ length: TICKS + 1 }, (_, index) => (max / TICKS) * index);
  const labelEvery = Math.ceil(daily.length / 6);

  return (
    <figure className="mt-6">
      <figcaption className="sr-only">{metric.label} theo ngày</figcaption>
      <div className="flex gap-2">
        <div className="relative w-8 shrink-0 text-[10px] text-neutral-400 tabular-nums" style={{ height: CHART_HEIGHT }} aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(tick / max) * 100}%` }}>
              {formatCompact(tick)}
            </span>
          ))}
        </div>
        <div className="relative flex-1 min-w-0" style={{ height: CHART_HEIGHT }}>
          {ticks.map((tick) => (
            <div key={tick} className="absolute inset-x-0 border-t border-neutral-100" style={{ bottom: `${(tick / max) * 100}%` }} aria-hidden="true" />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setHovered(null)}>
            {daily.map((row, index) => {
              const value = row[metric.key];
              return (
                <button
                  key={row.day}
                  type="button"
                  onMouseEnter={() => setHovered(index)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  aria-label={`${shortDate(row.day)}: ${value} ${metric.label.toLowerCase()}`}
                  className="relative h-full flex-1 min-w-0 flex items-end justify-center focus:outline-none group"
                >
                  <span
                    className={`block w-full max-w-6 rounded-t-[4px] transition-colors ${hovered === index ? 'bg-primary-700' : 'bg-primary-600'}`}
                    style={{ height: value ? `${Math.max((value / max) * 100, 1.5)}%` : 0 }}
                  />
                  {hovered === index && (
                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 px-2 py-1 rounded-input bg-ink text-white text-[11px] whitespace-nowrap shadow-modal pointer-events-none">
                      <b>{value.toLocaleString('vi-VN')}</b> · {shortDate(row.day)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-10 mt-1.5 flex gap-[2px] text-[10px] text-neutral-400" aria-hidden="true">
        {daily.map((row, index) => (
          <span key={row.day} className="flex-1 min-w-0 text-center overflow-visible whitespace-nowrap">
            {index % labelEvery === 0 || index === daily.length - 1 ? shortDate(row.day) : ''}
          </span>
        ))}
      </div>
      {/* Bảng số liệu cho trình đọc màn hình */}
      <table className="sr-only">
        <caption>{metric.label} theo ngày</caption>
        <thead>
          <tr><th scope="col">Ngày</th><th scope="col">{metric.label}</th></tr>
        </thead>
        <tbody>
          {daily.map((row) => (
            <tr key={row.day}><td>{shortDate(row.day)}</td><td>{row[metric.key]}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};

/** Thống kê cửa hàng: 3 ô tổng (bấm để chọn chỉ số) + biểu đồ theo ngày. Số ngày xem được tuỳ gói (maxDays). */
export const StatsPanel = ({ maxDays }) => {
  const [days, setDays] = useState(7);
  const [metricKey, setMetricKey] = useState(STAT_METRICS[0].key);
  const { stats, error, isLoading, reload } = useBusinessStats(Math.min(days, maxDays));
  const metric = STAT_METRICS.find((item) => item.key === metricKey);

  return (
    <section className="bg-surface rounded-card shadow-card p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Hiệu quả hiển thị</h2>
          <p className="text-xs text-neutral-500">Mỗi người chỉ tính 1 lượt / cửa hàng / ngày · bạn tự xem không tính</p>
        </div>
        <div className="inline-flex rounded-pill bg-neutral-100 p-0.5" role="group" aria-label="Khoảng thời gian">
          {RANGES.map((range) => {
            const isLocked = range > maxDays;
            const isActive = days === range;
            return isLocked ? (
              <Link key={range} to="/business/plans" title="Nâng gói để xem thống kê dài hơn" className="inline-flex items-center gap-1 px-3 py-1 rounded-pill text-xs font-semibold text-neutral-400 hover:text-neutral-600">
                <Lock className="w-3 h-3" aria-hidden="true" /> {range} ngày
              </Link>
            ) : (
              <button
                key={range}
                type="button"
                aria-pressed={isActive}
                onClick={() => setDays(range)}
                className={`px-3 py-1 rounded-pill text-xs font-semibold transition ${isActive ? 'bg-surface text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
              >
                {range} ngày
              </button>
            );
          })}
        </div>
      </header>

      {error && !stats && <ErrorState error={error} onRetry={reload} compact className="mt-4" />}
      {isLoading && !stats && <div className="mt-4 h-56 rounded-input bg-neutral-100 animate-pulse" aria-hidden="true" />}
      {stats && (
        <div className={isLoading ? 'opacity-60 transition-opacity' : ''}>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {STAT_METRICS.map((item) => {
              const isActive = item.key === metricKey;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={isActive}
                  title={item.hint}
                  onClick={() => setMetricKey(item.key)}
                  className={`text-left rounded-input p-2.5 sm:p-3 border transition ${isActive ? 'border-primary-500 bg-primary-50/60' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <span className="block text-[11px] sm:text-xs text-neutral-500">{item.label}</span>
                  <span className="block mt-0.5 text-xl sm:text-2xl font-semibold text-neutral-900 tabular-nums">{formatCompact(stats.totals[item.key])}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-neutral-500">{metric.hint}</p>
          <DailyColumns daily={stats.daily} metric={metric} />
        </div>
      )}
    </section>
  );
};
