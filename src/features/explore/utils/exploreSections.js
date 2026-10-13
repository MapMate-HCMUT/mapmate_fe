import { Compass, Newspaper, PartyPopper, Route, Ticket, UserRound } from 'lucide-react';

// Các mục của trang Khám phá (cột trái kiểu Facebook). group: 'explore' = khám phá chung, 'mine' = của riêng bạn.
// Hồ sơ nằm ở thẻ đầu cột (ảnh đại diện + tên) như Facebook; trên điện thoại hiện cùng hàng nút cuộn ngang.
export const EXPLORE_SECTIONS = [
  { path: '/', label: 'Địa điểm', hint: 'Tìm quán & lên chuyến đi', icon: Compass, group: 'explore', end: true },
  { path: '/feed', label: 'Bảng tin', hint: 'Bạn bè & cộng đồng chia sẻ', icon: Newspaper, group: 'explore' },
  { path: '/events', label: 'Sự kiện', hint: 'Săn voucher, vòng quay quanh bạn', icon: PartyPopper, group: 'explore' },
  { path: '/routes', label: 'Lộ trình của tôi', hint: 'Lộ trình đã lưu & địa điểm đã ghim', icon: Route, group: 'mine' },
  { path: '/vouchers', label: 'Voucher của tôi', hint: 'Ví voucher đã săn', icon: Ticket, group: 'mine' },
  { path: '/profile', label: 'Hồ sơ', hint: 'Cấp độ, bạn bè, thông báo', icon: UserRound, group: 'mine', isProfile: true },
];

export const EXPLORE_GROUPS = [
  { value: 'explore', label: 'Khám phá' },
  { value: 'mine', label: 'Của bạn' },
];

// Link cũ /explore?tab=... (thông báo, link chia sẻ đã gửi) => mục mới tương ứng
export const LEGACY_TAB_PATHS = { places: '/', feed: '/feed', mine: '/routes', friends: '/profile' };
