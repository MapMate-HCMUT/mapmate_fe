import { Store, UserRound } from 'lucide-react';
import { ACCOUNT_TYPES } from '../utils/accountTypes';


const OPTIONS = [
  { value: ACCOUNT_TYPES.PERSONAL, icon: UserRound, title: 'Người dùng', hint: 'Khám phá, lên lộ trình' },
  { value: ACCOUNT_TYPES.BUSINESS, icon: Store, title: 'Chủ cửa hàng', hint: 'Đưa quán lên bản đồ' },
];

// Chọn loại tài khoản trước khi đăng nhập: cùng 1 tài khoản Google, chủ cửa hàng được đưa thẳng tới bước đăng ký cửa hàng.
export const AccountTypePicker = ({ value, onChange }) => (
  <fieldset>
    <legend className="mb-2 text-xs font-semibold text-neutral-500">Bạn đăng nhập với tư cách</legend>
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map(({ value: option, icon: Icon, title, hint }) => {
        const isActive = value === option;
        return (
          <label
            key={option}
            className={`relative flex items-start gap-2.5 p-3 rounded-input border cursor-pointer transition ${
              isActive ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <input type="radio" name="account-type" value={option} checked={isActive} onChange={() => onChange(option)} className="sr-only" />
            <span className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-500'}`} aria-hidden="true">
              <Icon className="w-4.5 h-4.5" />
            </span>
            <span className="min-w-0">
              <span className={`block text-sm font-bold ${isActive ? 'text-primary-800' : 'text-neutral-800'}`}>{title}</span>
              <span className="block text-[11px] text-neutral-500 leading-snug">{hint}</span>
            </span>
          </label>
        );
      })}
    </div>
  </fieldset>
);
