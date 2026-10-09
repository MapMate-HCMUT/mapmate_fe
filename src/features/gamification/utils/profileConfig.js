export const PROFILE_TABS = [
  { value: 'overview', label: 'Tổng quan', emoji: '🏆' },
  { value: 'posts', label: 'Bài viết & đánh giá', emoji: '📝' },
  { value: 'activity', label: 'Hoạt động', emoji: '🗓️' },
  { value: 'notifications', label: 'Thông báo', emoji: '🔔' },
  { value: 'personal', label: 'Thông tin cá nhân', emoji: '🪪' },
];
export const DEFAULT_PROFILE_TAB = 'overview';

// 🎛️ SIZE AVATAR Ở TRANG HỒ SƠ — chọn 1 key trong AVATAR_SIZES (src/components/Avatar.jsx): 'xl' | 'xxl' | 'xxxl'
export const PROFILE_AVATAR_SIZE = 'xxl';

// Avatar đè lên dải màu phía trên đúng 1 nửa chiều cao => tự khớp theo size đã chọn.
export const PROFILE_AVATAR_OVERLAP = { xl: '-mt-12', xxl: '-mt-16', xxxl: '-mt-24' };

export const AVATAR_OUTPUT_SIZE = 256;
export const AVATAR_CROP_VIEWPORT = 320; // px — vẫn vừa màn hình điện thoại 360px (modal mobile rộng 100%)
export const AVATAR_INPUT_MAX_MB = 10;
export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';

// Avatar minh hoạ có sẵn (DiceBear — miễn phí, không cần key)
const PRESET_SEEDS = ['Saigon', 'Hanoi', 'Pho', 'Banhmi', 'Lotus', 'Mekong', 'Dalat', 'Hue'];
export const AVATAR_PRESETS = PRESET_SEEDS.map((seed) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`);

export const CITY_SUGGESTIONS = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế', 'Khánh Hòa', 'Lâm Đồng', 'Đồng Nai', 'Bình Dương'];
export const DEFAULT_COUNTRY = 'Việt Nam';

// "2004-08-17T00:00:00.000Z" -> "2004-08-17" (giá trị cho <input type="date">)
export const toDateInputValue = (isoDate) => (isoDate ? isoDate.slice(0, 10) : '');

export const formatBirthDate = (isoDate) =>
  isoDate ? new Date(isoDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }) : null;

export const formatHomeArea = (area) =>
  area ? [area.street, area.district, area.city, area.country].filter(Boolean).join(', ') || null : null;
