import { useState } from 'react';
import { Copy, Moon, Plus, X } from 'lucide-react';
import {
  CLOSE_OPTIONS,
  DAY_KEYS,
  DAY_LABELS,
  DAY_SHORT,
  FULL_DAY,
  isFullDay,
  isOvernight,
  MAX_RANGES_PER_DAY,
  TIME_OPTIONS,
  weekOf,
} from '../../../utils/weeklyHours';

const DEFAULT_RANGE = { open: '07:00', close: '22:00' };
const selectClass =
  'py-2 pl-2.5 pr-7 bg-surface border border-neutral-300 rounded-input text-sm font-semibold tabular-nums text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500';

const TimeSelect = ({ value, options, onChange, label }) => (
  <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className={selectClass}>
    {options.map((time) => <option key={time} value={time}>{time}</option>)}
  </select>
);

const Switch = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative shrink-0 w-10 h-6 rounded-pill transition ${checked ? 'bg-primary-600' : 'bg-neutral-300'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-pill bg-surface shadow-card transition-transform ${checked ? 'translate-x-4' : ''}`} />
  </button>
);

// Chép giờ của 1 ngày sang các ngày khác (chọn ngày bằng chip)
const CopyPanel = ({ from, onApply, onClose }) => {
  const [targets, setTargets] = useState(DAY_KEYS.filter((day) => day !== from));
  const toggle = (day) => setTargets((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));
  return (
    <div className="mt-2 rounded-input border border-primary-200 bg-primary-50/60 p-2.5 space-y-2">
      <p className="text-xs font-semibold text-primary-800">Chép giờ {DAY_LABELS[from]} sang:</p>
      <div className="flex flex-wrap gap-1.5">
        {DAY_KEYS.filter((day) => day !== from).map((day) => (
          <button key={day} type="button" aria-pressed={targets.includes(day)} onClick={() => toggle(day)} className={`w-10 py-1 rounded-pill text-xs font-bold border ${targets.includes(day) ? 'bg-primary-600 border-primary-600 text-white' : 'bg-surface border-neutral-300 text-neutral-600'}`}>
            {DAY_SHORT[day]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" disabled={!targets.length} onClick={() => onApply(targets)} className="px-3 py-1.5 rounded-button bg-primary-600 text-white text-xs font-bold disabled:opacity-50">Áp dụng</button>
        <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-neutral-600">Huỷ</button>
      </div>
    </div>
  );
};

/**
 * Giờ mở cửa theo từng ngày: bật / tắt từng ngày, tối đa 3 khung / ngày (nghỉ trưa), qua đêm, mở 24 giờ,
 * chép giờ 1 ngày sang ngày khác. value = { mon: [...], ... } | null (chưa công khai giờ). errors = { mon: '...' }.
 */
export const WeeklyHoursEditor = ({ value, onChange, errors = {} }) => {
  const [copyFrom, setCopyFrom] = useState(null);
  const isUnknown = value === null;
  const week = value ?? weekOf([DEFAULT_RANGE]);
  const setDay = (day, ranges) => onChange({ ...week, [day]: ranges });
  const setRange = (day, index, field, time) => setDay(day, week[day].map((range, i) => (i === index ? { ...range, [field]: time } : range)));
  const addRange = (day) => {
    const last = week[day].at(-1);
    // khung mới bắt đầu sau khung cuối 1 tiếng (VD sau ca sáng 07:00–11:00 => 17:00–22:00 cho dễ sửa)
    const next = last && last.close < '20:00' ? { open: last.close < '17:00' ? '17:00' : last.close, close: '22:00' } : { open: '17:00', close: '22:00' };
    setDay(day, [...week[day], next]);
  };

  const presets = [
    { label: 'Mọi ngày giống Thứ 2', apply: () => onChange(weekOf(week.mon.length ? week.mon : [DEFAULT_RANGE])) },
    { label: 'T2–T6 giống Thứ 2, nghỉ cuối tuần', apply: () => onChange({ ...weekOf(week.mon.length ? week.mon : [DEFAULT_RANGE]), sat: [], sun: [] }) },
    { label: 'Mở 24/7', apply: () => onChange(weekOf([FULL_DAY])) },
  ];

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-pill bg-neutral-100 p-0.5" role="radiogroup" aria-label="Giờ mở cửa">
        {[
          { known: true, label: 'Có giờ cố định' },
          { known: false, label: 'Chưa rõ / không công khai' },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={option.known !== isUnknown}
            onClick={() => onChange(option.known ? week : null)}
            className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold transition ${option.known !== isUnknown ? 'bg-surface text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isUnknown ? (
        <p className="rounded-input bg-neutral-50 border border-neutral-200 p-3 text-xs text-neutral-600">
          Thẻ quán sẽ ghi "Chưa rõ giờ" và khuyên khách gọi trước. Quán có giờ cố định thì nên nhập — AI chỉ xếp lộ trình vào lúc quán đang mở.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button key={preset.label} type="button" onClick={preset.apply} className="px-2.5 py-1 rounded-pill bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700">
                {preset.label}
              </button>
            ))}
          </div>

          <ul className="divide-y divide-neutral-100 rounded-card border border-neutral-200">
            {DAY_KEYS.map((day) => {
              const ranges = week[day];
              const isOpen = ranges.length > 0;
              const fullDay = isFullDay(ranges);
              return (
                <li key={day} className="p-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <div className="flex items-center gap-2.5 sm:w-36 sm:pt-1.5 shrink-0">
                      <Switch checked={isOpen} onChange={(open) => setDay(day, open ? [DEFAULT_RANGE] : [])} label={`${DAY_LABELS[day]}: ${isOpen ? 'mở cửa' : 'nghỉ'}`} />
                      <span className={`text-sm font-semibold ${isOpen ? 'text-neutral-900' : 'text-neutral-400'}`}>{DAY_LABELS[day]}</span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {!isOpen && <p className="text-sm text-neutral-400 sm:pt-1.5">Nghỉ</p>}
                      {isOpen && fullDay && <p className="text-sm font-semibold text-primary-700 sm:pt-1.5">Mở 24 giờ</p>}
                      {isOpen && !fullDay && ranges.map((range, index) => (
                        <div key={index} className="flex flex-wrap items-center gap-2">
                          <TimeSelect value={range.open} options={TIME_OPTIONS} onChange={(time) => setRange(day, index, 'open', time)} label={`${DAY_LABELS[day]} khung ${index + 1}: giờ mở`} />
                          <span className="text-neutral-400" aria-hidden="true">–</span>
                          <TimeSelect value={range.close} options={CLOSE_OPTIONS} onChange={(time) => setRange(day, index, 'close', time)} label={`${DAY_LABELS[day]} khung ${index + 1}: giờ đóng`} />
                          {isOvernight(range) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-secondary-50 text-secondary-700 text-[11px] font-semibold">
                              <Moon className="w-3 h-3" aria-hidden="true" /> qua đêm
                            </span>
                          )}
                          {ranges.length > 1 && (
                            <button type="button" onClick={() => setDay(day, ranges.filter((_, i) => i !== index))} className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50" aria-label={`Bỏ khung ${index + 1} của ${DAY_LABELS[day]}`}>
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      {isOpen && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold">
                          {!fullDay && ranges.length < MAX_RANGES_PER_DAY && (
                            <button type="button" onClick={() => addRange(day)} className="inline-flex items-center gap-1 text-primary-700 hover:underline">
                              <Plus className="w-3.5 h-3.5" /> Thêm khung (nghỉ trưa)
                            </button>
                          )}
                          <label className="inline-flex items-center gap-1.5 text-neutral-600 cursor-pointer">
                            <input type="checkbox" className="accent-primary-600" checked={fullDay} onChange={(event) => setDay(day, event.target.checked ? [FULL_DAY] : [DEFAULT_RANGE])} />
                            Mở 24 giờ
                          </label>
                          <button type="button" onClick={() => setCopyFrom(copyFrom === day ? null : day)} className="inline-flex items-center gap-1 text-neutral-600 hover:text-primary-700">
                            <Copy className="w-3.5 h-3.5" /> Chép sang ngày khác
                          </button>
                        </div>
                      )}
                      {copyFrom === day && (
                        <CopyPanel
                          from={day}
                          onClose={() => setCopyFrom(null)}
                          onApply={(targets) => {
                            onChange({ ...week, ...Object.fromEntries(targets.map((target) => [target, ranges.map((range) => ({ ...range }))])) });
                            setCopyFrom(null);
                          }}
                        />
                      )}
                      {errors[day] && <p className="text-xs font-medium text-danger-600">{errors[day]}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-neutral-500">Giờ đóng nhỏ hơn giờ mở = mở qua đêm (VD 18:00 – 02:00 là tới 2 giờ sáng hôm sau).</p>
        </>
      )}
    </div>
  );
};
