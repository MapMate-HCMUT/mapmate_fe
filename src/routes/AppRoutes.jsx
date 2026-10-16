import { Navigate, Route, Routes, useSearchParams } from 'react-router';
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
import { ExploreLayout, LegacyExploreRedirect, MineTab, PlacesTab } from '../features/explore';
import { ProfilePage, PublicProfilePage } from '../features/gamification';
import { MapHomePage } from '../features/map';
import { LandingPage } from '../features/landing';
import { FeedTab } from '../features/social';
import { VouchersPage } from '../features/vouchers';
import { ERROR_KINDS } from '../utils/errorMessages';
import { GuestOnlyRoute, ProtectedRoute, RequireAuthOutlet } from './ProtectedRoute';

// /vouchers?event=... (link cũ từ thẻ quán) => mục Sự kiện; còn lại là ví voucher
const WalletRoute = () => {
  const [searchParams] = useSearchParams();
  return searchParams.get('event') ? <Navigate to={`/events?${searchParams}`} replace /> : <VouchersPage view="wallet" />;
};

// Trang chủ là Khám phá; link cũ mở 1 quán trên bản đồ (/?place=..., VD thông báo khuyến mãi) => /map?place=...
const HomeRoute = () => {
  const [searchParams] = useSearchParams();
  return searchParams.get('place') ? <Navigate to={`/map?${searchParams}`} replace /> : <PlacesTab />;
};

export const AppRoutes = () => (
  <Routes>
    {/* Trang giới thiệu — công khai; bấm logo / chữ MapMate ở mọi trang sẽ về đây */}
    <Route path="welcome" element={<LandingPage />} />
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
      {/* Phải đăng nhập mới dùng được app (khách => trang giới thiệu / đăng nhập) */}
      <Route element={<RequireAuthOutlet />}>
        {/* Trang chủ = Khám phá: cột trái chọn mục (địa điểm, bảng tin, sự kiện, lộ trình, voucher, hồ sơ) */}
        <Route element={<ExploreLayout />}>
          <Route index element={<HomeRoute />} />
          <Route path="feed" element={<FeedTab />} />
          <Route path="events" element={<VouchersPage view="events" />} />
          <Route path="routes" element={<MineTab />} />
          <Route path="vouchers" element={<WalletRoute />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users/:userId" element={<PublicProfilePage />} />
        </Route>
        <Route path="map" element={<MapHomePage />} />
        <Route path="explore" element={<LegacyExploreRedirect />} />
        <Route path="ai-planner" element={<AiPlannerPage />} />
      </Route>
      <Route path="for-business" element={<BusinessLandingPage />} />
      <Route path="error" element={<ErrorRoutePage />} />
      <Route path="*" element={<ErrorPage kind={ERROR_KINDS.NOT_FOUND} />} />
    </Route>
  </Routes>
);
