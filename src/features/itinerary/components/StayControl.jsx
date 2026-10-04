import { Minus, Plus } from 'lucide-react';
import { STAY_LIMITS, STAY_STEP_MINUTES } from '../utils/itineraryFormat';

const stepButton = 'inline-flex h-5 w-5 items-center justify-center rounded-pill border border-neutral-200 bg-surface text-neutral-600 hover:bg-neutral-100 disabled:opacity-40';

// "ở lại 90 phút" kèm nút −15′ / +15′; vượt khoảng thường lệ (VD buffet > 2 tiếng) chỉ nhắc nhẹ, không chặn.
export const StayControl = ({ minutes, range, onChange, disabled }) => (
  <span className="inline-flex items-center gap-1">
    <button type="button" aria-label={`Bớt ${STAY_STEP_MINUTES} phút`} disabled={disabled || minutes <= STAY_LIMITS.min} onClick={() => onChange(-STAY_STEP_MINUTES)} className={stepButton}>
      <Minus className="w-3 h-3" />
    </button>
    <span>ở lại {minutes} phút</span>
    <button type="button" aria-label={`Thêm ${STAY_STEP_MINUTES} phút`} disabled={disabled || minutes >= STAY_LIMITS.max} onClick={() => onChange(STAY_STEP_MINUTES)} className={stepButton}>
      <Plus className="w-3 h-3" />
    </button>
    {range && minutes > range.max && <span className="text-warning-700">(lâu hơn thường lệ)</span>}
  </span>
);
