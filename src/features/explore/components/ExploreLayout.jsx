import { Navigate, Outlet, useSearchParams } from 'react-router';
import { EXPLORE_SIDEBAR_WIDTH } from '../../../config/layout';
import { LEGACY_TAB_PATHS } from '../utils/exploreSections';
import { ExploreMobileNav, ExploreSidebar } from './ExploreSidebar';

// Trang Khám phá (trang chủ): cột trái chọn mục (kiểu Facebook) + nội dung mục đang chọn.
// Cả trang cuộn chung 1 thanh => cột trái và các khung "dính" (chuyến đi, bảng xếp hạng) bám theo khi cuộn.
// Không giới hạn bề rộng: menu trái & cột phải bám sát lề (thẳng hàng với thanh điều hướng), cột giữa nằm chính giữa (config/layout.js).
export const ExploreLayout = () => (
  <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-50">
    <div className="w-full px-4 lg:px-6 py-4 lg:py-6 lg:flex lg:items-start lg:gap-6">
      <aside className={`hidden lg:block ${EXPLORE_SIDEBAR_WIDTH} shrink-0 sticky top-6`}>
        <ExploreSidebar />
      </aside>
      <div className="flex-1 min-w-0">
        <div className="lg:hidden">
          <ExploreMobileNav />
        </div>
        <Outlet />
      </div>
    </div>
  </div>
);

// /explore?tab=feed&post=... (link cũ trong thông báo / tin nhắn chia sẻ) => mục mới, giữ các tham số còn lại
export const LegacyExploreRedirect = () => {
  const [searchParams] = useSearchParams();
  const next = new URLSearchParams(searchParams);
  const tab = next.get('tab');
  next.delete('tab');
  if (tab === 'friends') next.set('tab', 'friends'); // bạn bè là 1 tab trong Hồ sơ
  const query = next.toString();
  return <Navigate to={`${LEGACY_TAB_PATHS[tab] ?? '/'}${query ? `?${query}` : ''}`} replace />;
};
