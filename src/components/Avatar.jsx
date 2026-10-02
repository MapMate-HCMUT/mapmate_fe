import { resolveAssetUrl } from '../utils/resolveAssetUrl';

const PALETTE = ['bg-primary-100 text-primary-700', 'bg-info-100 text-info-700', 'bg-accent-100 text-accent-700', 'bg-secondary-100 text-secondary-700', 'bg-warning-100 text-warning-700'];

// 🎛️ BẢNG KÍCH THƯỚC AVATAR — sửa ở đây để đổi size cho mọi nơi dùng size đó.
// w-/h- theo đơn vị Tailwind (1 = 4px): w-24 = 96px, w-32 = 128px, w-40 = 160px, w-48 = 192px.
// text-* là cỡ chữ cái đầu khi người dùng chưa có ảnh.
const AVATAR_SIZES = {
  sm: 'w-8 h-8 text-sm', //       32px — Navbar, bảng xếp hạng
  md: 'w-10 h-10 text-base', //   40px
  xl: 'w-24 h-24 text-4xl', //    96px
  xxl: 'w-32 h-32 text-5xl', //   128px — avatar trang Hồ sơ (mặc định)
  xxxl: 'w-48 h-48 text-7xl', //  192px
};

const pickColor = (name = '') => PALETTE[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % PALETTE.length];

// Ảnh đại diện; chưa có ảnh thì hiện chữ cái đầu với màu cố định theo tên.
export const Avatar = ({ name, src, size = 'md', className = '' }) =>
  src ? (
    <img src={resolveAssetUrl(src)} alt={name} className={`${AVATAR_SIZES[size]} rounded-pill object-cover ${className}`} />
  ) : (
    <span className={`${AVATAR_SIZES[size]} ${pickColor(name)} rounded-pill inline-flex items-center justify-center font-bold uppercase shrink-0 ${className}`} aria-hidden="true">
      {name?.[0] ?? '?'}
    </span>
  );
