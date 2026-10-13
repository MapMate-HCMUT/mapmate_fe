import { Link } from 'react-router';
import { StatsPanel } from '../components/StatsPanel';
import { useConsole } from '../hooks/useConsole';
import { formatCompact } from '../utils/businessConfig';

const rate = (part, total) => (total ? `${Math.round((part / total) * 100)}%` : '—');

// Thống kê: biểu đồ theo ngày (tối đa theo gói) + bảng từng cửa hàng 7 ngày + tỉ lệ chuyển đổi
export const InsightsPage = () => {
  const { data } = useConsole();
  return (
    <div className="space-y-5">
      <StatsPanel maxDays={data.tier.stats_days} />
      <section className="bg-surface rounded-card shadow-card p-4 sm:p-5 overflow-x-auto">
        <h2 className="text-base font-bold text-neutral-900 mb-3">Từng cửa hàng · 7 ngày</h2>
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
              <th scope="col" className="py-2 font-semibold">Cửa hàng</th>
              <th scope="col" className="py-2 font-semibold text-right">Hiển thị</th>
              <th scope="col" className="py-2 font-semibold text-right">Xem</th>
              <th scope="col" className="py-2 font-semibold text-right">Chỉ đường</th>
              <th scope="col" className="py-2 font-semibold text-right" title="Lượt xem / lượt hiển thị">Tỉ lệ xem</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {data.places.map((place) => (
              <tr key={place.id} className="border-b border-neutral-100 last:border-0">
                <td className="py-2.5 font-medium text-neutral-800">{place.name}</td>
                <td className="py-2.5 text-right">{formatCompact(place.stats_7d.impressions)}</td>
                <td className="py-2.5 text-right">{formatCompact(place.stats_7d.views)}</td>
                <td className="py-2.5 text-right">{formatCompact(place.stats_7d.directions)}</td>
                <td className="py-2.5 text-right">{rate(place.stats_7d.views, place.stats_7d.impressions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="bg-surface rounded-card shadow-card p-4 sm:p-5 text-sm text-neutral-600 space-y-1.5">
        <h2 className="text-base font-bold text-neutral-900">Mẹo tăng lượt xem</h2>
        <p>• Thêm ít nhất 3 ảnh thật của quán — thẻ có ảnh được bấm xem nhiều hơn hẳn.</p>
        <p>• Chạy voucher "giờ vàng" vào khung giờ vắng khách để lấp chỗ trống.</p>
        <p>• Trả lời mọi đánh giá, kể cả đánh giá chưa tốt — khách mới đọc phản hồi của quán trước khi quyết định.</p>
        {data.tier.value !== 'premium' && <p>• <Link to="/business/plans" className="font-semibold text-primary-700 hover:underline">Nâng gói</Link> để được ưu tiên trong bán kính rộng hơn và xem thống kê dài hơn.</p>}
      </section>
    </div>
  );
};
