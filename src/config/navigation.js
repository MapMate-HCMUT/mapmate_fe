// Thanh điều hướng chính: Bản đồ · AI Gợi ý (giữa) · Khám phá (trang chủ).
// Khám phá gồm nhiều mục (địa điểm, bảng tin, sự kiện, lộ trình, voucher, hồ sơ) — chọn ở cột trái của trang (ExploreLayout).
export const EXPLORE_SECTION_PATHS = ['/', '/feed', '/events', '/routes', '/vouchers', '/profile'];
const EXPLORE_PATH_PREFIXES = ['/users/']; // hồ sơ công khai cũng nằm trong Khám phá

export const NAV_ITEMS = [
  { path: '/map', label: 'Bản đồ', icon: 'map' },
  { path: '/ai-planner', label: 'AI Gợi ý', icon: 'chat', highlight: true },
  { path: '/', label: 'Khám phá', icon: 'search', isExplore: true },
];

// Chủ doanh nghiệp có thêm nút "Cửa hàng" riêng trên thanh điều hướng (vào trang quản lý)
export const BUSINESS_NAV_ITEM = { path: '/business', label: 'Cửa hàng', icon: 'store' };

export const isExplorePath = (pathname) => EXPLORE_SECTION_PATHS.includes(pathname) || EXPLORE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const isNavItemActive = (item, pathname) => (item.isExplore ? isExplorePath(pathname) : pathname.startsWith(item.path));
