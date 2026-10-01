// Dữ liệu mẫu theo collection FLOOD_ALERTS (Milestone 2 — mục 4.4). TTL thực tế: 4 giờ.
// Sẽ thay bằng API /api/flood/alerts khi backend sẵn sàng.

const MINUTE_MS = 60 * 1000;
const minutesAgo = (minutes) => new Date(Date.now() - minutes * MINUTE_MS).toISOString();

export const MOCK_FLOOD_ALERTS = [
  {
    id: 'fa_01', street: 'Đường Nguyễn Hữu Cảnh', district: 'Bình Thạnh',
    location: { type: 'Point', coordinates: [106.7172, 10.7893] },
    severity: 'high', depth_cm: 30, report_count: 23, updated_at: minutesAgo(15),
  },
  {
    id: 'fa_02', street: 'Đường Ung Văn Khiêm', district: 'Bình Thạnh',
    location: { type: 'Point', coordinates: [106.7149, 10.8065] },
    severity: 'medium', depth_cm: 20, report_count: 11, updated_at: minutesAgo(32),
  },
  {
    id: 'fa_03', street: 'Đường Huỳnh Tấn Phát', district: 'Quận 7',
    location: { type: 'Point', coordinates: [106.7287, 10.7387] },
    severity: 'medium', depth_cm: 15, report_count: 8, updated_at: minutesAgo(48),
  },
];
