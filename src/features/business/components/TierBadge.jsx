import { tierStyle } from '../utils/businessConfig';

const TIER_LABELS = { basic: 'Cơ bản', growth: 'Tăng trưởng', premium: 'Nổi bật' };

export const TierBadge = ({ tier, className = '' }) => {
  const style = tierStyle(tier);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill ring-1 text-[11px] font-bold ${style.badge} ${className}`}>
      <span aria-hidden="true">{style.emoji}</span> Gói {TIER_LABELS[tier] ?? tier}
    </span>
  );
};
