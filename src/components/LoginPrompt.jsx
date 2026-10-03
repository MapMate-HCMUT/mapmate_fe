import { Link, useLocation } from 'react-router';

// Khối nhắc đăng nhập cho những phần chỉ dành cho thành viên (bạn bè, ghim, lộ trình đã lưu...).
export const LoginPrompt = ({ icon, emoji = '🔐', title, description }) => {
  const location = useLocation();
  const redirect = encodeURIComponent(location.pathname + location.search);

  return (
    <div className="max-w-md mx-auto bg-surface rounded-card shadow-card p-8 text-center">
      <div className="flex justify-center mb-3 text-primary-600" aria-hidden="true">
        {icon ? icon : <span className="text-4xl">{emoji}</span>}
      </div>
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      <div className="mt-5 flex justify-center gap-2">
        <Link to={`/login?redirect=${redirect}`} className="px-5 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">
          Đăng nhập
        </Link>
        <Link to={`/register?redirect=${redirect}`} className="px-5 py-2.5 rounded-button bg-primary-100 hover:bg-primary-200 text-primary-700 text-sm font-semibold">
          Tạo tài khoản
        </Link>
      </div>
    </div>
  );
};
