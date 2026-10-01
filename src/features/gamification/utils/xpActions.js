// Nhãn hiển thị cho từng loại hoạt động trong sổ XP (khớp XP_ACTIONS của backend).
export const XP_ACTION_LABELS = {
  check_in: { label: 'Check-in địa điểm', emoji: '📍' },
  flood_report: { label: 'Báo cáo điểm ngập', emoji: '🌊' },
  road_report: { label: 'Báo cáo tình trạng đường', emoji: '🚧' },
  report_verified: { label: 'Báo cáo được xác nhận', emoji: '✅' },
  trip_completed: { label: 'Hoàn thành chuyến đi', emoji: '🗺️' },
  daily_streak: { label: 'Mở app mỗi ngày', emoji: '🔥' },
  badge_unlocked: { label: 'Mở khóa huy hiệu', emoji: '🏅' },
};

export const getXpAction = (action) => XP_ACTION_LABELS[action] ?? { label: 'Hoạt động khác', emoji: '✨' };

export const XP_HISTORY_PAGE_SIZE = 10;

export const formatDateTime = (isoDate) =>
  new Date(isoDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatJoinDate = (isoDate) => new Date(isoDate).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
