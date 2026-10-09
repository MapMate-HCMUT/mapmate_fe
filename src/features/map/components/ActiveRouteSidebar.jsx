import { useState } from 'react';
import {
  Bike,
  Bus,
  Car,
  CarTaxiFront,
  Check,
  ChevronDown,
  ChevronRight,
  CornerDownLeft,
  CornerDownRight,
  CornerUpRight,
  ExternalLink,
  MapPin,
  MoveRight,
  Footprints,
  Navigation,
  Search,
  Share2,
  X,
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { normalizeTripVehicle } from '../api/goongDirections';

// Phương tiện khi dẫn đường — đổi là tính lại thời gian từng chặng (đi bộ: ước tính theo tốc độ, Goong không hỗ trợ;
// công cộng: tìm tuyến xe buýt / metro thật ở backend, kết hợp đi bộ / gọi xe ra trạm)
const ROUTE_VEHICLES = [
  { value: 'bike', label: 'Xe máy', icon: Bike },
  { value: 'walk', label: 'Đi bộ', icon: Footprints },
  { value: 'car', label: 'Ô tô', icon: Car },
  { value: 'taxi', label: 'Taxi', icon: CarTaxiFront },
  { value: 'bus', label: 'Buýt & Metro', icon: Bus },
];

// Biểu tượng tương ứng với hành động rẽ đường từ Goong API
const getManeuverIcon = (maneuver = '') => {
  const m = maneuver.toLowerCase();
  if (m.includes('right')) return <CornerDownRight className="w-4 h-4 text-blue-600 shrink-0" />;
  if (m.includes('left')) return <CornerDownLeft className="w-4 h-4 text-blue-600 shrink-0" />;
  if (m.includes('straight') || m.includes('continue'))
    return <MoveRight className="w-4 h-4 text-blue-600 shrink-0" />;
  return <CornerUpRight className="w-4 h-4 text-blue-600 shrink-0" />;
};

// Cột trái dẫn đường chuẩn phong cách Goong Maps trên Desktop
export const ActiveRouteSidebar = ({
  itinerary,
  routeData,
  activeStopIndex,
  onSelectStop,
  onStopTrip,
  isLoadingRoute,
  onSetVehicle,
  transitPanel = null,
}) => {
  const [showSteps, setShowSteps] = useState(false);
  const { showToast } = useToast();

  if (!itinerary) return null;

  const stops = itinerary.stops || [];
  const currentVehicle = normalizeTripVehicle(itinerary.vehicle || 'bike');

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Đã sao chép liên kết chuyến đi');
  };

  return (
    <aside className="hidden lg:flex w-[400px] shrink-0 flex-col bg-surface border-r border-neutral-200 h-full overflow-hidden shadow-lg select-none">
      {/* 1. Header chọn phương tiện di chuyển chuẩn Goong Maps */}
      <div className="p-3 bg-white border-b border-neutral-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl" role="radiogroup" aria-label="Phương tiện">
            {ROUTE_VEHICLES.map(({ value, label, icon: VehicleIcon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={currentVehicle === value}
                onClick={() => onSetVehicle?.(value)}
                title={label}
                aria-label={label}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  currentVehicle === value ? 'bg-primary-600 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                }`}
              >
                <VehicleIcon className="w-4 h-4" />
                {/* Chỉ ghi chữ cho phương tiện đang chọn (5 phương tiện + nút đóng phải vừa 1 hàng) */}
                {currentVehicle === value && <span>{label}</span>}
              </button>
            ))}
          </div>

          {/* Nút thoát / dừng dẫn đường kiểu Goong */}
          <button
            type="button"
            onClick={onStopTrip}
            title="Đóng chỉ đường"
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Hộp các điểm đi & đến theo chuỗi Goong Maps */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 space-y-2">
          {/* Điểm xuất phát: Vị trí của bạn */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-[3px] border-slate-900 bg-white shrink-0 shadow-xs ml-0.5" />
            <span className="text-xs font-semibold text-neutral-800 truncate">
              Vị trí của bạn (Toạ độ GPS)
            </span>
          </div>

          {/* Các điểm dừng trong lộ trình */}
          {stops.map((stop, index) => {
            const isLast = index === stops.length - 1;
            const name = stop.place?.name || stop.place_name || `Điểm ${index + 1}`;

            return (
              <div key={stop.id || stop.place_id || index} className="flex items-center gap-2">
                {isLast ? (
                  <MapPin className="w-4.5 h-4.5 text-rose-600 shrink-0 fill-rose-600" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {index + 1}
                  </span>
                )}
                <span className="text-xs font-semibold text-neutral-800 truncate" title={name}>
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Đi xe công cộng: các phương án xe buýt / metro thay cho thẻ đường đi Goong */}
      {currentVehicle === 'bus' && transitPanel}

      {/* 3. Thẻ kết quả lộ trình Goong (Route Card) */}
      <div className={`p-3 border-b border-neutral-200 bg-white ${currentVehicle === 'bus' && transitPanel ? 'hidden' : ''}`}>
        <div className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/60 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 truncate max-w-[240px]">
              <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{routeData?.primaryRoad || itinerary.name}</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
              Nhanh nhất
            </span>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black text-neutral-900 tracking-tight">
              {isLoadingRoute ? 'Đang tính…' : routeData?.totalDuration || `${itinerary.total_duration || 0} phút`}
            </span>
            <span className="text-sm font-semibold text-neutral-600">
              ({isLoadingRoute ? '…' : routeData?.totalDistance || `${itinerary.total_distance_km || 0} km`})
            </span>
          </div>
          {!isLoadingRoute && routeData?.durationNote && <p className="text-[11px] text-neutral-500">{routeData.durationNote}</p>}

          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
            >
              <span>{showSteps ? 'Ẩn các bước rẽ' : 'Chi tiết chỉ dẫn đường'}</span>
              {showSteps ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sao chép</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Nội dung cuộn: Chi tiết các bước ngã rẽ Goong hoặc Danh sách điểm dừng */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {showSteps && routeData?.steps?.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Chỉ dẫn từng ngã rẽ ({routeData.steps.length} bước)
            </h4>
            <div className="space-y-1 rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100 shadow-xs">
              {routeData.steps.map((step, idx) => (
                <div key={idx} className="p-2.5 flex items-start gap-2.5 text-xs">
                  {getManeuverIcon(step.maneuver)}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 leading-snug">{step.instruction}</p>
                    {step.distanceText && (
                      <p className="text-[11px] text-neutral-500 mt-0.5">{step.distanceText}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Danh sách các điểm dừng trong chuyến đi */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Các điểm dừng trong lộ trình ({stops.length} điểm)
          </h4>

          <ol className="space-y-2.5">
            {stops.map((stop, index) => {
              const isSelected = index === activeStopIndex;
              const isPassed = index < activeStopIndex;
              const style = getCategoryStyle(stop.place?.category || stop.category);
              const name = stop.place?.name || stop.place_name || `Điểm ${index + 1}`;
              const address = stop.place?.address || stop.address || '';
              const leg = routeData?.legs?.[index];

              return (
                <li
                  key={stop.id || stop.place_id || index}
                  onClick={() => onSelectStop(index, stop)}
                  className={`p-3 rounded-xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/30'
                      : isPassed
                      ? 'border-neutral-200 bg-neutral-50/70 opacity-70'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isPassed
                          ? 'bg-neutral-300 text-neutral-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-sm font-bold text-neutral-900 truncate">{name}</h5>
                        {stop.arrival_time && (
                          <span className="text-xs font-semibold text-blue-700 shrink-0">
                            {stop.arrival_time}
                          </span>
                        )}
                      </div>

                      {address && <p className="text-xs text-neutral-500 truncate mt-0.5">{address}</p>}

                      <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-600 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                        {stop.stay_minutes > 0 && <span>· ở lại {stop.stay_minutes} phút</span>}
                        {leg?.distance?.text && (
                          <span className="text-blue-700 font-bold">
                            · chặng tới: ~{leg.distance.text} ({leg.duration.text})
                          </span>
                        )}
                      </div>

                      {/* Đường link tìm kiếm Google nhỏ bên dưới */}
                      <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center text-[11px]">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(`${name} ${address}`.trim())}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-1 transition-colors ${
                            isSelected
                              ? 'text-blue-600 hover:text-blue-800 font-medium'
                              : 'text-neutral-400 hover:text-blue-600'
                          }`}
                          title={`Tìm "${name}" trên Google`}
                        >
                          <Search className="w-3 h-3 shrink-0" />
                          <span className="hover:underline">Tìm trên Google</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </aside>
  );
};
