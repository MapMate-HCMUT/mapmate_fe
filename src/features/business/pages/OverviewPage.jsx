import { Link } from 'react-router';
import { ArrowRight, CircleCheck, Circle, Eye, MapPinned, Megaphone, MessageSquareText, Navigation, ScanLine, Star, TicketPercent } from 'lucide-react';
import { useState } from 'react';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { getBusinessReviewsApi, getPromotionsApi } from '../api/businessApi';
import { NoticeModal } from '../components/NoticeModal';
import { PromotionStatusPill } from '../components/PromotionStatusPill';
import { StarRow } from '../components/StarRow';
import { useConsole } from '../hooks/useConsole';
import { checklistScore, storeChecklist } from '../utils/storeChecklist';
import { formatCompact, formatDateTime, promotionKind } from '../utils/businessConfig';

const Card = ({ title, action, children, className = '' }) => (
  <section className={`bg-surface rounded-card shadow-card p-4 sm:p-5 ${className}`}>
    <header className="flex items-center justify-between gap-3 mb-3">
      <h2 className="text-base font-bold text-neutral-900">{title}</h2>
      {action}
    </header>
    {children}
  </section>
);
const SeeAll = ({ to, children = 'Xem tất cả' }) => (
  <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline">
    {children} <ArrowRight className="w-3.5 h-3.5" />
  </Link>
);

const Kpi = ({ icon: Icon, label, value, hint }) => (
  <div className="bg-surface rounded-card shadow-card p-4">
    <p className="flex items-center gap-1.5 text-xs text-neutral-500">
      <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
    </p>
    <p className="mt-1 text-2xl font-semibold text-neutral-900 tabular-nums">{value}</p>
    {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
  </div>
);

// Tổng quan: số liệu 7 ngày, việc nên làm, khuyến mãi đang chạy, đánh giá mới
export const OverviewPage = () => {
  const { data, reload } = useConsole();
  const reviews = useAsyncData(() => getBusinessReviewsApi({ filter: 'all' }), 'overview-reviews');
  const promotions = useAsyncData(getPromotionsApi, 'overview-promotions');
  const [noticeOpen, setNoticeOpen] = useState(false);
  const summary = reviews.data?.summary;
  const running = (promotions.data?.items ?? []).filter((promo) => promo.status !== 'ended');
  const stats = data.stats_7d;

  const actions = [
    { icon: Megaphone, label: 'Đăng thông báo nhanh', hint: 'Nghỉ, đóng sớm, món mới…', onClick: () => setNoticeOpen(true) },
    { icon: TicketPercent, label: 'Tạo khuyến mãi / sự kiện', hint: 'Voucher, check-in, vòng quay', to: '/business/promotions?new=1' },
    { icon: ScanLine, label: 'Xác nhận voucher', hint: 'Nhập mã khách đọc', to: '/business/redeem' },
    { icon: MessageSquareText, label: 'Trả lời đánh giá', hint: data.unreplied_reviews ? `${data.unreplied_reviews} đánh giá chưa trả lời` : 'Đã trả lời hết 👏', to: '/business/reviews?filter=unreplied' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-neutral-500">7 ngày qua của</p>
        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">{data.business.name}</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={MapPinned} label="Lượt hiển thị" value={formatCompact(stats.impressions)} hint="trong tìm kiếm & Nổi bật" />
        <Kpi icon={Eye} label="Lượt xem chi tiết" value={formatCompact(stats.views)} />
        <Kpi icon={Navigation} label="Lượt chỉ đường" value={formatCompact(stats.directions)} />
        <Kpi icon={Star} label="Điểm đánh giá" value={summary?.average ? `${summary.average}★` : '—'} hint={summary ? `${summary.count} đánh giá công khai` : ' '} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map(({ icon: Icon, label, hint, to, onClick }) => {
          const body = (
            <>
              <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition" aria-hidden="true">
                <Icon className="w-5 h-5" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-sm font-bold text-neutral-900">{label}</span>
                <span className="block text-xs text-neutral-500 truncate">{hint}</span>
              </span>
            </>
          );
          const className = 'group flex items-center gap-3 bg-surface rounded-card shadow-card p-3.5 hover:shadow-card-hover transition';
          return to ? <Link key={label} to={to} className={className}>{body}</Link> : <button key={label} type="button" onClick={onClick} className={className}>{body}</button>;
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <Card title="Hoàn thiện cửa hàng" action={<SeeAll to="/business/stores">Cửa hàng</SeeAll>}>
          <div className="space-y-4">
            {data.places.map((place) => {
              const items = storeChecklist(place);
              const score = checklistScore(items);
              return (
                <div key={place.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-800 truncate">{place.name}</p>
                    <p className="text-xs font-bold text-neutral-600 tabular-nums">{score}%</p>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-pill bg-primary-100 overflow-hidden">
                    <div className="h-full rounded-pill bg-primary-500" style={{ width: `${score}%` }} />
                  </div>
                  <ul className="mt-2 grid sm:grid-cols-2 gap-x-3 gap-y-1">
                    {items.map((item) => (
                      <li key={item.key}>
                        <Link to={item.to} className={`flex items-center gap-1.5 text-xs ${item.done ? 'text-neutral-400 line-through' : 'text-neutral-700 hover:text-primary-700'}`}>
                          {item.done ? <CircleCheck className="w-3.5 h-3.5 text-success-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-neutral-300 shrink-0" />}
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Khuyến mãi & sự kiện" action={<SeeAll to="/business/promotions" />}>
          {running.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-600">Chưa có khuyến mãi nào đang chạy.</p>
              <Link to="/business/promotions?new=1" className="mt-3 inline-flex px-4 py-2 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">Tạo sự kiện đầu tiên</Link>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {running.slice(0, 4).map((promo) => (
                <li key={promo.id} className="py-2.5 flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">{promotionKind(promo.kind).emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{promo.title}</p>
                    <p className="text-xs text-neutral-500">
                      {promo.status === 'scheduled' ? `Mở lúc ${formatDateTime(promo.starts_at)}` : `Đến ${formatDateTime(promo.ends_at)}`}
                      {promo.kind !== 'deal' && ` · đã phát ${promo.claimed_count} · đã dùng ${promo.used_count}`}
                    </p>
                  </div>
                  <PromotionStatusPill status={promo.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Đánh giá mới" action={<SeeAll to="/business/reviews" />} className="lg:col-span-2">
          {!reviews.data?.items.length ? (
            <p className="text-sm text-neutral-500">Chưa có đánh giá công khai nào. Khi khách viết đánh giá về quán, bạn trả lời được ở đây.</p>
          ) : (
            <ul className="grid md:grid-cols-3 gap-3">
              {reviews.data.items.slice(0, 3).map((review) => (
                <li key={review.id} className="rounded-input border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-800 truncate">{review.author.username}</p>
                    {review.rating && <StarRow value={review.rating} />}
                  </div>
                  <p className="mt-1 text-xs text-neutral-600 line-clamp-3">{review.content || '(chỉ có ảnh)'}</p>
                  <p className={`mt-2 text-[11px] font-semibold ${review.owner_reply ? 'text-success-700' : 'text-warning-700'}`}>
                    {review.owner_reply ? '✓ Đã trả lời' : 'Chưa trả lời'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <NoticeModal isOpen={noticeOpen} places={data.places} onClose={() => setNoticeOpen(false)} onSaved={reload} />
    </div>
  );
};
