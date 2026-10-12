import { ChartColumn, Crown, LayoutDashboard, MessageSquareText, ScanLine, Settings, Store, TicketPercent } from 'lucide-react';

// Menu trang quản lý doanh nghiệp (badge: số liệu lấy từ GET /api/businesses/me)
export const CONSOLE_NAV = [
  { path: '/business', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { path: '/business/stores', label: 'Cửa hàng', icon: Store },
  { path: '/business/promotions', label: 'Khuyến mãi & Voucher', icon: TicketPercent },
  { path: '/business/redeem', label: 'Xác nhận voucher', icon: ScanLine },
  { path: '/business/reviews', label: 'Đánh giá', icon: MessageSquareText, badge: (data) => data.unreplied_reviews },
  { path: '/business/insights', label: 'Thống kê', icon: ChartColumn },
  { path: '/business/plans', label: 'Gói dịch vụ', icon: Crown },
  { path: '/business/settings', label: 'Hồ sơ doanh nghiệp', icon: Settings },
];

export const consoleTitle = (pathname) =>
  [...CONSOLE_NAV].sort((a, b) => b.path.length - a.path.length).find((item) => pathname.startsWith(item.path))?.label ?? 'Tổng quan';
