// Giao diện riêng theo gói doanh nghiệp. Quyền lợi thật (số cửa hàng, dung lượng...) lấy từ GET /api/businesses/tiers.
export const BUSINESS_TIERS = { BASIC: 'basic', GROWTH: 'growth', PREMIUM: 'premium' };

export const TIER_STYLES = {
  basic: {
    emoji: '🌱',
    badge: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
    card: 'border-neutral-200',
    accent: 'text-neutral-700',
    hero: 'from-[#334155] to-[#0f172a]',
  },
  growth: {
    emoji: '🚀',
    badge: 'bg-secondary-50 text-secondary-700 ring-secondary-200',
    card: 'border-secondary-300',
    accent: 'text-secondary-700',
    hero: 'from-secondary-600 to-[#065f46]',
  },
  premium: {
    emoji: '👑',
    badge: 'bg-accent-50 text-accent-800 ring-accent-300',
    card: 'border-accent-400',
    accent: 'text-accent-700',
    hero: 'from-accent-500 via-warning-600 to-[#b91c1c]',
  },
};
export const tierStyle = (tier) => TIER_STYLES[tier] ?? TIER_STYLES.basic;

// Loại hình chủ quán tự đăng được (khớp BUSINESS_PLACE_CATEGORIES ở backend)
export const BUSINESS_CATEGORIES = ['food', 'cafe', 'entertainment', 'shopping', 'attraction', 'park'];

export const STAT_METRICS = [
  { key: 'impressions', label: 'Lượt hiển thị', hint: 'Số người thấy cửa hàng trong kết quả tìm kiếm / mục Nổi bật' },
  { key: 'views', label: 'Lượt xem', hint: 'Số người mở thẻ chi tiết cửa hàng' },
  { key: 'directions', label: 'Lượt chỉ đường', hint: 'Số người bấm "Chỉ đường" tới cửa hàng' },
];

const MB = 1024 * 1024;
export const formatBytes = (bytes) => {
  if (bytes >= 1024 * MB) return `${(bytes / 1024 / MB).toFixed(bytes % (1024 * MB) ? 1 : 0)}GB`;
  if (bytes > 0 && bytes < MB) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${Math.round(bytes / MB)}MB`;
};
export const formatVnd = (amount) => (amount ? `${amount.toLocaleString('vi-VN')}đ/tháng` : 'Miễn phí');
// 1.284 / 12,9K — số gọn cho ô thống kê, trục biểu đồ
export const formatCompact = (value) => (value >= 1000 ? `${(value / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}K` : value.toLocaleString('vi-VN'));

// Loại khuyến mãi / sự kiện (khớp PROMOTION_KINDS ở backend); gói nào dùng được lấy từ quota.kinds của server
export const PROMOTION_KINDS = [
  { value: 'deal', emoji: '🏷️', label: 'Ưu đãi', hint: 'Hiện nhãn ưu đãi + mã chung trên thẻ quán. Đơn giản nhất.' },
  { value: 'voucher', emoji: '🎟️', label: 'Voucher giới hạn', hint: 'Phát N mã riêng, ai nhanh tay thì được. Hẹn giờ mở để tạo "giờ vàng".' },
  { value: 'checkin', emoji: '📍', label: 'Check-in nhận quà', hint: 'Khách phải tới quán (cách ≤ 200 m) mới mở được quà — kéo khách tới tận nơi.' },
  { value: 'lucky_wheel', emoji: '🎡', label: 'Vòng quay may mắn', hint: 'Mỗi khách quay 1 lần / ngày, có nhiều giải, tự đặt tỉ lệ trúng.' },
];
export const promotionKind = (value) => PROMOTION_KINDS.find((kind) => kind.value === value) ?? PROMOTION_KINDS[0];
export const PROMOTION_STATUS_STYLES = {
  active: { label: 'Đang chạy', className: 'bg-success-100 text-success-700' },
  scheduled: { label: 'Hẹn giờ', className: 'bg-info-100 text-info-700' },
  ended: { label: 'Đã kết thúc', className: 'bg-neutral-100 text-neutral-500' },
};
export const formatDateTime = (value) =>
  new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
