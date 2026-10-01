import { Icon } from '../../../components/Icon';

const ROW_CLASS = 'w-full flex items-center gap-3 px-3 py-3 rounded-button text-left text-sm font-semibold transition';

const SettingRow = ({ icon, label, onClick }) => (
  <button type="button" onClick={onClick} className={`${ROW_CLASS} text-neutral-700 hover:bg-neutral-50`}>
    <span className="w-5 text-center text-neutral-400" aria-hidden="true">{icon}</span>
    <span className="flex-1">{label}</span>
    <span className="text-neutral-300" aria-hidden="true">›</span>
  </button>
);

// Nhóm thao tác tài khoản.
export const AccountSettingsCard = ({ onEditProfile, onEditAvatar, onEditPersonalInfo, onChangePassword, onLogout }) => (
  <section className="bg-surface rounded-card shadow-card p-2">
    <h2 className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Tài khoản</h2>
    <SettingRow icon="✏️" label="Đổi tên người dùng" onClick={onEditProfile} />
    <SettingRow icon="📷" label="Đổi ảnh đại diện" onClick={onEditAvatar} />
    <SettingRow icon="🪪" label="Thông tin cá nhân" onClick={onEditPersonalInfo} />
    <SettingRow icon="🔑" label="Đổi mật khẩu" onClick={onChangePassword} />
    <button type="button" onClick={onLogout} className={`${ROW_CLASS} text-danger-600 hover:bg-danger-50`}>
      <Icon name="logout" className="w-5 h-5" />
      <span className="flex-1">Đăng xuất</span>
    </button>
  </section>
);
