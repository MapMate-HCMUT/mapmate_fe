import { useState } from 'react';
import { Link } from 'react-router';
import { FormAlert } from '../../../components/form/FormAlert';
import { PhoneField } from '../../../components/form/PhoneField';
import { TextField } from '../../../components/form/TextField';
import { useToast } from '../../../hooks/useToast';
import { updateMyBusinessApi } from '../api/businessApi';
import { useConsole } from '../hooks/useConsole';

// Hồ sơ doanh nghiệp (tên thương hiệu hiện trong phản hồi đánh giá, thông báo khuyến mãi; liên hệ mặc định cho cửa hàng mới)
export const SettingsPage = () => {
  const { data, reload } = useConsole();
  const [values, setValues] = useState({
    name: data.business.name,
    phone: data.business.phone ?? '',
    website: data.business.website ?? '',
    description: data.business.description ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const set = (field) => (value) => setValues((prev) => ({ ...prev, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await updateMyBusinessApi({ name: values.name.trim(), phone: values.phone, website: values.website.trim(), description: values.description.trim() });
      showToast('Đã lưu hồ sơ doanh nghiệp');
      reload();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-2xl bg-surface rounded-card shadow-card p-4 sm:p-6 space-y-4" noValidate>
      <TextField label="Tên thương hiệu" value={values.name} onChange={set('name')} maxLength={80} />
      <p className="-mt-2 text-[11px] text-neutral-400">Hiện khi bạn trả lời đánh giá và trong thông báo khuyến mãi gửi khách.</p>
      <PhoneField label="Số điện thoại" optional value={values.phone} onChange={set('phone')} />
      <TextField label="Website / Fanpage (không bắt buộc)" value={values.website} onChange={set('website')} placeholder="facebook.com/quancuaban" />
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-neutral-700">Giới thiệu thương hiệu (không bắt buộc)</span>
        <textarea rows={4} maxLength={600} value={values.description} onChange={(event) => set('description')(event.target.value)} className="w-full py-2.5 px-3 border border-neutral-300 rounded-input text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
      </label>
      <FormAlert message={error} />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
        <Link to="/profile" className="text-sm font-semibold text-neutral-500 hover:text-neutral-800">Hồ sơ cá nhân →</Link>
        <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-70">
          {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
};
