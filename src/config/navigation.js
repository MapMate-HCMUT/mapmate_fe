export const NAV_ITEMS = [
  { path: '/', label: 'Bản đồ', icon: 'map', end: true },
  { path: '/explore', label: 'Khám phá', icon: 'search' },
  { path: '/ai-planner', label: 'AI Gợi ý', icon: 'chat', highlight: true },
  { path: '/vouchers', label: 'Voucher', icon: 'gift' },
  { path: '/profile', label: 'Hồ sơ', icon: 'user' },
];

// Chủ doanh nghiệp có thêm tab quản lý cửa hàng (người dùng thường vào qua menu tài khoản / trang hồ sơ)
export const BUSINESS_NAV_ITEM = { path: '/business', label: 'Cửa hàng', icon: 'store' };
// compact (thanh dưới trên mobile, tối đa 5 ô): chủ doanh nghiệp thay ô "Voucher" bằng "Cửa hàng"
export const getNavItems = (role, { compact = false } = {}) => {
  if (role !== 'business') return NAV_ITEMS;
  const items = compact ? NAV_ITEMS.filter((item) => item.path !== '/vouchers') : NAV_ITEMS;
  return [...items.slice(0, -1), BUSINESS_NAV_ITEM, items.at(-1)];
};
