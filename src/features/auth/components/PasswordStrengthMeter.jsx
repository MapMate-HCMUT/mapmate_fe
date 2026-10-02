const LEVELS = [
  { label: 'Quá yếu', bar: 'bg-danger-500', text: 'text-danger-600' },
  { label: 'Yếu', bar: 'bg-danger-500', text: 'text-danger-600' },
  { label: 'Tạm được', bar: 'bg-warning-500', text: 'text-warning-600' },
  { label: 'Mạnh', bar: 'bg-success-500', text: 'text-success-700' },
  { label: 'Rất mạnh', bar: 'bg-success-600', text: 'text-success-700' },
];
const SEGMENTS = 4;

export const PasswordStrengthMeter = ({ strength }) => {
  const level = LEVELS[strength];
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex-1 grid grid-cols-4 gap-1">
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <span key={index} className={`h-1.5 rounded-pill ${index < strength ? level.bar : 'bg-neutral-200'}`} />
        ))}
      </div>
      <span className={`text-xs font-semibold w-16 text-right ${level.text}`}>{level.label}</span>
    </div>
  );
};
