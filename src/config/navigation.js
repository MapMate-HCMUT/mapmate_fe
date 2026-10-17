// Thanh điều hướng chính: Bản đồ · Khám phá (giữa — trang chủ) · AI Gợi ý.
// Thứ tự mảng = thứ tự trên thanh (desktop) và thanh dưới (điện thoại); highlight = nút nổi ở giữa thanh dưới.
// Khám phá gồm nhiều mục (địa điểm, bảng tin, sự kiện, lộ trình, voucher, hồ sơ) — chọn ở cột trái của trang (ExploreLayout).
export const EXPLORE_SECTION_PATHS = ['/', '/feed', '/events', '/routes', '/vouchers', '/profile'];
const EXPLORE_PATH_PREFIXES = ['/users/']; // hồ sơ công khai cũng nằm trong Khám phá

export const NAV_ITEMS = [
  { path: '/map', label: 'Bản đồ', icon: 'map' },
  { path: '/', label: 'Khám phá', icon: 'search', isExplore: true, highlight: true },
  { path: '/ai-planner', label: 'AI Gợi ý', icon: 'chat', memberOnly: true }, // tài khoản khách: hiện ổ khoá, mở ra là lời mời đăng nhập
];

// Chủ doanh nghiệp có thêm nút "Cửa hàng" riêng trên thanh điều hướng (vào trang quản lý)
export const BUSINESS_NAV_ITEM = { path: '/business', label: 'Cửa hàng', icon: 'store' };

export const isExplorePath = (pathname) => EXPLORE_SECTION_PATHS.includes(pathname) || EXPLORE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const isNavItemActive = (item, pathname) => (item.isExplore ? isExplorePath(pathname) : pathname.startsWith(item.path));
