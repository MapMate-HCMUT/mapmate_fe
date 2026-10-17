import { BRAND } from '../../../config/app';

const SIZES = {
  sm: 'h-7 w-7 rounded-lg p-0.5',
  lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1.5',
};

// Ảnh đại diện của MapMate AI = logo MapMate (đổi logo ở BRAND.logoSrc là đổi luôn ở đây)
export const AiAvatar = ({ size = 'sm', className = '' }) => (
  <span className={`flex shrink-0 items-center justify-center bg-surface ring-1 ring-neutral-200 shadow-xs ${SIZES[size]} ${className}`}>
    <img src={BRAND.logoSrc} alt="" aria-hidden="true" className="h-full w-full object-contain" />
  </span>
);
