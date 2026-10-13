import { ImagePlus } from 'lucide-react';
import { ImageCropper } from '../../../components/ImageCropper';
import { FormAlert } from '../../../components/form/FormAlert';
import { Modal } from '../../../components/Modal';
import { resolveAssetUrl } from '../../../utils/resolveAssetUrl';
import { AVATAR_ACCEPT } from '../utils/profileConfig';
import { ProfileCover } from './ProfileCover';

const pickButton = 'inline-flex items-center justify-center gap-2 py-2.5 rounded-button text-sm font-semibold cursor-pointer transition';

// Đổi ảnh bìa: xem ảnh hiện tại → chọn ảnh → căn chỉnh khung 4:1 → lưu (hoặc xoá về dải màu mặc định).
export const CoverEditorModal = ({ editor }) => {
  const { modal, error, isSaving, pickFile, save, remove, coverUrl, crop } = editor;
  const fileInput = <input type="file" accept={AVATAR_ACCEPT} className="sr-only" onChange={(event) => pickFile(event.target.files?.[0])} />;

  return (
    <Modal isOpen={modal.isOpen} title={crop ? 'Căn chỉnh ảnh bìa' : 'Ảnh bìa'} onClose={modal.close} containerRef={modal.containerRef} size="lg">
      <div className="space-y-5">
        <FormAlert message={error} />
        {crop ? (
          <>
            <ImageCropper
              shape="rect"
              src={crop.src}
              viewportSize={crop.viewportSize}
              viewportRef={crop.cropper.viewportRef}
              imageStyle={crop.cropper.imageStyle}
              pointerHandlers={crop.cropper.pointerHandlers}
              zoom={crop.cropper.zoom}
              onZoomChange={crop.cropper.setZoom}
              onReset={crop.cropper.reset}
            />
            <div className="grid grid-cols-2 gap-2">
              <label className={`${pickButton} text-primary-700 bg-primary-100 hover:bg-primary-200`}>
                Chọn ảnh khác
                {fileInput}
              </label>
              <button type="button" onClick={save} disabled={isSaving} className="py-2.5 rounded-button text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60">
                {isSaving ? 'Đang lưu…' : 'Lưu ảnh bìa'}
              </button>
            </div>
            <button type="button" onClick={crop.cancel} disabled={isSaving} className="w-full text-sm font-medium text-neutral-500 hover:text-neutral-800">
              Quay lại
            </button>
          </>
        ) : (
          <>
            <div className="aspect-[4/1] rounded-card overflow-hidden">
              <ProfileCover src={coverUrl ? resolveAssetUrl(coverUrl) : null} />
            </div>
            <p className="text-xs text-neutral-500 text-center">JPG, PNG, WEBP · ảnh ngang đẹp nhất (VD phong cảnh, quán bạn thích) · bạn tự chọn vùng ảnh ở bước sau</p>
            <div className={`grid gap-2 ${coverUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {coverUrl && (
                <button type="button" onClick={remove} disabled={isSaving} className="py-2.5 rounded-button text-sm font-semibold text-danger-600 bg-danger-50 hover:bg-danger-100 disabled:opacity-60">
                  {isSaving ? 'Đang xoá…' : 'Xoá ảnh bìa'}
                </button>
              )}
              <label className={`${pickButton} text-white bg-primary-600 hover:bg-primary-700`}>
                <ImagePlus className="w-4 h-4" />
                {coverUrl ? 'Đổi ảnh khác' : 'Tải ảnh từ máy'}
                {fileInput}
              </label>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
