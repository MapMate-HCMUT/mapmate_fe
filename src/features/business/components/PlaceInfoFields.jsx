import { PhoneField } from '../../../components/form/PhoneField';
import { TextField } from '../../../components/form/TextField';
import { getCategory } from '../../map';
import { BUSINESS_CATEGORIES } from '../utils/businessConfig';
import { WeeklyHoursEditor } from './WeeklyHoursEditor';

const inputClass = (error) =>
  `w-full py-2.5 px-3.5 bg-surface border rounded-input text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition ${
    error ? 'border-danger-500 focus:ring-danger-500/20' : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20'
  }`;
// 35000 => "35.000" khi đang gõ (lưu vẫn là số)
const formatMoneyInput = (digits) => (digits === '' ? '' : Number(digits).toLocaleString('vi-VN'));
const FieldError = ({ message }) => (message ? <p className="text-xs font-medium text-danger-600">{message}</p> : null);
const Label = ({ htmlFor, children, optional = false }) => (
  <label htmlFor={htmlFor} className="block text-sm font-semibold text-neutral-700">
    {children} {optional && <span className="font-normal text-neutral-400">(không bắt buộc)</span>}
  </label>
);

// Thông tin cửa hàng: tên, loại hình, liên hệ, giá, giờ mở cửa, món nổi bật, mô tả
export const PlaceInfoFields = ({ form }) => {
  const { values, errors, setField } = form;
  return (
    <div className="space-y-4">
      <TextField label="Tên cửa hàng" value={values.name} onChange={(value) => setField('name', value)} error={errors.name} placeholder="VD: Mây Coffee Nguyễn Huệ" maxLength={80} />

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-semibold text-neutral-700">Loại hình</legend>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_CATEGORIES.map((value) => {
            const { label, emoji } = getCategory(value);
            const isActive = values.category === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setField('category', value)}
                className={`px-3 py-1.5 rounded-pill text-sm font-medium border transition ${
                  isActive ? 'bg-primary-600 border-primary-600 text-white' : 'bg-surface border-neutral-300 text-neutral-700 hover:border-primary-400'
                }`}
              >
                <span aria-hidden="true">{emoji}</span> {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="biz-price-min">Giá thấp nhất (đ)</Label>
          <input id="biz-price-min" inputMode="numeric" value={formatMoneyInput(values.price_min)} onChange={(event) => setField('price_min', event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="35.000" className={inputClass(errors.price_min)} />
          <FieldError message={errors.price_min} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="biz-price-max">Giá cao nhất (đ)</Label>
          <input id="biz-price-max" inputMode="numeric" value={formatMoneyInput(values.price_max)} onChange={(event) => setField('price_max', event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="80.000" className={inputClass(errors.price_max)} />
          <FieldError message={errors.price_max} />
        </div>
      </div>

      <PhoneField label="Số điện thoại" optional value={values.phone} onChange={(value) => setField('phone', value)} error={errors.phone} />

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-neutral-700">Giờ mở cửa</legend>
        <WeeklyHoursEditor value={values.weekly} onChange={(value) => setField('weekly', value)} errors={errors.weekly || {}} />
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="biz-specialties" optional>Món / dịch vụ nổi bật</Label>
        <input id="biz-specialties" value={values.specialties} onChange={(event) => setField('specialties', event.target.value)} placeholder="Cà phê muối, bánh flan (cách nhau bằng dấu phẩy)" className={inputClass(false)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="biz-description" optional>Giới thiệu ngắn</Label>
        <textarea id="biz-description" rows={3} maxLength={600} value={values.description} onChange={(event) => setField('description', event.target.value)} placeholder="Không gian, điểm đặc biệt, phù hợp với ai…" className={`${inputClass(false)} resize-y`} />
        <p className="text-right text-[11px] text-neutral-400">{values.description.length}/600</p>
      </div>
    </div>
  );
};
