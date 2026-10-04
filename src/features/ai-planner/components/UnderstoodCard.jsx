import { SlidersHorizontal } from 'lucide-react';
import { useOpenInExplore } from '../../explore';
import { describeCriteria } from '../utils/aiFormat';

const CHIP_TONES = {
  category: 'bg-primary-50 text-primary-700',
  tag: 'bg-accent-50 text-accent-700',
  default: 'bg-neutral-100 text-neutral-700',
};

// "MapMate hiểu là...": tiêu chí đã trích từ câu chat + các giả định — để người dùng kiểm tra và sửa nếu sai.
export const UnderstoodCard = ({ understood }) => {
  const openInExplore = useOpenInExplore();
  const { criteria, assumptions, must_visit: mustVisit, avoided } = understood;

  return (
    <div className="rounded-card border border-neutral-200 bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">MapMate hiểu là</p>
        <button type="button" onClick={() => openInExplore(criteria)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Chỉnh trong Khám phá
        </button>
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {describeCriteria(criteria).map((chip) => (
          <li key={chip.key} className={`px-2 py-0.5 rounded-pill text-xs font-medium ${CHIP_TONES[chip.tone] ?? CHIP_TONES.default}`}>{chip.label}</li>
        ))}
        {mustVisit.map((place) => (
          <li key={`m-${place.id}`} className="px-2 py-0.5 rounded-pill text-xs font-medium bg-success-100 text-success-700">✓ {place.name}</li>
        ))}
        {avoided.map((place) => (
          <li key={`a-${place.id}`} className="px-2 py-0.5 rounded-pill text-xs font-medium bg-danger-50 text-danger-600 line-through">{place.name}</li>
        ))}
      </ul>
      {assumptions.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-[11px] text-neutral-500">
          {assumptions.map((note) => <li key={note}>• {note}</li>)}
        </ul>
      )}
    </div>
  );
};
