import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Gift, Ticket } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useNow } from '../hooks/useNow';
import { useVoucherHunt } from '../hooks/useVoucherHunt';
import { VoucherResultModal, WheelModal } from './ClaimModals';
import { HuntEventCard } from './HuntEventCard';
import { VoucherTicket } from './VoucherTicket';

const TABS = [
  { value: 'live', label: '🔥 Đang diễn ra' },
  { value: 'soon', label: '⏰ Sắp mở' },
];

// 2 mục trong Khám phá:
// - view="events" (/events): săn voucher quanh bạn — voucher giới hạn, check-in nhận quà, vòng quay may mắn
// - view="wallet" (/vouchers): ví voucher đã săn
export const VouchersPage = ({ view = 'events' }) => {
  const { isAuthenticated } = useAuth();
  const { events, wallet, claim, reloadEvents } = useVoucherHunt();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = view === 'wallet' ? 'wallet' : searchParams.get('tab') === 'soon' ? 'soon' : 'live';
  const highlightId = searchParams.get('event');
  const [busyId, setBusyId] = useState(null);
  const [shownVoucher, setShownVoucher] = useState(null);
  const [wheelEvent, setWheelEvent] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const now = useNow();

  const live = events.items.filter((event) => new Date(event.starts_at).getTime() <= now);
  const soon = events.items.filter((event) => new Date(event.starts_at).getTime() > now);
  const usable = wallet.items.filter((voucher) => voucher.status === 'claimed' && !voucher.is_expired).length;

  // Mở từ thẻ quán (?event=...) => cuộn tới sự kiện đó
  useEffect(() => {
    if (!highlightId || events.isLoading) return;
    document.getElementById(`event-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightId, events.isLoading]);

  const setTab = (value) => setSearchParams(value === 'live' ? {} : { tab: value }, { replace: true });

  const play = async (event) => {
    if (!isAuthenticated) {
      showToast('Đăng nhập để săn voucher nhé', 'info');
      navigate(`/login?redirect=${encodeURIComponent(`/events?event=${event.id}`)}`);
      return;
    }
    if (event.kind === 'lucky_wheel') {
      setWheelEvent(event);
      return;
    }
    setBusyId(event.id);
    try {
      const result = await claim(event);
      setShownVoucher(result.voucher);
    } catch (error) {
      showToast(error.message, 'warning');
      reloadEvents();
    } finally {
      setBusyId(null);
    }
  };

  const list = tab === 'live' ? live : soon;
  return (
    <>
      <div className="w-full space-y-5">
        {view === 'wallet' ? (
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Voucher của tôi</h1>
              <p className="mt-0.5 text-sm text-neutral-500">{usable} voucher chưa dùng · đưa mã cho quán khi thanh toán</p>
            </div>
            <Link to="/events" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill bg-danger-50 text-danger-600 hover:bg-danger-100 text-sm font-semibold">
              <Gift className="w-4 h-4" /> Săn thêm voucher
            </Link>
          </header>
        ) : (
          <header className="relative overflow-hidden rounded-card bg-gradient-to-br from-danger-500 via-warning-500 to-accent-400 text-white p-5 sm:p-7">
            <Gift className="absolute -right-6 -bottom-8 w-40 h-40 text-white/15" aria-hidden="true" />
            <h1 className="relative text-2xl sm:text-3xl font-extrabold tracking-tight">Sự kiện săn voucher gần bạn</h1>
            <p className="relative mt-1 text-white/90 text-sm max-w-lg">Voucher giờ vàng, check-in nhận quà, vòng quay may mắn từ các quán quanh bạn — nhanh tay kẻo hết!</p>
            <Link to="/vouchers" className="relative mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-white/20 hover:bg-white/30 text-xs font-semibold">
              <Ticket className="w-3.5 h-3.5" /> {usable} voucher chưa dùng trong ví →
            </Link>
          </header>
        )}

        {tab !== 'wallet' && (
          <div className="flex gap-1 rounded-pill bg-neutral-200/70 p-1 w-fit max-w-full overflow-x-auto scrollbar-none" role="tablist">
            {TABS.map((item) => (
              <button key={item.value} type="button" role="tab" aria-selected={tab === item.value} onClick={() => setTab(item.value)} className={`shrink-0 px-4 py-1.5 rounded-pill text-sm font-semibold ${tab === item.value ? 'bg-surface text-neutral-900 shadow-sm' : 'text-neutral-600'}`}>
                {item.label}
                {item.value === 'live' && live.length > 0 && ` (${live.length})`}
                {item.value === 'soon' && soon.length > 0 && ` (${soon.length})`}
              </button>
            ))}
          </div>
        )}

        {tab !== 'wallet' && (
          <>
            {events.error && !events.items.length && <ErrorState error={events.error} onRetry={reloadEvents} />}
            {events.isLoading && !events.items.length && <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">{[0, 1, 2].map((key) => <div key={key} className="h-72 rounded-card bg-neutral-200 animate-pulse" />)}</div>}
            {!events.isLoading && !events.error && list.length === 0 && (
              <p className="bg-surface rounded-card shadow-card p-8 text-center text-sm text-neutral-500">
                {tab === 'live' ? 'Quanh bạn chưa có sự kiện nào đang diễn ra — xem tab "Sắp mở" hoặc quay lại sau nhé.' : 'Chưa có sự kiện nào sắp mở trong 3 ngày tới.'}
              </p>
            )}
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {list.map((event) => (
                <HuntEventCard key={event.id} event={event} now={now} isHighlighted={String(event.id) === highlightId} isBusy={busyId === event.id} onPlay={play} onShowVoucher={setShownVoucher} />
              ))}
            </ul>
          </>
        )}

        {tab === 'wallet' && (
          !isAuthenticated ? (
            <p className="bg-surface rounded-card shadow-card p-8 text-center text-sm text-neutral-500">Đăng nhập để xem voucher bạn đã săn.</p>
          ) : wallet.items.length === 0 ? (
            <p className="bg-surface rounded-card shadow-card p-8 text-center text-sm text-neutral-500">{wallet.isLoading ? 'Đang tải…' : 'Ví còn trống — săn voucher đầu tiên ở mục "Sự kiện" nhé!'}</p>
          ) : (
            <ul className="grid md:grid-cols-2 2xl:grid-cols-3 gap-3">
              {wallet.items.map((voucher) => <VoucherTicket key={voucher.id} voucher={voucher} />)}
            </ul>
          )
        )}
      </div>

      <VoucherResultModal voucher={shownVoucher} onClose={() => setShownVoucher(null)} />
      {wheelEvent && <WheelModal event={wheelEvent} onSpin={claim} onClose={() => setWheelEvent(null)} />}
    </>
  );
};
