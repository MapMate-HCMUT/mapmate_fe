import { Navigate } from 'react-router';
import { useAuth } from '../../../hooks/useAuth';
import { BusinessLanding } from '../components/BusinessLanding';

// /for-business — giới thiệu cho chủ cửa hàng (trong giao diện người dùng thường). Đã là doanh nghiệp => vào trang quản lý.
export const BusinessLandingPage = () => {
  const { user } = useAuth();
  if (user?.role === 'business') return <Navigate to="/business" replace />;
  return (
    <section className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="w-full max-w-5xl mx-auto p-4 lg:p-6">
        <BusinessLanding />
      </div>
    </section>
  );
};
