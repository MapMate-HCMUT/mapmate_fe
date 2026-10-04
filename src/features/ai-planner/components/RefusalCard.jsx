import { Ban, Scale } from 'lucide-react';

const TONES = {
  unrealistic: { icon: Scale, title: 'Yêu cầu khó thực hiện', box: 'border-warning-200 bg-warning-50', text: 'text-warning-700' },
  not_allowed: { icon: Ban, title: 'Mình không hỗ trợ yêu cầu này', box: 'border-danger-200 bg-danger-50', text: 'text-danger-700' },
};

// Từ chối có lý do: phi thực tế (kèm con số + phương án gần nhất ở các nút gợi ý bên dưới) hoặc không được phép.
export const RefusalCard = ({ refusal }) => {
  const tone = TONES[refusal.kind] ?? TONES.unrealistic;
  const ToneIcon = tone.icon;
  return (
    <div className={`rounded-card border p-3 ${tone.box}`}>
      <p className={`flex items-center gap-1.5 text-sm font-semibold ${tone.text}`}>
        <ToneIcon className="w-4 h-4" /> {tone.title}
      </p>
      <ul className="mt-1.5 space-y-1 text-sm text-neutral-800">
        {refusal.reasons.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>
      {refusal.alternatives?.length > 0 && <p className="mt-2 text-xs text-neutral-600">Phương án gần nhất — bấm để chọn:</p>}
    </div>
  );
};
