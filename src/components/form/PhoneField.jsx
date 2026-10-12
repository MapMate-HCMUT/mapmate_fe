import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { countryByCode, formatNational, onlyDigits, parsePhone, PHONE_COUNTRIES, phoneProblem, toE164 } from '../../utils/phone';

/**
 * Ô số điện thoại: chọn quốc gia (cờ + mã vùng) + số được tự chia nhóm khi gõ ("90 123 4567").
 * value / onChange dùng dạng quốc tế E.164 ("+84901234567"); để trống => ''.
 * Gõ số 0 đầu theo thói quen ("0901...") hoặc dán cả "+84 90..." đều tự hiểu đúng.
 */
export const PhoneField = ({ label, value, onChange, error, optional = false }) => {
  const id = useId();
  const [state, setState] = useState(() => parsePhone(value));
  const problem = error || (state.national.length >= 6 ? phoneProblem(state.country, state.national) : '');

  const update = (country, national) => {
    setState({ country, national });
    onChange(toE164(country, national));
  };

  const handleInput = (raw) => {
    const typed = raw.trim();
    if (typed.startsWith('+') || typed.startsWith('00')) {
      // dán cả số quốc tế => tự chọn nước theo mã vùng
      const parsed = parsePhone(`+${onlyDigits(typed).replace(/^00/, '')}`);
      update(parsed.country, parsed.national.slice(0, 15));
      return;
    }
    update(state.country, onlyDigits(typed).replace(/^0/, '').slice(0, 12));
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-neutral-700">
        {label} {optional && <span className="font-normal text-neutral-400">(không bắt buộc)</span>}
      </label>
      <div
        className={`flex items-stretch bg-surface border rounded-input transition focus-within:ring-2 ${
          problem ? 'border-danger-500 focus-within:ring-danger-500/20' : 'border-neutral-300 focus-within:border-primary-500 focus-within:ring-primary-500/20'
        }`}
      >
        <div className="relative flex items-center gap-1.5 pl-3 pr-2 border-r border-neutral-200 text-sm text-neutral-800 shrink-0">
          <span className="text-lg leading-none" aria-hidden="true">{state.country.flag}</span>
          <span className="font-semibold tabular-nums">+{state.country.dial}</span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
          <select
            aria-label="Quốc gia / mã vùng"
            value={state.country.code}
            onChange={(event) => update(countryByCode(event.target.value), state.national)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          >
            {PHONE_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>{`${country.flag} ${country.name} (+${country.dial})`}</option>
            ))}
          </select>
        </div>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={formatNational(state.country, state.national)}
          onChange={(event) => handleInput(event.target.value)}
          placeholder={state.country.placeholder}
          aria-invalid={Boolean(problem)}
          aria-describedby={`${id}-hint`}
          className="flex-1 min-w-0 py-2.5 px-3 bg-transparent text-sm text-neutral-800 tabular-nums tracking-wide placeholder:text-neutral-400 focus:outline-none"
        />
      </div>
      <p id={`${id}-hint`} className={`text-xs ${problem ? 'font-medium text-danger-600' : 'text-neutral-400'}`}>
        {problem || (state.country.code === 'VN' ? 'Không cần gõ số 0 ở đầu — VD 0901 234 567 nhập 90 123 4567' : `Số của ${state.country.name}, không gồm mã vùng`)}
      </p>
    </div>
  );
};
