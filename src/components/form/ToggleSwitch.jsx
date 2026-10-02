export const ToggleSwitch = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
    <span className="text-sm text-neutral-700">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-11 h-6 rounded-pill transition ${checked ? 'bg-primary-600' : 'bg-neutral-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-pill bg-surface shadow-card transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  </label>
);
