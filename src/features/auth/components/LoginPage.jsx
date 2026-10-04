import { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { FormAlert } from '../../../components/form/FormAlert';
import { useToast } from '../../../hooks/useToast';
import { useAuthStore } from '../../../stores/authStore';
import { googleLoginApi } from '../api/authApi';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { AuthLayout } from './AuthLayout';

// Logo đa màu sắc chuẩn Google
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
    />
  </svg>
);

export const LoginPage = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const { showToast } = useToast();
  const { goToRedirect } = useAuthRedirect();
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const googleBtnContainerRef = useRef(null);
  const tokenClientRef = useRef(null);

  const handleLoginSuccess = useCallback(
    (session) => {
      setSession(session, remember);
      showToast(`Chào mừng ${session.user.username} đến với MapMate!`);
      goToRedirect();
    },
    [setSession, remember, showToast, goToRedirect],
  );

  const handleGoogleLogin = useCallback(
    async (payload) => {
      setIsLoading(true);
      setFormError('');
      try {
        const session = await googleLoginApi(payload);
        handleLoginSuccess(session);
      } catch (err) {
        setFormError(err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    },
    [handleLoginSuccess],
  );

  // Khởi tạo Google Identity Services & OAuth2 Token Client
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google?.accounts) return;

      // 1. Khởi tạo Google ID Token (One Tap / Sign In with Google)
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              handleGoogleLogin({ credential: response.credential });
            }
          },
          auto_select: false,
        });

        if (googleBtnContainerRef.current) {
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: 340,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }
      } catch (err) {
        console.warn('Lỗi khởi tạo Google ID:', err);
      }

      // 2. Khởi tạo Token Client để mở Popup khi người dùng bấm nút tùy chỉnh
      try {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                setIsLoading(true);
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();
                if (profile.email) {
                  await handleGoogleLogin({
                    email: profile.email,
                    name: profile.name || profile.given_name,
                    picture: profile.picture,
                    google_id: profile.sub,
                  });
                } else {
                  throw new Error('Không thể lấy email từ tài khoản Google');
                }
              } catch (err) {
                setFormError(err.message || 'Lỗi xác thực thông tin tài khoản Google');
                setIsLoading(false);
              }
            }
          },
        });
      } catch (err) {
        console.warn('Lỗi khởi tạo Token Client:', err);
      }
    };

    if (window.google?.accounts) {
      initGoogle();
    } else {
      // Đợi script tải xong
      const interval = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleGoogleLogin]);

  const handleCustomButtonClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setFormError('Chưa cấu hình VITE_GOOGLE_CLIENT_ID trong biến môi trường (.env)');
      return;
    }

    if (tokenClientRef.current) {
      // Mở Popup đăng nhập Google chính thức
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setFormError('Đang tải dịch vụ Google Sign-In, vui lòng thử lại sau giây lát…');
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Đăng nhập nhanh bằng tài khoản Google để trải nghiệm đầy đủ tính năng 🚀"
      footer={
        <div className="space-y-2 text-xs text-neutral-500">
          <p className="flex items-center justify-center gap-1.5 text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Bảo mật dữ liệu cá nhân & đồng bộ lộ trình an toàn</span>
          </p>
          <p>Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ & Chính sách của MapMate.</p>
        </div>
      }
    >
      <div className="space-y-5">
        <FormAlert message={formError} />

        {/* Nút đăng nhập Google chính thức */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleCustomButtonClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 font-bold text-sm shadow-xs transition hover:shadow-md cursor-pointer disabled:opacity-60"
          >
            <GoogleIcon />
            <span>{isLoading ? 'Đang kết nối Google…' : 'Tiếp tục với Google'}</span>
          </button>

          {/* Vùng render nút Google iframe mặc định (dự phòng) */}
          <div ref={googleBtnContainerRef} className="flex justify-center empty:hidden" />

          <label className="flex items-center gap-2.5 text-xs font-medium text-neutral-700 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
            />
            <span>Ghi nhớ đăng nhập trên thiết bị này</span>
          </label>
        </div>
      </div>
    </AuthLayout>
  );
};
