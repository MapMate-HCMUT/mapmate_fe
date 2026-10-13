import { PROMOTION_STATUS_STYLES } from '../utils/businessConfig';

export const PromotionStatusPill = ({ status }) => {
  const style = PROMOTION_STATUS_STYLES[status] ?? PROMOTION_STATUS_STYLES.ended;
  return <span className={`shrink-0 px-2 py-0.5 rounded-pill text-[11px] font-bold ${style.className}`}>{style.label}</span>;
};
