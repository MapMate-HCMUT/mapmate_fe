import { useState } from 'react';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';

const PALETTE = [
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
];

// 🎛️ BẢNG KÍCH THƯỚC AVATAR
const AVATAR_SIZES = {
  xs: 'w-5 h-5 text-[10px]', //   20px — chip chọn bạn bè
  sm: 'w-8 h-8 text-sm', //       32px — Navbar, bảng xếp hạng
  md: 'w-10 h-10 text-base', //   40px
  xl: 'w-24 h-24 text-4xl', //    96px
  xxl: 'w-32 h-32 text-5xl', //   128px — avatar trang Hồ sơ (mặc định)
  xxxl: 'w-48 h-48 text-7xl', //  192px
};

const pickColor = (name = '') =>
  PALETTE[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % PALETTE.length];

// Ảnh đại diện; hỗ trợ ảnh Google (referrerPolicy), ảnh tải lên và tự động fallback sang chữ cái đầu nếu ảnh lỗi.
export const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  const [failedSrc, setFailedSrc] = useState(null);

  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?';
  const sizeClass = AVATAR_SIZES[size] || AVATAR_SIZES.md;
  const isBroken = !src || failedSrc === src;

  if (!isBroken) {
    return (
      <img
        src={resolveAssetUrl(src)}
        alt={name || 'Avatar'}
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} ${pickColor(name)} rounded-full inline-flex items-center justify-center font-bold uppercase shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
};
