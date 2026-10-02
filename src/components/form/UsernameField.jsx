import { USERNAME_RULES } from '../../utils/validators';
import { TextField } from './TextField';

const STATUS_STYLE = {
  available: { className: 'text-success-700', prefix: '✓ ' },
  taken: { className: 'text-danger-600', prefix: '✗ ' },
  invalid: { className: 'text-danger-600', prefix: '✗ ' },
  checking: { className: 'text-neutral-500', prefix: '' },
};

// Ô username: kiểm tra luật + trùng tên ngay khi gõ, kèm danh sách quy định.
export const UsernameField = ({ value, onChange, error, check, hint }) => {
  const status = STATUS_STYLE[check.status];
  const message = error ?? (status ? `${status.prefix}${check.message}` : null);

  return (
    <div className="space-y-1.5">
      <TextField
        label="Tên người dùng"
        icon="user"
        autoComplete="username"
        placeholder="VD: huy.explorer"
        value={value}
        onChange={onChange}
        error={error}
        maxLength={30}
      />
      {!error && message && <p className={`text-xs font-medium ${status.className}`}>{message}</p>}
      <ul className="text-[11px] text-neutral-500 space-y-0.5 pl-1">
        {USERNAME_RULES.map((rule) => (
          <li key={rule}>• {rule}</li>
        ))}
        {hint && <li className="text-accent-700">• {hint}</li>}
      </ul>
    </div>
  );
};
