import { legMode } from '../utils/transitFormat';

// Ô số tuyến theo màu của tuyến: [03] [MRT1]
export const RouteBadge = ({ number, color, mode = 'bus', size = 'sm' }) => {
  const Icon = legMode(mode).icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-[6px] font-bold text-white ${size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs'}`}
      style={{ backgroundColor: color || legMode(mode).color }}
    >
      <Icon className="w-3 h-3" />
      {number}
    </span>
  );
};
