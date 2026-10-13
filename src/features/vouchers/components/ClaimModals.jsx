import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { buildSlices, targetRotation } from '../utils/wheel';
import { LuckyWheel } from './LuckyWheel';
import { VoucherTicket } from './VoucherTicket';

// Kết quả săn được: hiện vé voucher (mã) ngay
export const VoucherResultModal = ({ voucher, onClose }) => (
  <Modal isOpen={Boolean(voucher)} title="🎉 Săn thành công!" onClose={onClose}>
    {voucher && (
      <div className="space-y-4">
        <ul><VoucherTicket voucher={voucher} /></ul>
        <p className="text-sm text-neutral-600">Tới quán và đọc mã cho thu ngân trước khi thanh toán. Voucher được lưu trong <b>Ví voucher</b>.</p>
        <button type="button" onClick={onClose} className="w-full py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold">Tuyệt!</button>
      </div>
    )}
  </Modal>
);

/** Vòng quay: bấm "Quay" => gọi server (bốc thăm thật) => quay tới đúng ô kết quả => hiện quà / chúc may mắn */
export const WheelModal = ({ event, onClose, onSpin }) => {
  const [slices] = useState(() => buildSlices(event.prizes));
  const [rotation, setRotation] = useState(0);
  const [phase, setPhase] = useState('ready'); // ready | spinning | done
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const SPIN_MS = 4600;

  const spin = async () => {
    setPhase('spinning');
    setError('');
    try {
      const data = await onSpin(event);
      setRotation((current) => targetRotation(slices, data.won ? data.prize.id : null, current));
      setTimeout(() => {
        setResult(data);
        setPhase('done');
      }, SPIN_MS);
    } catch (spinError) {
      setError(spinError.message);
      setPhase('ready');
    }
  };

  return (
    <Modal isOpen title={`🎡 ${event.title}`} onClose={phase === 'spinning' ? () => {} : onClose}>
      <div className="space-y-5 text-center">
        <LuckyWheel slices={slices} rotation={rotation} isSpinning={phase === 'spinning'} />
        {phase !== 'done' && (
          <>
            <p className="text-sm text-neutral-600">Mỗi ngày được quay 1 lần tại <b>{event.business.name}</b>.</p>
            {error && <p className="text-sm font-medium text-danger-600">{error}</p>}
            <button type="button" onClick={spin} disabled={phase === 'spinning'} className="w-full py-3 rounded-button bg-gradient-to-r from-violet-600 to-pink-500 text-white font-extrabold text-base disabled:opacity-70">
              {phase === 'spinning' ? 'Đang quay…' : 'QUAY!'}
            </button>
          </>
        )}
        {phase === 'done' && result && (
          <div className="space-y-3" role="status">
            {result.won ? (
              <>
                <p className="text-lg font-extrabold text-neutral-900">🎉 Bạn trúng: {result.prize.label}</p>
                <ul className="text-left"><VoucherTicket voucher={result.voucher} /></ul>
              </>
            ) : (
              <p className="text-lg font-bold text-neutral-700">😅 Chúc bạn may mắn lần sau — mai quay tiếp nhé!</p>
            )}
            <button type="button" onClick={onClose} className="w-full py-2.5 rounded-button bg-ink text-white text-sm font-bold">Đóng</button>
          </div>
        )}
      </div>
    </Modal>
  );
};
