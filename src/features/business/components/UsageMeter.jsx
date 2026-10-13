// Thanh mức sử dụng: phần đã dùng đổi màu theo mức (xanh -> cam -> đỏ), phần trống là bậc nhạt của cùng màu
const LEVELS = [
  { from: 0.9, fill: 'bg-danger-500', track: 'bg-danger-100' },
  { from: 0.7, fill: 'bg-warning-500', track: 'bg-warning-100' },
  { from: 0, fill: 'bg-primary-500', track: 'bg-primary-100' },
];

// warn = false: đầy cũng bình thường (VD gói 1 cửa hàng đang có 1 cửa hàng) => không tô cam / đỏ
export const UsageMeter = ({ label, used, total, format = String, hint, warn = true }) => {
  const ratio = total > 0 ? Math.min(1, used / total) : 0;
  const level = warn ? LEVELS.find((item) => ratio >= item.from) : LEVELS.at(-1);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold text-neutral-700">{label}</span>
        <span className="text-neutral-500">
          <b className="text-neutral-900">{format(used)}</b> / {format(total)}
        </span>
      </div>
      <div
        className={`h-2 rounded-pill overflow-hidden ${level.track}`}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={used}
        aria-valuetext={`${format(used)} / ${format(total)}`}
      >
        <div className={`h-full rounded-pill ${level.fill} transition-[width] duration-500`} style={{ width: `${Math.max(ratio * 100, used > 0 ? 2 : 0)}%` }} />
      </div>
      {hint && <p className="text-[11px] text-neutral-500">{hint}</p>}
    </div>
  );
};
