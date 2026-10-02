import { Avatar } from '../../../components/Avatar';
import { FormAlert } from '../../../components/form/FormAlert';
import { TextField } from '../../../components/form/TextField';
import { Icon } from '../../../components/Icon';
import { Modal } from '../../../components/Modal';
import { AVATAR_ACCEPT, AVATAR_PRESETS, PROFILE_AVATAR_SIZE } from '../utils/profileConfig';
import { AvatarCropStep } from './AvatarCropStep';

export const AvatarEditorModal = ({ editor, username }) => {
  const { modal, draft, error, isSaving, pickFile, pickPreset, changeLink, save, remove, hasAvatar, crop } = editor;

  if (crop) {
    return (
      <Modal isOpen={modal.isOpen} title="Căn chỉnh ảnh đại diện" onClose={modal.close} containerRef={modal.containerRef}>
        <AvatarCropStep crop={crop} onPickFile={pickFile} />
      </Modal>
    );
  }

  return (
    <Modal isOpen={modal.isOpen} title="Ảnh đại diện" onClose={modal.close} containerRef={modal.containerRef}>
      <div className="space-y-5">
        <FormAlert message={error} />
        <div className="flex flex-col items-center gap-3">
          <Avatar name={username} src={draft.preview} size={PROFILE_AVATAR_SIZE} className="shadow-card" />
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold cursor-pointer transition">
            <Icon name="plus" className="w-4 h-4" />
            Tải ảnh từ máy
            <input type="file" accept={AVATAR_ACCEPT} className="sr-only" onChange={(event) => pickFile(event.target.files?.[0])} />
          </label>
          <p className="text-xs text-neutral-500">JPG, PNG, WEBP · bạn tự chọn vùng ảnh ở bước sau</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-700 mb-2">Hoặc chọn avatar có sẵn</p>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_PRESETS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => pickPreset(url)}
                aria-label="Chọn avatar mẫu"
                className={`aspect-square rounded-pill bg-neutral-100 overflow-hidden ring-2 transition ${draft.preview === url ? 'ring-primary-500' : 'ring-transparent hover:ring-primary-200'}`}
              >
                <img src={url} alt="" className="w-full h-full" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <TextField label="Hoặc dán link ảnh" type="url" placeholder="https://…/avatar.jpg" value={draft.linkInput} onChange={changeLink} />

        <div className={`grid gap-2 ${hasAvatar ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {hasAvatar && (
            <button type="button" onClick={remove} disabled={isSaving} className="py-2.5 rounded-button text-sm font-semibold text-danger-600 bg-danger-50 hover:bg-danger-100 disabled:opacity-60">
              Xoá ảnh
            </button>
          )}
          <button type="button" onClick={save} disabled={isSaving} className="py-2.5 rounded-button text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60">
            {isSaving ? 'Đang lưu…' : 'Lưu ảnh'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
