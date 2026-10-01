import { Icon } from '../../../components/Icon';
import { formatBirthDate, formatHomeArea } from '../utils/profileConfig';

const Row = ({ icon, label, value }) => (
  <div className="flex gap-3 py-3">
    <span className="w-9 h-9 shrink-0 rounded-pill bg-neutral-100 flex items-center justify-center" aria-hidden="true">{icon}</span>
    <div className="min-w-0">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className={`text-sm ${value ? 'font-medium text-neutral-800' : 'text-neutral-400 italic'}`}>{value ?? 'Chưa cập nhật'}</dd>
    </div>
  </div>
);

export const PersonalInfoCard = ({ profile, onEdit }) => (
  <section className="bg-surface rounded-card shadow-card p-5">
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-neutral-900">🪪 Thông tin cá nhân</h2>
      <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-sm font-semibold text-primary-700 hover:bg-primary-50">
        <Icon name="edit" className="w-4 h-4" />
        Chỉnh sửa
      </button>
    </div>
    <dl className="divide-y divide-neutral-100">
      <Row icon="✉️" label="Email" value={profile.email} />
      <Row icon="🎂" label="Ngày sinh" value={formatBirthDate(profile.birth_date)} />
      <Row icon="📍" label="Khu vực sinh sống" value={formatHomeArea(profile.home_area)} />
    </dl>
    <p className="mt-2 p-3 rounded-input bg-info-50 text-xs text-info-800">
      🔒 Ngày sinh và tên đường chỉ mình bạn thấy. Người khác chỉ thấy thành phố và quốc gia. MapMate không lưu số nhà hay toạ độ GPS của bạn.
    </p>
  </section>
);
