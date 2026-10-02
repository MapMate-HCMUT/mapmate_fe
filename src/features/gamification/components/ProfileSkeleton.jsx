export const ProfileSkeleton = () => (
  <div className="grid lg:grid-cols-[1fr_380px] gap-5 animate-pulse" aria-label="Đang tải hồ sơ">
    <div className="space-y-5">
      <div className="h-80 bg-surface rounded-card shadow-card" />
      <div className="h-28 bg-surface rounded-card shadow-card" />
    </div>
    <div className="h-96 bg-surface rounded-card shadow-card" />
  </div>
);

export const ProfileError = ({ message, onRetry }) => (
  <div className="max-w-sm mx-auto mt-16 text-center bg-surface rounded-card shadow-card p-8">
    <p className="text-3xl mb-2">😵</p>
    <p className="font-bold text-neutral-800">Không tải được hồ sơ</p>
    <p className="mt-1 text-sm text-neutral-500">{message}</p>
    <button type="button" onClick={onRetry} className="mt-5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-button text-sm font-semibold">
      Thử lại
    </button>
  </div>
);
