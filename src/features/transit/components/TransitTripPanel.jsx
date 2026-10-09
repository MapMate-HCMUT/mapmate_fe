import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Footprints, MapPin, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { CONNECTOR_OPTIONS, formatDistance, formatFare, legMode, OPTION_TAGS, PRIORITY_OPTIONS } from '../utils/transitFormat';
import { RouteBadge } from './RouteBadge';
import { TransitLegTimeline } from './TransitLegTimeline';

const segmentClass = (isActive) => `flex-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${isActive ? 'bg-surface text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'}`;
const MAX_GROUPED_BADGES = 3; // tuyến gộp: hiện tối đa 3 số tuyến, còn lại "+n"
const labelOf = (options, value) => options.find((item) => item.value === value)?.label ?? value;

// Chặng đang xem: điểm đến ghi to, bấm để xem trên bản đồ; chuyến nhiều điểm thì có nút chặng trước / sau
const LegHeader = ({ legIndex, total, fromName, toName, onSelectLeg }) => (
  <div className="rounded-xl bg-neutral-900 p-3 text-white">
    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-white/70">
      <span>{total > 1 ? `Chặng ${legIndex + 1}/${total}` : 'Đi tới'}</span>
      {total > 1 && (
        <span className="flex gap-1">
          <button type="button" aria-label="Chặng trước" disabled={legIndex === 0} onClick={() => onSelectLeg(legIndex - 1)} className="rounded-pill p-1 hover:bg-white/15 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <button type="button" aria-label="Chặng sau" disabled={legIndex >= total - 1} onClick={() => onSelectLeg(legIndex + 1)} className="rounded-pill p-1 hover:bg-white/15 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </span>
      )}
    </div>
    <button type="button" onClick={() => onSelectLeg(legIndex)} title="Xem điểm đến trên bản đồ" className="mt-1 flex w-full items-start gap-2 text-left">
      <MapPin className="mt-0.5 w-5 h-5 shrink-0 fill-rose-500 text-rose-500" />
      <span className="min-w-0">
        <span className="block text-base font-bold leading-snug">{toName}</span>
        <span className="block truncate text-[11px] text-white/70">từ {fromName}</span>
      </span>
    </button>
  </div>
);

// Ưu tiên + cách ra trạm: thu gọn thành 1 dòng, bấm để đổi
const Preferences = ({ prefs, onChangePref }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-xl bg-neutral-50">
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-neutral-600">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">
          <b className="text-neutral-800">{labelOf(PRIORITY_OPTIONS, prefs.priority)}</b> · ra trạm: {labelOf(CONNECTOR_OPTIONS, prefs.connector).toLowerCase()}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="space-y-1.5 px-2.5 pb-2.5">
          <div className="flex gap-1 rounded-xl bg-neutral-200/60 p-1" role="radiogroup" aria-label="Ưu tiên">
            {PRIORITY_OPTIONS.map((item) => (
              <button key={item.value} type="button" role="radio" aria-checked={prefs.priority === item.value} onClick={() => onChangePref('priority', item.value)} className={segmentClass(prefs.priority === item.value)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl bg-neutral-200/60 p-1" role="radiogroup" aria-label="Cách ra trạm">
            {CONNECTOR_OPTIONS.map((item) => (
              <button key={item.value} type="button" role="radio" title={item.hint} aria-checked={prefs.connector === item.value} onClick={() => onChangePref('connector', item.value)} className={segmentClass(prefs.connector === item.value)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Tóm tắt các chặng: 🚶 › [03] › [MRT1] › 🚶 (gọi xe / đi bộ cả chặng: icon + tên)
const OptionChips = ({ option }) => {
  if (option.kind !== 'transit') {
    const Icon = legMode(option.legs[0]?.mode ?? 'walk').icon;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800">
        <Icon className="w-4 h-4" />
        {option.title}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {option.legs.map((leg, index) => {
        const Icon = legMode(leg.mode).icon;
        return (
          <span key={`${leg.mode}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-3 h-3 text-neutral-300" />}
            {leg.route ? (
              <span className="inline-flex flex-wrap items-center gap-0.5">
                <RouteBadge number={leg.route.number} color={leg.route.color} mode={leg.mode} />
                {(leg.alternatives ?? []).slice(0, MAX_GROUPED_BADGES - 1).map((alt) => (
                  <RouteBadge key={alt.route.number} number={alt.route.number} color={alt.route.color} mode={leg.mode} />
                ))}
                {(leg.alternatives?.length ?? 0) > MAX_GROUPED_BADGES - 1 && <span className="text-[10px] font-bold text-neutral-500">+{leg.alternatives.length - MAX_GROUPED_BADGES + 1}</span>}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-neutral-600">
                <Icon className="w-3.5 h-3.5" />
                {leg.duration_min}′
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

const OptionCard = ({ option, isSelected, onSelect, onOpenStop }) => {
  const otherTags = option.tags.filter((tag) => tag !== 'recommended').map((tag) => OPTION_TAGS[tag].label.toLowerCase());
  return (
    <li className={`rounded-xl border transition ${isSelected ? 'border-info-600 bg-surface shadow-card' : 'border-neutral-200 bg-surface hover:border-neutral-300'}`}>
      <button type="button" onClick={onSelect} className="w-full p-2.5 text-left space-y-1" aria-pressed={isSelected}>
        <div className="flex items-center justify-between gap-2">
          <OptionChips option={option} />
          <span className="shrink-0 text-base font-black text-neutral-900">{option.duration_min} phút</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-500">
          {option.tags.includes('recommended') && <span className={`rounded-pill px-1.5 py-0.5 font-bold ${OPTION_TAGS.recommended.className}`}>{OPTION_TAGS.recommended.label}</span>}
          <span>tới lúc {option.arrive_time}</span>
          {option.walk_m > 0 && <span className="inline-flex items-center gap-0.5"><Footprints className="w-3 h-3" />{formatDistance(option.walk_m)}</span>}
          {option.transfers > 0 && <span>đổi {option.transfers} tuyến</span>}
          <span>{option.kind === 'ride' ? `~${formatFare(option.cost_vnd)} (giá tham khảo)` : formatFare(option.cost_vnd)}</span>
          {otherTags.length > 0 && <span className="text-info-700">{otherTags.join(' · ')}</span>}
        </div>
      </button>
      {isSelected && (
        <div className="border-t border-neutral-100 px-2.5 pt-2">
          <TransitLegTimeline option={option} onOpenStop={onOpenStop} />
        </div>
      )}
    </li>
  );
};

/**
 * Đi bằng xe buýt / metro (thay cho thẻ đường đi Goong khi chọn phương tiện "Buýt & Metro"): điểm đến của chặng đang xem
 * ghi nổi bật, các phương án (xe buýt / metro / đổi tuyến / gọi xe / đi bộ) với phương án gợi ý xếp đầu.
 * Chọn phương án => bản đồ vẽ lại; đổi chặng => bản đồ căn theo chặng đó.
 */
export const TransitTripPanel = ({ routeData, isLoading, error, prefs, onChangePref, onSelectOption, activeStopIndex = 0, onSelectLeg, onOpenStop }) => {
  const plans = routeData?.transit?.plans ?? [];
  const selected = routeData?.transit?.selected ?? [];
  const waypoints = routeData?.waypoints ?? [];
  const legIndex = Math.min(activeStopIndex, Math.max(0, plans.length - 1));
  const plan = plans[legIndex];

  return (
    <section className="border-b border-neutral-200 bg-white p-3 space-y-2" aria-label="Đi bằng xe buýt và metro">
      {plan && waypoints[legIndex + 1] && (
        <LegHeader legIndex={legIndex} total={plans.length} fromName={waypoints[legIndex]?.name} toName={waypoints[legIndex + 1].name} onSelectLeg={onSelectLeg} />
      )}
      <Preferences prefs={prefs} onChangePref={onChangePref} />

      {isLoading && <p className="flex items-center gap-1.5 text-xs text-neutral-500"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang tìm tuyến xe buýt / metro…</p>}
      {error && !isLoading && <ErrorState compact error={{ message: error }} title="Chưa tìm được tuyến xe buýt / metro" />}
      {!isLoading && plan && (
        <>
          {!plan.options.some((option) => option.kind === 'transit') && (
            <p className="rounded-input bg-warning-50 px-2.5 py-1.5 text-[11px] text-warning-700">
              Không có tuyến xe buýt / metro phù hợp {prefs.connector === 'walk' ? 'trong tầm đi bộ' : 'lúc này'} — gợi ý gọi xe hoặc đi bộ.
              {prefs.connector === 'walk' ? ' Thử "ra trạm: tự động" để kết hợp gọi xe ra trạm.' : ''}
            </p>
          )}
          <ul className="space-y-2 max-h-[50dvh] overflow-y-auto pr-0.5">
            {plan.options.map((option, index) => (
              <OptionCard key={option.id} option={option} isSelected={(selected[legIndex] ?? 0) === index} onSelect={() => onSelectOption(legIndex, index)} onOpenStop={onOpenStop} />
            ))}
          </ul>
        </>
      )}
      {routeData?.durationNote && !isLoading && <p className="text-[10px] text-neutral-400">{routeData.durationNote} · Nguồn: Trung tâm QLGT công cộng TP.HCM</p>}
    </section>
  );
};
