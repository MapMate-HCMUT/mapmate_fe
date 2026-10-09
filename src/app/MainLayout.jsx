import { Outlet, useLocation } from 'react-router';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { TopNavbar } from '../components/layout/TopNavbar';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { PlaceReviewsModal, PostComposerModal } from '../features/social';
import { ErrorBoundary } from './ErrorBoundary';

// Layout chung: mọi trang đều có Navbar (chứa Logo) + Bottom Nav trên mobile.
export const MainLayout = () => {
  const { toast, hideToast } = useToast();
  const { pathname } = useLocation();

  return (
    <div className="h-dvh flex flex-col bg-neutral-50">
      <TopNavbar />
      <main className="flex-1 min-h-0 flex flex-col">
        {/* 1 trang hỏng => trang lỗi dễ hiểu, Navbar vẫn dùng được; chuyển trang khác là hết lỗi */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <MobileBottomNav />
      {/* Khung đăng bài / đánh giá địa điểm dùng chung mọi trang (mở qua socialStore) */}
      <PlaceReviewsModal />
      <PostComposerModal />
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};
