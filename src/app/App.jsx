import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter } from 'react-router';
import { AppRoutes } from '../routes/AppRoutes';
import { ErrorBoundary } from './ErrorBoundary';
import { OfflineGate } from './OfflineGate';

// Thống kê lượt truy cập (Vercel Web Analytics) — chỉ dev xem trong dashboard Vercel, người dùng không thấy gì trên trang.
// Không cookie; chạy dev (npm run dev) thì không gửi. Bỏ phần ?... của đường dẫn (câu hỏi AI, mã bài viết) trước khi gửi.
const withoutQuery = (event) => ({ ...event, url: event.url.split(/[?#]/)[0] });

export const App = () => (
  <BrowserRouter>
    <ErrorBoundary fullScreen>
      <OfflineGate>
        <AppRoutes />
      </OfflineGate>
    </ErrorBoundary>
    <Analytics beforeSend={withoutQuery} />
  </BrowserRouter>
);
