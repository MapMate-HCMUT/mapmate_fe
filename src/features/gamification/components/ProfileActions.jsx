import { Icon } from '../../../components/Icon';

const buttonClass = 'flex items-center justify-center gap-2 py-2.5 rounded-button text-sm font-semibold transition';

// 2 nút chính trên thẻ hồ sơ của chính mình.
export const ProfileActions = ({ onEdit, onShare }) => (
  <>
    <button type="button" onClick={onEdit} className={`${buttonClass} bg-primary-600 hover:bg-primary-700 text-white`}>
      <Icon name="edit" className="w-4 h-4" />
      Chỉnh sửa
    </button>
    <button type="button" onClick={onShare} className={`${buttonClass} bg-primary-100 hover:bg-primary-200 text-primary-700`}>
      <Icon name="share" className="w-4 h-4" />
      Chia sẻ hồ sơ
    </button>
  </>
);
