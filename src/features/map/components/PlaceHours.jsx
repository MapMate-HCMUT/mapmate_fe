import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Icon } from '../../../components/Icon';
import { formatPlaceHours } from '../../../utils/formatPlace';
import { DAY_KEYS, DAY_LABELS, formatRanges, scheduleStatus, vnDayAndMinutes } from '../../../utils/weeklyHours';

// Dòng giờ mở cửa trong thẻ chi tiết: trạng thái lúc này + bấm xem cả tuần (chỉ cửa hàng có lịch theo ngày)
export const PlaceHours = ({ place }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!place.weekly_hours) {
    return (
      <div className="flex gap-2">
        <dt><Icon name="clock" className="w-4 h-4 text-neutral-400" /></dt>
        <dd className="flex-1 min-w-0">Giờ mở cửa: {formatPlaceHours(place)}</dd>
      </div>
    );
  }
  const status = scheduleStatus(place.weekly_hours);
  const { day: today } = vnDayAndMinutes();
  return (
    <div className="flex gap-2">
      <dt><Icon name="clock" className="w-4 h-4 text-neutral-400" /></dt>
      <dd className="flex-1 min-w-0">
        <button type="button" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen} className="w-full flex items-center gap-1.5 text-left">
          <span className={`font-semibold ${status.isOpen ? 'text-success-700' : 'text-danger-600'}`}>{status.text}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          <span className="sr-only">Xem giờ cả tuần</span>
        </button>
        {isOpen && (
          <table className="mt-1.5 w-full text-xs">
            <tbody>
              {DAY_KEYS.map((day) => (
                <tr key={day} className={day === today ? 'font-bold text-neutral-900' : 'text-neutral-600'}>
                  <th scope="row" className="py-0.5 pr-3 text-left font-[inherit] w-20">{DAY_LABELS[day]}</th>
                  <td className={`py-0.5 tabular-nums ${place.weekly_hours[day].length ? '' : 'text-neutral-400'}`}>{formatRanges(place.weekly_hours[day])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </dd>
    </div>
  );
};
