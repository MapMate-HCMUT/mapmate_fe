import { MAP_PROVIDERS } from '../../../config/map';

// Trạng thái tải / lỗi của bản đồ.
export const MapStatusOverlay = ({ isReady, error }) => {
  if (error) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-100 p-6">
        <div className="max-w-xs text-center bg-surface rounded-card shadow-card p-6">
          <p className="text-3xl mb-2">🗺️</p>
          <p className="text-sm font-bold text-neutral-800">Không tải được bản đồ</p>
          <p className="text-xs text-neutral-500 mt-1">Kiểm tra kết nối mạng hoặc API key bản đồ rồi tải lại trang.</p>
        </div>
      </div>
    );
  }

  if (isReady) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-neutral-100">
      <div className="w-10 h-10 rounded-pill border-4 border-primary-200 border-t-primary-600 animate-spin" />
      <p className="text-sm text-neutral-500">Đang tải bản đồ…</p>
    </div>
  );
};

// Nhãn nhỏ cho team biết đang dùng nguồn bản đồ nào.
export const MapProviderBadge = ({ provider }) => (
  <span className="hidden lg:inline-flex absolute left-3 bottom-3 z-10 items-center gap-1.5 px-2.5 py-1 rounded-pill bg-surface/90 backdrop-blur text-[11px] font-medium text-neutral-600 shadow-card">
    <span className={`w-1.5 h-1.5 rounded-pill ${provider === MAP_PROVIDERS.GOONG ? 'bg-success-500' : 'bg-accent-500'}`} />
    {provider === MAP_PROVIDERS.GOONG ? 'Goong Maps' : 'Bản đồ tạm: OpenFreeMap'}
  </span>
);
