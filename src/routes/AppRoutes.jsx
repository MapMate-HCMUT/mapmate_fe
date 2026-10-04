import { Route, Routes } from 'react-router';
import { MainLayout } from '../app/MainLayout';
import { ComingSoonPage } from '../components/ComingSoonPage';
import { AiPlannerPage } from '../features/ai-planner';
import { LoginPage, RegisterPage } from '../features/auth';
import { ExplorePage } from '../features/explore';
import { ProfilePage, PublicProfilePage } from '../features/gamification';
import { MapHomePage } from '../features/map';
import { GuestOnlyRoute, ProtectedRoute } from './ProtectedRoute';

const PLACEHOLDER_PAGES = [
  { path: 'alerts', title: 'Cảnh báo ngập', description: 'Theo dõi điểm ngập thời gian thực và chọn tuyến đường an toàn.' },
];

export const AppRoutes = () => (
  <Routes>
    <Route path="login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
    <Route path="register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />

    <Route element={<MainLayout />}>
      <Route index element={<MapHomePage />} />
      <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="users/:userId" element={<PublicProfilePage />} />
      <Route path="explore" element={<ExplorePage />} />
      <Route path="ai-planner" element={<AiPlannerPage />} />
      {PLACEHOLDER_PAGES.map((page) => (
        <Route key={page.path} path={page.path} element={<ComingSoonPage title={page.title} description={page.description} />} />
      ))}
      <Route path="*" element={<ComingSoonPage title="Không tìm thấy trang" description="Đường dẫn này không tồn tại." />} />
    </Route>
  </Routes>
);
