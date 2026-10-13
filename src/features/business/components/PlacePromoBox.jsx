import { useState } from 'react';
import { Link } from 'react-router';
import { Check, Copy } from 'lucide-react';

const KIND_ACTION = { voucher: '🎟️ Săn voucher', checkin: '📍 Check-in nhận quà', lucky_wheel: '🎡 Quay ngay' };
const formatDate = (value) => new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

/** Trong thẻ chi tiết địa điểm: thông báo nhanh của chủ quán + khuyến mãi đang chạy (mã chung / nút săn voucher) */
export const PlacePromoBox = ({ place }) => {
  const [copied, setCopied] = useState(false);
  const { notice, promotion } = place;
  if (!notice && !promotion) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // không chép được thì vẫn đọc mã trên màn hình
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {notice && (
        <p className="flex gap-2 rounded-input bg-warning-50 border border-warning-200 px-3 py-2 text-xs text-warning-800">
          <span aria-hidden="true">📢</span>
          <span><b>Quán thông báo:</b> {notice.text}</span>
        </p>
      )}
      {promotion && (
        <div className="rounded-input bg-gradient-to-r from-danger-500 to-warning-500 text-white px-3 py-2.5">
          <div className="flex items-start gap-2">
            <p className="flex-1 min-w-0">
              <span className="block text-base font-extrabold leading-tight">{promotion.label}</span>
              <span className="block text-xs font-semibold text-white/95">{promotion.title}</span>
              {promotion.description && <span className="block text-[11px] text-white/85 line-clamp-2">{promotion.description}</span>}
              <span className="block mt-0.5 text-[10px] text-white/80">Đến {formatDate(promotion.ends_at)}</span>
            </p>
            {promotion.kind !== 'deal' ? (
              <Link to={`/vouchers?event=${promotion.id}`} className="shrink-0 px-3 py-1.5 rounded-pill bg-white text-danger-600 text-xs font-bold hover:bg-white/90">
                {KIND_ACTION[promotion.kind]}
              </Link>
            ) : promotion.code ? (
              <button type="button" onClick={copy} className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-pill bg-white text-danger-600 text-xs font-bold font-mono" aria-label={`Mã ${promotion.code}, bấm để chép`}>
                {promotion.code} {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
