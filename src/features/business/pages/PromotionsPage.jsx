import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Bell, Pencil, Plus, Square } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useToast } from '../../../hooks/useToast';
import { endPromotionApi, getPromotionsApi, notifyPromotionApi } from '../api/businessApi';
import { PromotionFormModal } from '../components/PromotionFormModal';
import { PromotionStatusPill } from '../components/PromotionStatusPill';
import { useConsole } from '../hooks/useConsole';
import { formatDateTime, promotionKind } from '../utils/businessConfig';

const GROUPS = [
  { status: 'active', title: 'Đang chạy' },
  { status: 'scheduled', title: 'Hẹn giờ' },
  { status: 'ended', title: 'Đã kết thúc' },
];

// Thanh tiến độ phát mã (đã phát / tổng) và đã dùng tại quán
const Progress = ({ promo }) => {
  const total = promo.kind === 'lucky_wheel' ? promo.prizes.reduce((sum, prize) => sum + prize.quantity, 0) : promo.quantity;
  if (!total) return null;
  const claimed = promo.kind === 'lucky_wheel' ? promo.prizes.reduce((sum, prize) => sum + prize.claimed, 0) : promo.claimed_count;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-[11px] text-neutral-500">
        <span>Đã phát <b className="text-neutral-800">{claimed}</b>/{total} · đã dùng tại quán <b className="text-neutral-800">{promo.used_count}</b></span>
        <span>{Math.round((claimed / total) * 100)}%</span>
      </div>
      <div className="h-1.5 rounded-pill bg-danger-100 overflow-hidden">
        <div className="h-full rounded-pill bg-danger-500" style={{ width: `${Math.min(100, (claimed / total) * 100)}%` }} />
      </div>
    </div>
  );
};

// Khuyến mãi & sự kiện săn voucher: tạo, sửa, kết thúc, báo cho khách đã lưu quán
export const PromotionsPage = () => {
  const { data, reload: reloadBusiness } = useConsole();
  const promotions = useAsyncData(getPromotionsApi, 'promotions');
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState(null); // null | 'new' | promotion
  const [busyId, setBusyId] = useState(null);
  const { showToast } = useToast();
  const quota = promotions.data?.quota;
  const isCreating = editing === 'new' || (searchParams.get('new') === '1' && quota);
  const placeName = (id) => data.places.find((place) => place.id === String(id))?.name ?? 'Cửa hàng đã gỡ';

  const refresh = () => {
    promotions.reload();
    reloadBusiness();
  };
  const closeForm = () => {
    setEditing(null);
    if (searchParams.get('new')) setSearchParams({}, { replace: true });
  };
  const run = async (promo, action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(promo.id);
    try {
      const result = await action(promo.id);
      showToast(result?.notified !== undefined ? (result.notified ? `Đã báo cho ${result.notified} khách đã lưu quán 🔔` : 'Chưa có khách nào lưu quán của bạn') : 'Đã cập nhật');
      refresh();
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setBusyId(null);
    }
  };

  if (promotions.error && !promotions.data) return <ErrorState error={promotions.error} onRetry={promotions.reload} />;
  const items = promotions.data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {quota ? (
          <p className="text-sm text-neutral-600">
            <b className="text-neutral-900">{quota.running}/{quota.max_promotions}</b> khuyến mãi đang chạy / hẹn giờ ·{' '}
            {quota.notify_per_week ? <>còn <b className="text-neutral-900">{quota.notify_left}/{quota.notify_per_week}</b> lượt báo khách tuần này</> : 'gói Cơ bản chưa có lượt báo khách'}
          </p>
        ) : <span />}
        <button type="button" onClick={() => setEditing('new')} disabled={!quota || quota.running >= quota.max_promotions} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold disabled:opacity-50">
          <Plus className="w-4 h-4" /> Tạo khuyến mãi / sự kiện
        </button>
      </div>

      {promotions.isLoading && !promotions.data && <div className="h-40 rounded-card bg-neutral-200 animate-pulse" aria-hidden="true" />}
      {promotions.data && items.length === 0 && (
        <div className="bg-surface rounded-card shadow-card p-8 text-center">
          <p className="text-4xl" aria-hidden="true">🎟️</p>
          <p className="mt-2 font-bold text-neutral-900">Chưa có khuyến mãi nào</p>
          <p className="mt-1 text-sm text-neutral-500">Tạo ưu đãi, voucher giờ vàng, check-in nhận quà hay vòng quay may mắn để kéo khách tới quán.</p>
        </div>
      )}

      {GROUPS.map((group) => {
        const list = items.filter((promo) => promo.status === group.status);
        if (!list.length) return null;
        return (
          <section key={group.status}>
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide mb-2">{group.title}</h2>
            <ul className="grid md:grid-cols-2 gap-3">
              {list.map((promo) => {
                const kind = promotionKind(promo.kind);
                const canNotify = quota?.notify_left > 0 && !promo.notified_at && promo.status !== 'ended';
                return (
                  <li key={promo.id} className={`bg-surface rounded-card shadow-card p-4 ${promo.status === 'ended' ? 'opacity-70' : ''}`}>
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-xl bg-danger-50 flex items-center justify-center text-xl shrink-0" aria-hidden="true">{kind.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <p className="flex-1 min-w-0 font-bold text-neutral-900 leading-snug">{promo.title}</p>
                          <PromotionStatusPill status={promo.status} />
                        </div>
                        <p className="text-xs text-neutral-500">
                          {kind.label} · <b className="text-danger-600">{promo.label}</b>{promo.code && <> · mã <b className="text-neutral-800">{promo.code}</b></>}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">{formatDateTime(promo.starts_at)} → {formatDateTime(promo.ends_at)}</p>
                        <p className="text-xs text-neutral-500 truncate">Tại: {promo.place_ids.map(placeName).join(', ')}</p>
                        {promo.kind === 'lucky_wheel' && (
                          <p className="mt-1 text-xs text-neutral-600">{promo.prizes.map((prize) => `${prize.label} (${prize.claimed}/${prize.quantity})`).join(' · ')}</p>
                        )}
                        <Progress promo={promo} />
                        {promo.notified_at && <p className="mt-1.5 text-[11px] text-success-700">🔔 Đã báo cho {promo.notified_count} khách đã lưu quán</p>}
                      </div>
                    </div>
                    {promo.status !== 'ended' && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap gap-2">
                        <button type="button" onClick={() => setEditing(promo)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700">
                          <Pencil className="w-3.5 h-3.5" /> Sửa
                        </button>
                        {quota?.notify_per_week > 0 && !promo.notified_at && (
                          <button type="button" disabled={!canNotify || busyId === promo.id} onClick={() => run(promo, notifyPromotionApi, 'Gửi thông báo khuyến mãi này cho các khách đã lưu quán?')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-accent-50 hover:bg-accent-100 text-xs font-semibold text-accent-800 disabled:opacity-50">
                            <Bell className="w-3.5 h-3.5" /> Báo cho khách đã lưu quán
                          </button>
                        )}
                        <button type="button" disabled={busyId === promo.id} onClick={() => run(promo, endPromotionApi, promo.status === 'scheduled' ? 'Huỷ khuyến mãi chưa chạy này?' : 'Kết thúc khuyến mãi ngay bây giờ? Mã khách đã nhận sẽ hết hạn.')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold text-danger-600 hover:bg-danger-50">
                          <Square className="w-3.5 h-3.5" /> {promo.status === 'scheduled' ? 'Huỷ' : 'Kết thúc'}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {isCreating && quota && (
        <PromotionFormModal isOpen places={data.places} allowedKinds={quota.kinds} onClose={closeForm} onSaved={refresh} />
      )}
      {editing && editing !== 'new' && (
        <PromotionFormModal key={editing.id} isOpen promotion={editing} places={data.places} allowedKinds={quota?.kinds ?? []} onClose={closeForm} onSaved={refresh} />
      )}
    </div>
  );
};
