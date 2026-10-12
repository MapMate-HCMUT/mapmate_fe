import { Store } from 'lucide-react';

/**
 * Nhãn cửa hàng do chủ doanh nghiệp tự đăng. "Tài trợ" CHỈ hiện khi nơi này đang được ưu tiên thứ hạng trong kết quả này
 * (minh bạch với người dùng: biết kết quả nào được đẩy lên nhờ gói trả phí).
 */
export const PartnerBadge = ({ business, className = '' }) => {
  if (!business) return null;
  if (business.promoted) {
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] border border-accent-300 bg-accent-50 text-accent-800 text-[10px] font-bold uppercase tracking-wide shrink-0 ${className}`} title="Cửa hàng dùng gói trả phí nên được ưu tiên hiển thị ở khu vực này">
        Tài trợ
      </span>
    );
  }
  const isPartner = business.tier !== 'basic';
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-pill bg-secondary-50 text-secondary-700 text-[10px] font-semibold shrink-0 ${className}`} title="Thông tin do chủ cửa hàng cập nhật trên MapMate">
      <Store className="w-3 h-3" aria-hidden="true" /> {isPartner ? 'Đối tác' : 'Doanh nghiệp'}
    </span>
  );
};
