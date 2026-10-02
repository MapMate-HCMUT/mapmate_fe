import { useId } from 'react';
import { Icon } from '../Icon';

// Ô nhập liệu có nhãn, icon và thông báo lỗi.
export const TextField = ({ label, icon, error, value, onChange, trailing, type = 'text', ...inputProps }) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-neutral-700">
        {label}
      </label>
      <div className="relative">
        {icon && <Icon name={icon} className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full py-2.5 ${icon ? 'pl-10' : 'pl-3.5'} ${trailing ? 'pr-11' : 'pr-3.5'} bg-surface border rounded-input text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition ${
            error
              ? 'border-danger-500 focus:ring-danger-500/20'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20'
          }`}
          {...inputProps}
        />
        {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && (
        <p id={errorId} className="text-xs font-medium text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
};
