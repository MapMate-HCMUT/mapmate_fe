import { Check, LoaderCircle } from 'lucide-react';
import { formatBytes } from '../utils/businessConfig';

const TIER_ORDER = ['basic', 'growth', 'premium'];
const ICON_BG = { basic: 'bg-neutral-100', growth: 'bg-secondary-50', premium: 'bg-accent-50' };
const EMOJI = { basic: '🌱', growth: '🚀', premium: '👑' };

const Price = ({ amount }) =>
  amount ? (
    <p className="mt-3 flex items-baseline gap-1 flex-wrap">
      <span className="text-2xl font-extrabold tracking-tight text-neutral-900 tabular-nums">{amount.toLocaleString('vi-VN')}đ</span>
      <span className="text-sm text-neutral-500">/ tháng</span>
    </p>
  ) : (
    <p className="mt-3 flex items-baseline gap-1 flex-wrap">
      <span className="text-2xl font-extrabold tracking-tight text-neutral-900">0đ</span>
      <span className="text-sm text-neutral-500">miễn phí</span>
    </p>
  );

const TierBody = ({ tier }) => (
  <>
    <dl className="mt-4 grid grid-cols-2 gap-2">
      {[
        ['Cửa hàng', tier.max_places],
        ['Ảnh / video', formatBytes(tier.storage_bytes)],
        ['Ưu tiên hiển thị', tier.reach_km ? `${tier.reach_km} km` : 'Không'],
        ['Thống kê', `${tier.stats_days} ngày`],
      ].map(([label, value]) => (
        <div key={label} className="rounded-input bg-neutral-50 px-2 py-2 text-center">
          <dt className="text-[11px] leading-tight text-neutral-500">{label}</dt>
          <dd className="mt-0.5 text-sm font-bold text-neutral-900">{value}</dd>
        </div>
      ))}
    </dl>
    <ul className="mt-4 space-y-2 flex-1">
      {tier.highlights.map((text) => (
        <li key={text} className="flex items-start gap-2 text-sm leading-snug text-neutral-700">
          <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary-600" aria-hidden="true" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  </>
);

const TierHeader = ({ tier, badge }) => (
  <header className="flex items-center gap-2.5">
    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${ICON_BG[tier.value]}`} aria-hidden="true">{EMOJI[tier.value]}</span>
    <h3 className="flex-1 min-w-0 text-base font-extrabold text-neutral-900">{tier.label}</h3>
    {badge}
  </header>
);

const Badge = ({ children, tone = 'primary' }) => (
  <span className={`shrink-0 px-2 py-0.5 rounded-pill text-[11px] font-bold ${tone === 'primary' ? 'bg-primary-600 text-white' : 'bg-accent-100 text-accent-800'}`}>{children}</span>
);
const popularBadge = (tier) => (tier.value === 'premium' ? <Badge tone="accent">Phủ sóng rộng nhất</Badge> : null);

/**
 * Bảng 3 gói.
 * - variant "browse": chỉ xem (trang giới thiệu)
 * - variant "select": chọn 1 gói kiểu radio (đăng ký) — bấm cả thẻ để chọn; onSelect(tier)
 * - variant "manage": đổi gói (trang quản lý) — current = gói đang dùng; onAction(tier); busyTier = gói đang xử lý
 */
export const TierPlans = ({ tiers, variant = 'browse', current = null, selected = null, onSelect, onAction, busyTier = null }) => {
  if (variant === 'select') {
    return (
      <div role="radiogroup" aria-label="Chọn gói" className="grid md:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const isSelected = tier.value === selected;
          return (
            <button
              key={tier.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(tier.value)}
              className={`relative flex flex-col text-left rounded-card bg-surface p-5 border-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 ${
                isSelected ? 'border-primary-500 ring-4 ring-primary-500/15 shadow-card-hover' : 'border-neutral-200 hover:border-primary-300 shadow-card'
              }`}
            >
              <TierHeader tier={tier} badge={popularBadge(tier)} />
              <Price amount={tier.price_vnd} />
              <TierBody tier={tier} />
              <span
                className={`mt-5 flex items-center justify-center gap-2 py-2.5 rounded-button text-sm font-bold border-2 transition ${
                  isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-surface border-neutral-200 text-neutral-700'
                }`}
              >
                <span className={`w-4 h-4 rounded-pill flex items-center justify-center ${isSelected ? 'bg-white text-primary-600' : 'border-2 border-neutral-300'}`} aria-hidden="true">
                  {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                </span>
                {isSelected ? 'Đã chọn gói này' : 'Chọn gói này'}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {tiers.map((tier) => {
        const isCurrent = variant === 'manage' && tier.value === current;
        const isUpgrade = TIER_ORDER.indexOf(tier.value) > TIER_ORDER.indexOf(current);
        const isBusy = busyTier === tier.value;
        return (
          <article
            key={tier.value}
            className={`relative flex flex-col rounded-card bg-surface p-5 border-2 shadow-card ${isCurrent ? 'border-primary-500' : 'border-neutral-200'}`}
          >
            <TierHeader tier={tier} badge={isCurrent ? <Badge>Đang dùng</Badge> : popularBadge(tier)} />
            <Price amount={tier.price_vnd} />
            <TierBody tier={tier} />
            {variant === 'manage' &&
              (isCurrent ? (
                <p className="mt-5 flex items-center justify-center gap-1.5 py-2.5 rounded-button bg-primary-50 text-primary-800 text-sm font-bold">
                  <Check className="w-4 h-4" aria-hidden="true" /> Gói hiện tại của bạn
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => onAction(tier.value)}
                  disabled={Boolean(busyTier)}
                  className={`mt-5 flex items-center justify-center gap-2 py-2.5 rounded-button text-sm font-bold transition disabled:cursor-wait ${
                    isUpgrade
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-surface border-2 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {isBusy && <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  {isUpgrade ? `Nâng lên ${tier.label}` : `Chuyển xuống ${tier.label}`}
                </button>
              ))}
          </article>
        );
      })}
    </div>
  );
};
