import { useState } from 'react';
import { Link } from 'react-router';
import { Check, Copy, Navigation } from 'lucide-react';

const formatDate = (value) => new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

const STATUS = {
  claimed: { label: 'Chưa dùng', className: 'bg-success-100 text-success-700' },
  used: { label: 'Đã dùng', className: 'bg-neutral-100 text-neutral-500' },
  expired: { label: 'Hết hạn', className: 'bg-neutral-100 text-neutral-500' },
};

// 1 voucher trong ví: mã to, dễ đọc cho thu ngân; bấm để chép; chỉ đường tới quán
export const VoucherTicket = ({ voucher }) => {
  const [copied, setCopied] = useState(false);
  const state = voucher.is_expired ? 'expired' : voucher.status;
  const isUsable = state === 'claimed';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // không chép được thì người dùng vẫn đọc mã trên màn hình
    }
  };

  return (
    <li className={`relative flex bg-surface rounded-card shadow-card overflow-hidden ${isUsable ? '' : 'opacity-60'}`}>
      <div className="w-24 shrink-0 bg-gradient-to-b from-danger-500 to-warning-500 text-white flex flex-col items-center justify-center p-2 text-center">
        <span className="text-2xl" aria-hidden="true">🎁</span>
        <span className="mt-1 text-[11px] font-bold leading-tight line-clamp-3">{voucher.prize_label}</span>
      </div>
      {/* Răng cưa giữa 2 nửa vé */}
      <div className="w-0 border-l-2 border-dashed border-neutral-200 my-2" aria-hidden="true" />
      <div className="flex-1 min-w-0 p-3">
        <div className="flex items-start gap-2">
          <p className="flex-1 min-w-0 text-sm font-bold text-neutral-900 truncate">{voucher.business_name}</p>
          <span className={`shrink-0 px-2 py-0.5 rounded-pill text-[10px] font-bold ${STATUS[state].className}`}>{STATUS[state].label}</span>
        </div>
        <p className="text-xs text-neutral-500 truncate">{voucher.title}{voucher.place && ` · ${voucher.place.name}`}</p>
        <button type="button" onClick={copy} disabled={!isUsable} className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-input bg-neutral-100 hover:bg-neutral-200 font-mono text-lg font-bold tracking-[0.2em] text-neutral-900 disabled:line-through" aria-label={`Mã ${voucher.code}, bấm để chép`}>
          {voucher.code}
          {isUsable && (copied ? <Check className="w-4 h-4 text-success-600" /> : <Copy className="w-4 h-4 text-neutral-400" />)}
        </button>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
          <span>{voucher.used_at ? `Đã dùng ${formatDate(voucher.used_at)}` : `Hạn dùng ${formatDate(voucher.expires_at)}`}</span>
          {isUsable && voucher.place && (
            <Link to={`/map?place=${voucher.place.id}`} className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline">
              <Navigation className="w-3 h-3" /> Tới quán
            </Link>
          )}
        </div>
      </div>
    </li>
  );
};
