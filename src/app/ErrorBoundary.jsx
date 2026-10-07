import { Component } from 'react';
import { ErrorPage } from '../components/ErrorPage';
import { ERROR_KINDS } from '../utils/errorMessages';

// Giao diện gặp lỗi khi hiển thị (bug) => trang lỗi dễ hiểu thay vì màn hình trắng.
// Đặt `key` theo đường dẫn ở nơi dùng: chuyển trang khác là tự hết lỗi. `fullScreen` = bọc ngoài cùng (không có layout).
export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ui]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const page = <ErrorPage kind={ERROR_KINDS.CRASH} onRetry={() => window.location.reload()} />;
    return this.props.fullScreen ? <div className="h-dvh flex flex-col">{page}</div> : page;
  }
}
