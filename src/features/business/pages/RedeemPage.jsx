import { useRef, useState } from 'react';
import { CircleCheck, ScanLine } from 'lucide-react';
import { FormAlert } from '../../../components/form/FormAlert';
import { redeemVoucherApi } from '../api/businessApi';
import { formatDateTime } from '../utils/businessConfig';

const CODE_LENGTH = 8;
const clean = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);

// Quầy thu ngân: khách đọc / đưa mã voucher trong "Ví voucher" => nhập mã => xác nhận đã dùng (mỗi mã dùng 1 lần)
export const RedeemPage = () => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  const submit = async (event) => {
    event.preventDefault();
    if (code.length !== CODE_LENGTH) return setError(`Mã gồm ${CODE_LENGTH} ký tự`);
    setIsSubmitting(true);
    setError('');
    try {
      const { voucher } = await redeemVoucherApi(code);
      setHistory((prev) => [voucher, ...prev].slice(0, 10));
      setCode('');
    } catch (redeemError) {
      setError(redeemError.message);
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
    return undefined;
  };

  const [last] = history;
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <form onSubmit={submit} className="bg-surface rounded-card shadow-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center" aria-hidden="true"><ScanLine className="w-5 h-5" /></span>
          <div>
            <h2 className="font-bold text-neutral-900">Nhập mã voucher của khách</h2>
            <p className="text-xs text-neutral-500">Khách mở "Ví voucher" trên MapMate và đọc mã 8 ký tự.</p>
          </div>
        </div>
        <input
          ref={inputRef}
          autoFocus
          value={code}
          onChange={(event) => setCode(clean(event.target.value))}
          placeholder="VD: Z3YEEVTC"
          aria-label="Mã voucher"
          className="w-full py-4 px-4 text-center text-2xl sm:text-3xl font-mono font-bold tracking-[0.35em] uppercase border-2 border-neutral-300 rounded-card focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
        />
        <FormAlert message={error} />
        <button type="submit" disabled={isSubmitting || code.length !== CODE_LENGTH} className="w-full py-3.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white font-bold disabled:opacity-50">
          {isSubmitting ? 'Đang kiểm tra…' : 'Xác nhận đã dùng'}
        </button>
      </form>

      {last && (
        <div role="status" className="bg-success-50 border border-success-200 rounded-card p-4 flex gap-3">
          <CircleCheck className="w-6 h-6 text-success-600 shrink-0" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-bold text-success-800">Hợp lệ — áp dụng: {last.prize_label}</p>
            <p className="text-success-700">{last.title} · mã {last.code} · khách nhận lúc {formatDateTime(last.claimed_at)}</p>
          </div>
        </div>
      )}
      {history.length > 1 && (
        <section className="bg-surface rounded-card shadow-card p-4">
          <h3 className="text-sm font-bold text-neutral-900 mb-2">Vừa xác nhận</h3>
          <ul className="divide-y divide-neutral-100 text-sm">
            {history.slice(1).map((voucher) => (
              <li key={voucher.id} className="py-2 flex justify-between gap-3">
                <span className="font-mono font-semibold">{voucher.code}</span>
                <span className="text-neutral-500 truncate">{voucher.prize_label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
