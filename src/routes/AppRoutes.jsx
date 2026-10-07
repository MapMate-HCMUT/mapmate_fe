import { Navigate, Route, Routes } from 'react-router';
import { ErrorRoutePage } from '../app/ErrorRoutePage';
import { MainLayout } from '../app/MainLayout';
import { ErrorPage } from '../components/ErrorPage';
import { AiPlannerPage } from '../features/ai-planner';
import { LoginPage } from '../features/auth';
import { ExplorePage } from '../features/explore';
import { ProfilePage, PublicProfilePage } from '../features/gamification';
import { MapHomePage } from '../features/map';
import { ERROR_KINDS } from '../utils/errorMessages';
import { GuestOnlyRoute, ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => (
  <Routes>
    <Route path="login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
    <Route path="register" element={<Navigate to="/login" replace />} />

    <Route element={<MainLayout />}>
      <Route index element={<MapHomePage />} />
      <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="users/:userId" element={<PublicProfilePage />} />
      <Route path="explore" element={<ExplorePage />} />
      <Route path="ai-planner" element={<AiPlannerPage />} />
      <Route path="error" element={<ErrorRoutePage />} />
      <Route path="*" element={<ErrorPage kind={ERROR_KINDS.NOT_FOUND} />} />
    </Route>
  </Routes>
);
