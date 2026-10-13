// Xem trước khuyến mãi hiện thế nào với khách (thẻ quán + ô sự kiện) — cập nhật ngay khi chủ quán gõ
export const PromotionPreview = ({ kind, form, placeName }) => {
  const label = form.label || 'Nhãn';
  const isHunt = kind.value !== 'deal';
  return (
    <div className="rounded-card border border-dashed border-neutral-300 bg-neutral-50 p-3 space-y-2.5">
      <div className="flex items-center gap-2 bg-surface rounded-input p-2.5 shadow-xs">
        <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-lg" aria-hidden="true">☕</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{placeName ?? 'Cửa hàng của bạn'}</p>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-danger-500 text-white text-[10px] font-bold">
            {kind.emoji} {label}
          </span>
        </div>
      </div>
      <div className="rounded-input bg-gradient-to-r from-danger-500 to-warning-500 text-white p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">{kind.label}</p>
        <p className="font-bold leading-snug">{form.title || 'Tên chương trình'}</p>
        {form.description && <p className="mt-0.5 text-xs text-white/85 line-clamp-2">{form.description}</p>}
        <p className="mt-2 inline-flex px-3 py-1 rounded-pill bg-white text-danger-600 text-xs font-bold">
          {isHunt ? (kind.value === 'lucky_wheel' ? '🎡 Quay ngay' : kind.value === 'checkin' ? '📍 Check-in nhận quà' : '🎟️ Săn ngay') : form.code ? `Mã: ${form.code.toUpperCase()}` : label}
        </p>
      </div>
    </div>
  );
};
