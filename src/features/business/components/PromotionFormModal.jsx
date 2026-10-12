import { useState } from 'react';
import { Lock, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { FormAlert } from '../../../components/form/FormAlert';
import { useToast } from '../../../hooks/useToast';
import { createPromotionApi, updatePromotionApi } from '../api/businessApi';
import { PROMOTION_KINDS, promotionKind } from '../utils/businessConfig';
import { PromotionPreview } from './PromotionPreview';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const LABEL_PRESETS = {
  deal: ['-10%', '-20%', 'Mua 1 tặng 1', 'Freeship'],
  voucher: ['Free đồ uống', '-50%', 'Tặng bánh', 'Giảm 30k'],
  checkin: ['Tặng topping', 'Free size L', 'Tặng bánh', '-15%'],
  lucky_wheel: ['Quay là trúng', 'Vòng quay vàng'],
};
const KIND_TIER = { checkin: 'Tăng trưởng', lucky_wheel: 'Nổi bật' };

// Date <-> giá trị ô datetime-local (giờ máy người dùng)
const toInput = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 16);
};
const fromInput = (value) => new Date(value);
const roundedNow = () => new Date(Math.ceil(Date.now() / (5 * 60 * 1000)) * 5 * 60 * 1000);
const tonightAt = (hour) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date < new Date() ? new Date(date.getTime() + DAY_MS) : date;
};

const emptyForm = (places) => ({
  kind: 'deal',
  place_ids: places.map((place) => place.id),
  title: '',
  label: '',
  description: '',
  code: '',
  quantity: '50',
  prizes: [{ label: 'Free 1 ly nước', quantity: '20', weight: '20' }, { label: 'Giảm 20%', quantity: '50', weight: '40' }],
  lose_weight: '40',
  starts_at: toInput(roundedNow()),
  ends_at: toInput(new Date(roundedNow().getTime() + 7 * DAY_MS)),
});
const promotionToForm = (promo) => ({
  kind: promo.kind,
  place_ids: promo.place_ids.map(String),
  title: promo.title,
  label: promo.label,
  description: promo.description ?? '',
  code: promo.code ?? '',
  quantity: String(promo.quantity ?? ''),
  prizes: promo.prizes.map((prize) => ({ label: prize.label, quantity: String(prize.quantity), weight: String(prize.weight) })),
  lose_weight: String(promo.lose_weight ?? 0),
  starts_at: toInput(new Date(promo.starts_at)),
  ends_at: toInput(new Date(promo.ends_at)),
});

const inputClass = 'w-full py-2.5 px-3 bg-surface border border-neutral-300 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500';
const Field = ({ label, hint, children }) => (
  <label className="block space-y-1.5">
    <span className="text-sm font-semibold text-neutral-700">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-neutral-400">{hint}</span>}
  </label>
);

/** Tạo / sửa khuyến mãi & sự kiện săn voucher. allowedKinds: loại gói hiện tại được dùng (server trả trong quota.kinds) */
export const PromotionFormModal = ({ isOpen, promotion, places, allowedKinds, onClose, onSaved }) => {
  const isEdit = Boolean(promotion);
  const [form, setForm] = useState(() => (promotion ? promotionToForm(promotion) : emptyForm(places)));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const setPrize = (index, field, value) => set('prizes', form.prizes.map((prize, i) => (i === index ? { ...prize, [field]: value } : prize)));
  const kind = promotionKind(form.kind);
  const isWheel = form.kind === 'lucky_wheel';
  const hasQuantity = form.kind === 'voucher' || form.kind === 'checkin';
  const totalWeight = form.prizes.reduce((sum, prize) => sum + Number(prize.weight || 0), 0) + Number(form.lose_weight || 0);
  const chance = (weight) => (totalWeight ? Math.round((Number(weight || 0) / totalWeight) * 100) : 0);
  const setStartsAt = (date) => setForm((prev) => {
    const length = fromInput(prev.ends_at) - fromInput(prev.starts_at);
    return { ...prev, starts_at: toInput(date), ends_at: toInput(new Date(date.getTime() + Math.max(length, HOUR_MS))) };
  });

  const toPayload = () => ({
    ...(!isEdit && { kind: form.kind }),
    place_ids: form.place_ids,
    title: form.title.trim(),
    label: form.label.trim(),
    description: form.description.trim() || null,
    ...(form.kind === 'deal' && { code: form.code.trim() || null }),
    ...(hasQuantity && { quantity: Number(form.quantity) }),
    ...(isWheel && {
      prizes: form.prizes.map((prize) => ({ label: prize.label.trim(), quantity: Number(prize.quantity), weight: Number(prize.weight) })),
      lose_weight: Number(form.lose_weight || 0),
    }),
    starts_at: fromInput(form.starts_at).toISOString(),
    ends_at: fromInput(form.ends_at).toISOString(),
  });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.place_ids.length) return setError('Chọn ít nhất 1 cửa hàng áp dụng');
    setIsSaving(true);
    setError('');
    try {
      if (isEdit) await updatePromotionApi(promotion.id, toPayload());
      else await createPromotionApi(toPayload());
      showToast(isEdit ? 'Đã lưu khuyến mãi' : 'Đã tạo khuyến mãi — khách sẽ thấy trên thẻ quán 🎉');
      onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
    return undefined;
  };

  return (
    <Modal isOpen={isOpen} title={isEdit ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi / sự kiện'} onClose={onClose} size="lg">
      <form onSubmit={submit} className="space-y-5" noValidate>
        {!isEdit && (
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-700 mb-2">Loại</legend>
            <div className="grid sm:grid-cols-2 gap-2">
              {PROMOTION_KINDS.map((item) => {
                const isLocked = !allowedKinds.includes(item.value);
                const isActive = form.kind === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={isLocked}
                    aria-pressed={isActive}
                    onClick={() => setForm((prev) => ({ ...prev, kind: item.value, label: '' }))}
                    className={`relative text-left rounded-input border-2 p-3 transition disabled:cursor-not-allowed ${isActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'} ${isLocked ? 'opacity-60' : ''}`}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                      <span aria-hidden="true">{item.emoji}</span> {item.label}
                      {isLocked && <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-accent-700"><Lock className="w-3 h-3" /> Gói {KIND_TIER[item.value]}</span>}
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">{item.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {places.length > 1 && (
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-700 mb-1.5">Áp dụng tại</legend>
            <div className="flex flex-wrap gap-2">
              {places.map((place) => {
                const checked = form.place_ids.includes(place.id);
                return (
                  <label key={place.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border text-sm cursor-pointer ${checked ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-neutral-300 text-neutral-600'}`}>
                    <input type="checkbox" className="accent-primary-600" checked={checked} onChange={() => set('place_ids', checked ? form.place_ids.filter((id) => id !== place.id) : [...form.place_ids, place.id])} />
                    {place.name}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="grid sm:grid-cols-[1fr_180px] gap-3">
          <Field label="Tên chương trình">
            <input className={inputClass} value={form.title} maxLength={60} onChange={(event) => set('title', event.target.value)} placeholder={isWheel ? 'VD: Vòng quay khai trương' : 'VD: Giờ vàng cuối tuần'} />
          </Field>
          <Field label="Nhãn ngắn trên thẻ quán">
            <input className={inputClass} value={form.label} maxLength={16} onChange={(event) => set('label', event.target.value)} placeholder="-20%" />
          </Field>
        </div>
        <div className="flex flex-wrap gap-1.5 -mt-2">
          {LABEL_PRESETS[form.kind].map((preset) => (
            <button key={preset} type="button" onClick={() => set('label', preset)} className="px-2.5 py-1 rounded-pill bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700">{preset}</button>
          ))}
        </div>
        <Field label="Mô tả / điều kiện (không bắt buộc)">
          <textarea className={`${inputClass} resize-none`} rows={2} maxLength={300} value={form.description} onChange={(event) => set('description', event.target.value)} placeholder="VD: Áp dụng cho hoá đơn từ 100k, không áp dụng cùng ưu đãi khác" />
        </Field>

        {form.kind === 'deal' && (
          <Field label="Mã khuyến mãi chung (không bắt buộc)" hint="Ai cũng thấy mã này trên thẻ quán. Muốn mỗi khách 1 mã riêng, giới hạn số lượng => chọn Voucher giới hạn.">
            <input className={`${inputClass} uppercase`} value={form.code} maxLength={20} onChange={(event) => set('code', event.target.value.replace(/[^A-Za-z0-9_-]/g, ''))} placeholder="CUOITUAN" />
          </Field>
        )}
        {hasQuantity && (
          <Field label="Số lượng mã phát ra" hint={form.kind === 'checkin' ? 'Khách phải đứng cách quán dưới 200 m mới nhận được.' : 'Hết mã là sự kiện "cháy hàng" — tạo cảm giác săn nhanh tay.'}>
            <input className={inputClass} inputMode="numeric" value={form.quantity} onChange={(event) => set('quantity', event.target.value.replace(/\D/g, ''))} />
          </Field>
        )}
        {isWheel && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-neutral-700">Giải thưởng (mỗi khách quay 1 lần / ngày)</legend>
            <div className="grid grid-cols-[1fr_80px_80px_44px_32px] gap-2 text-[11px] font-semibold text-neutral-500">
              <span>Tên giải</span><span>Số lượng</span><span>Tỉ trọng</span><span>Tỉ lệ</span><span />
            </div>
            {form.prizes.map((prize, index) => (
              <div key={index} className="grid grid-cols-[1fr_80px_80px_44px_32px] gap-2 items-center">
                <input className={inputClass} value={prize.label} maxLength={30} onChange={(event) => setPrize(index, 'label', event.target.value)} aria-label={`Tên giải ${index + 1}`} />
                <input className={inputClass} inputMode="numeric" value={prize.quantity} onChange={(event) => setPrize(index, 'quantity', event.target.value.replace(/\D/g, ''))} aria-label={`Số lượng giải ${index + 1}`} />
                <input className={inputClass} inputMode="numeric" value={prize.weight} onChange={(event) => setPrize(index, 'weight', event.target.value.replace(/\D/g, ''))} aria-label={`Tỉ trọng giải ${index + 1}`} />
                <span className="text-xs font-bold text-neutral-700 tabular-nums">{chance(prize.weight)}%</span>
                <button type="button" onClick={() => set('prizes', form.prizes.filter((_, i) => i !== index))} disabled={form.prizes.length <= 1} className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 disabled:opacity-30" aria-label="Bỏ giải này">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_80px_80px_44px_32px] gap-2 items-center">
              <span className="text-sm text-neutral-600">😅 Chúc may mắn lần sau</span>
              <span />
              <input className={inputClass} inputMode="numeric" value={form.lose_weight} onChange={(event) => set('lose_weight', event.target.value.replace(/\D/g, ''))} aria-label="Tỉ trọng trượt" />
              <span className="text-xs font-bold text-neutral-700 tabular-nums">{chance(form.lose_weight)}%</span>
            </div>
            {form.prizes.length < 6 && (
              <button type="button" onClick={() => set('prizes', [...form.prizes, { label: '', quantity: '10', weight: '10' }])} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Thêm giải
              </button>
            )}
          </fieldset>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label={form.kind === 'deal' ? 'Bắt đầu' : 'Mở săn lúc'}>
            <input type="datetime-local" className={inputClass} value={form.starts_at} onChange={(event) => set('starts_at', event.target.value)} />
          </Field>
          <Field label="Kết thúc" hint="Tối đa 30 ngày.">
            <input type="datetime-local" className={inputClass} value={form.ends_at} onChange={(event) => set('ends_at', event.target.value)} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-1.5 -mt-2">
          <button type="button" onClick={() => setStartsAt(roundedNow())} className="px-2.5 py-1 rounded-pill bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700">Bắt đầu ngay</button>
          <button type="button" onClick={() => setStartsAt(tonightAt(20))} className="px-2.5 py-1 rounded-pill bg-accent-50 hover:bg-accent-100 text-xs font-semibold text-accent-800">⚡ Giờ vàng 20:00</button>
          {[1, 3, 7, 30].map((days) => (
            <button key={days} type="button" onClick={() => set('ends_at', toInput(new Date(fromInput(form.starts_at).getTime() + days * DAY_MS - (days === 30 ? 60 * 1000 : 0))))} className="px-2.5 py-1 rounded-pill bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700">
              Chạy {days} ngày
            </button>
          ))}
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-700 mb-1.5">Khách sẽ thấy</p>
          <PromotionPreview kind={kind} form={form} placeName={places.find((place) => form.place_ids.includes(place.id))?.name ?? places[0]?.name} />
        </div>

        <FormAlert message={error} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-button text-sm font-semibold text-neutral-600 hover:bg-neutral-100">Huỷ</button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-70">
            {isSaving && <span className="w-4 h-4 rounded-pill border-2 border-white/40 border-t-white animate-spin" />}
            {isEdit ? 'Lưu' : 'Tạo & đăng'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
