import { Link, Outlet } from 'react-router';
import { X } from 'lucide-react';
import { BRAND } from '../../../config/app';
import { Toast } from '../../../components/Toast';
import { useToast } from '../../../hooks/useToast';

// Khung tối giản cho bước đăng ký cửa hàng (chưa có menu quản lý, cũng không lẫn thanh điều hướng người dùng thường)
export const OnboardingLayout = () => {
  const { toast, hideToast } = useToast();
  return (
    <div className="h-dvh flex flex-col bg-neutral-100">
      <header data-theme="light" className="h-14 shrink-0 bg-ink text-white flex items-center gap-2.5 px-4">
        <img src={BRAND.logoSrc} alt="" className="w-7 h-7" />
        <span className="font-extrabold tracking-tight">{BRAND.name}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-400">Business</span>
        <Link to="/for-business" className="ml-auto inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
          <X className="w-4 h-4" /> Thoát
        </Link>
      </header>
      <div className="flex-1 min-h-0 flex flex-col">
        <Outlet />
      </div>
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};
