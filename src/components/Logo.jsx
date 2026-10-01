import { Link } from 'react-router';
import { BRAND } from '../config/app';

const SIZES = {
  sm: { img: 'w-7 h-7', text: 'text-lg' },
  md: { img: 'w-9 h-9', text: 'text-xl' },
  lg: { img: 'w-14 h-14', text: 'text-3xl' },
};

// 🖼️ VỊ TRÍ LOGO — component này xuất hiện trên header của MỌI trang.
// Thay logo: ghi đè file public/logo.svg (hoặc sửa BRAND.logoSrc trong src/config/app.js).
export const Logo = ({ size = 'md', showName = true }) => {
  const sizeClass = SIZES[size];

  return (
    <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={`${BRAND.name} — Trang chủ`}>
      <img src={BRAND.logoSrc} alt={BRAND.logoAlt} className={`${sizeClass.img} object-contain`} />
      {showName && (
        <span className={`${sizeClass.text} font-extrabold tracking-tight text-primary-600`}>{BRAND.name}</span>
      )}
    </Link>
  );
};
