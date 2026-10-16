import { Bus, CalendarHeart, Map, MessagesSquare, Sparkles, Trophy } from 'lucide-react';

export const SLOGAN = 'MapMate — bạn đồng hành trên mọi hành trình';

// Các con số trên trang giới thiệu (key = trường của GET /api/stats/public)
export const STAT_ITEMS = [
  { key: 'users', label: 'Người dùng', hint: 'tài khoản đã đăng ký' },
  { key: 'places', label: 'Địa điểm', hint: 'quán ăn, cà phê, vui chơi khắp TP.HCM' },
  { key: 'transit_routes', label: 'Tuyến buýt & metro', hint: 'kèm giờ xe tới trạm theo thời gian thực' },
  { key: 'transit_stops', label: 'Trạm dừng', hint: 'tìm cách đi bằng phương tiện công cộng' },
  { key: 'ai_conversations', label: 'Cuộc trò chuyện với AI', hint: 'lộ trình được AI lên theo yêu cầu' },
  { key: 'itineraries', label: 'Lộ trình đã lưu', hint: 'người dùng tự lên và lưu lại' },
];

export const FEATURES = [
  {
    icon: Map,
    title: 'Khám phá địa điểm',
    text: 'Lọc quán theo ngân sách, khoảng cách, phong cách (hẹn hò, gia đình, yên tĩnh…) và xem quán đang hot quanh bạn.',
    tone: 'bg-primary-50 text-primary-700',
  },
  {
    icon: Sparkles,
    title: 'AI gợi ý lộ trình',
    text: 'Kể nhu cầu bằng tiếng Việt — AI lên lộ trình từ dữ liệu thật, sửa từng điểm theo ý bạn, canh giờ về và giờ mở cửa.',
    tone: 'bg-secondary-50 text-secondary-700',
  },
  {
    icon: Bus,
    title: 'Chỉ đường mọi phương tiện',
    text: 'Xe máy, đi bộ, xe buýt và Metro số 1 — tuyến nào, lên trạm nào, xuống trạm nào đều có sẵn.',
    tone: 'bg-info-50 text-info-700',
  },
  {
    icon: MessagesSquare,
    title: 'Bảng tin cộng đồng',
    text: 'Đăng ảnh, video, đánh giá quán; bình luận và chia sẻ lộ trình với bạn bè.',
    tone: 'bg-accent-50 text-accent-800',
  },
  {
    icon: CalendarHeart,
    title: 'Sự kiện & voucher',
    text: 'Săn voucher giờ vàng, check-in nhận quà, vòng quay may mắn từ các quán quanh bạn.',
    tone: 'bg-warning-50 text-warning-800',
  },
  {
    icon: Trophy,
    title: 'Thành tích & XP',
    text: 'Check-in nhận XP, giữ chuỗi ngày, mở khoá huy hiệu và leo bảng xếp hạng cùng bạn bè.',
    tone: 'bg-success-50 text-success-700',
  },
];

export const STEPS = [
  { title: 'Đăng nhập bằng Google', text: 'Chỉ 1 chạm, không cần tạo mật khẩu.' },
  { title: 'Kể cho MapMate bạn muốn đi đâu', text: 'Hỏi AI, hoặc lọc địa điểm theo túi tiền và khoảng cách.' },
  { title: 'Lưu lộ trình và lên đường', text: 'Xem trên bản đồ, chỉ đường từng chặng, check-in nhận XP.' },
];
