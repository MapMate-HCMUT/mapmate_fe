export const FilterSection = ({ title, hint, children }) => (
  <section className="space-y-2.5">
    <div className="flex items-baseline justify-between gap-2">
      <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      {hint && <span className="text-xs font-semibold text-primary-700">{hint}</span>}
    </div>
    {children}
  </section>
);
