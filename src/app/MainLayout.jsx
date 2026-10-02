import { Outlet } from 'react-router';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { TopNavbar } from '../components/layout/TopNavbar';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

// Layout chung: mọi trang đều có Navbar (chứa Logo) + Bottom Nav trên mobile.
export const MainLayout = () => {
  const { toast, hideToast } = useToast();

  return (
    <div className="h-dvh flex flex-col bg-neutral-50">
      <TopNavbar />
      <main className="flex-1 min-h-0 flex flex-col">
        <Outlet />
      </main>
      <MobileBottomNav />
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};
