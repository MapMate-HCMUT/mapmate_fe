const SKELETON_ROWS = 5;

export const PlaceListSkeleton = () => (
  <ul className="space-y-2" aria-label="Đang tải địa điểm">
    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
      <li key={index} className="flex gap-3 p-2.5 animate-pulse">
        <div className="w-14 h-14 rounded-button bg-neutral-200" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 w-3/4 rounded-pill bg-neutral-200" />
          <div className="h-3 w-1/2 rounded-pill bg-neutral-200" />
          <div className="h-3 w-2/3 rounded-pill bg-neutral-100" />
        </div>
      </li>
    ))}
  </ul>
);
