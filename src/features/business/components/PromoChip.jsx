const KIND_EMOJI = { deal: '🏷️', voucher: '🎟️', checkin: '📍', lucky_wheel: '🎡' };

// Nhãn ưu đãi đang chạy trên thẻ địa điểm (VD "🏷️ -20%", "🎡 Quay là trúng")
export const PromoChip = ({ promotion, className = '' }) =>
  promotion ? (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] bg-danger-500 text-white text-[10px] font-bold shrink-0 max-w-40 truncate ${className}`} title={promotion.title}>
      {KIND_EMOJI[promotion.kind] ?? '🏷️'} {promotion.label}
    </span>
  ) : null;
