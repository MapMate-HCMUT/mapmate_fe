import { CheckCircle2, ChevronRight, Navigation, Square } from 'lucide-react';
import { getVehicleLabel } from '../../itinerary';

// Thanh điều hướng nổi trên mobile hoặc bản đồ khi đang đi theo lộ trình
export const ActiveRouteBanner = ({
  itinerary,
  routeData,
  activeStopIndex,
  onSelectStop,
  onStopTrip,
  isLoadingRoute,
}) => {
  if (!itinerary) return null;

  const stops = itinerary.stops || [];
  const currentStop = stops[activeStopIndex] || stops[0];
  const vehicle = getVehicleLabel(itinerary.vehicle);
  const currentLeg = routeData?.legs?.[activeStopIndex];

  return (
    <div className="bg-surface/95 backdrop-blur-md rounded-2xl border border-blue-500/30 p-3 sm:p-4 shadow-xl space-y-2.5 max-w-xl mx-auto ring-1 ring-blue-500/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-sm animate-pulse">
            <Navigation className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Đang dẫn đường
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                {vehicle.emoji} {vehicle.label}
              </span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 truncate mt-0.5">
              {routeData?.primaryRoad || itinerary.name}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onStopTrip}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-danger-50 hover:text-danger-600 text-neutral-700 text-xs font-semibold transition shrink-0"
          title="Kết thúc dẫn đường"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Dừng</span>
        </button>
      </div>

      {/* Thông tin chặng hiện tại */}
      <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
        <div className="min-w-0 flex-1 pr-2">
          <p className="font-bold text-neutral-900 truncate">
            <span className="text-blue-600 mr-1">Điểm {activeStopIndex + 1}/{stops.length}:</span>
            {currentStop.place?.name || currentStop.place_name}
          </p>
          <p className="text-neutral-500 truncate text-[11px] mt-0.5">
            {currentStop.place?.address || currentStop.address || 'Đang cập nhật địa chỉ'}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="font-extrabold text-blue-700 text-sm">
            {isLoadingRoute ? 'Đang tính…' : currentLeg?.duration?.text || routeData?.totalDuration || '—'}
          </p>
          <p className="text-[11px] text-neutral-500 font-medium">
            {isLoadingRoute ? 'chờ Goong…' : currentLeg?.distance?.text || routeData?.totalDistance || ''}
          </p>
        </div>
      </div>

      {/* Danh sách các điểm dừng dạng viên thuốc (Pills) chuyển nhanh chặng */}
      {stops.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {stops.map((stop, index) => {
            const isSelected = index === activeStopIndex;
            const isPassed = index < activeStopIndex;
            const name = stop.place?.name || stop.place_name || `Điểm ${index + 1}`;

            return (
              <button
                key={stop.id || stop.place_id || index}
                type="button"
                onClick={() => onSelectStop(index, stop)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isPassed
                    ? 'bg-neutral-200 text-neutral-600 line-through opacity-70'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                )}
                <span className="max-w-[100px] truncate">{name}</span>
                {isSelected && <ChevronRight className="w-3 h-3 ml-0.5 opacity-80" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
