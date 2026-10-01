import { ImageCropper } from '../../../components/ImageCropper';
import { AVATAR_ACCEPT } from '../utils/profileConfig';

// Bước căn chỉnh vùng ảnh sau khi chọn file.
export const AvatarCropStep = ({ crop, onPickFile }) => {
  const { viewportRef, imageStyle, pointerHandlers, zoom, setZoom, reset } = crop.cropper;

  return (
    <div className="space-y-5">
      <ImageCropper
        src={crop.src}
        viewportSize={crop.viewportSize}
        viewportRef={viewportRef}
        imageStyle={imageStyle}
        pointerHandlers={pointerHandlers}
        zoom={zoom}
        onZoomChange={setZoom}
        onReset={reset}
      />
      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center justify-center py-2.5 rounded-button text-sm font-semibold text-primary-700 bg-primary-100 hover:bg-primary-200 cursor-pointer transition">
          Chọn ảnh khác
          <input type="file" accept={AVATAR_ACCEPT} className="sr-only" onChange={(event) => onPickFile(event.target.files?.[0])} />
        </label>
        <button type="button" onClick={crop.confirm} className="py-2.5 rounded-button text-sm font-bold text-white bg-primary-600 hover:bg-primary-700">
          Dùng ảnh này
        </button>
      </div>
      <button type="button" onClick={crop.cancel} className="w-full text-sm font-medium text-neutral-500 hover:text-neutral-800">
        Huỷ
      </button>
    </div>
  );
};
