import { Navigate, Route, Routes } from 'react-router';
import { ErrorRoutePage } from '../app/ErrorRoutePage';
import { MainLayout } from '../app/MainLayout';
import { ErrorPage } from '../components/ErrorPage';
import { AiPlannerPage } from '../features/ai-planner';
import { LoginPage } from '../features/auth';
import {
  BusinessConsoleLayout,
  BusinessInsightsPage,
  BusinessLandingPage,
  BusinessOverviewPage,
  BusinessPlansPage,
  BusinessPromotionsPage,
  BusinessRedeemPage,
  BusinessRegisterPage,
  BusinessReviewsPage,
  BusinessSettingsPage,
  BusinessStoreEditorPage,
  BusinessStoresPage,
  OnboardingLayout,
} from '../features/business';
import { ExplorePage } from '../features/explore';
import { ProfilePage, PublicProfilePage } from '../features/gamification';
import { MapHomePage } from '../features/map';
import { VouchersPage } from '../features/vouchers';
import { ERROR_KINDS } from '../utils/errorMessages';
import { GuestOnlyRoute, ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => (
  <Routes>
    <Route path="login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
    <Route path="register" element={<Navigate to="/login" replace />} />

    {/* Chủ doanh nghiệp: giao diện quản lý riêng (menu tối, không có thanh điều hướng người dùng thường) */}
    <Route path="business/register" element={<ProtectedRoute><OnboardingLayout /></ProtectedRoute>}>
      <Route index element={<BusinessRegisterPage />} />
    </Route>
    <Route path="business" element={<BusinessConsoleLayout />}>
      <Route index element={<BusinessOverviewPage />} />
      <Route path="stores" element={<BusinessStoresPage />} />
      <Route path="stores/new" element={<BusinessStoreEditorPage />} />
      <Route path="stores/:placeId" element={<BusinessStoreEditorPage />} />
      <Route path="promotions" element={<BusinessPromotionsPage />} />
      <Route path="redeem" element={<BusinessRedeemPage />} />
      <Route path="reviews" element={<BusinessReviewsPage />} />
      <Route path="insights" element={<BusinessInsightsPage />} />
      <Route path="plans" element={<BusinessPlansPage />} />
      <Route path="settings" element={<BusinessSettingsPage />} />
    </Route>

    <Route element={<MainLayout />}>
      <Route index element={<MapHomePage />} />
      <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="users/:userId" element={<PublicProfilePage />} />
      <Route path="explore" element={<ExplorePage />} />
      <Route path="ai-planner" element={<AiPlannerPage />} />
      <Route path="for-business" element={<BusinessLandingPage />} />
      <Route path="vouchers" element={<VouchersPage />} />
      <Route path="error" element={<ErrorRoutePage />} />
      <Route path="*" element={<ErrorPage kind={ERROR_KINDS.NOT_FOUND} />} />
    </Route>
  </Routes>
);
