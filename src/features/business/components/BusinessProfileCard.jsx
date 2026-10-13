import { Link } from 'react-router';
import { ChevronRight, Store } from 'lucide-react';

// Trang hồ sơ: người dùng thường => lời mời đăng ký cửa hàng; chủ doanh nghiệp => lối tắt vào trang quản lý
export const BusinessProfileCard = ({ role }) => {
  const isBusiness = role === 'business';
  return (
    <Link
      to={isBusiness ? '/business' : '/for-business'}
      className={`group flex items-center gap-3 rounded-card p-4 shadow-card transition hover:shadow-card-hover ${
        isBusiness ? 'bg-gradient-to-br from-secondary-600 to-[#065f46] text-white' : 'bg-surface text-neutral-800'
      }`}
    >
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isBusiness ? 'bg-white/15' : 'bg-secondary-50 text-secondary-700'}`} aria-hidden="true">
        <Store className="w-5 h-5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold">{isBusiness ? 'Quản lý cửa hàng' : 'Bạn có cửa hàng?'}</span>
        <span className={`block text-xs ${isBusiness ? 'text-white/75' : 'text-neutral-500'}`}>
          {isBusiness ? 'Thống kê, ảnh / video, gói doanh nghiệp' : 'Đưa quán của bạn lên bản đồ MapMate — miễn phí'}
        </span>
      </span>
      <ChevronRight className={`w-5 h-5 shrink-0 transition group-hover:translate-x-0.5 ${isBusiness ? 'text-white/80' : 'text-neutral-300'}`} aria-hidden="true" />
    </Link>
  );
};
