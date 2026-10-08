import { ImagePlus, Play, RotateCw, X } from 'lucide-react';
import { formatMegabytes } from '../utils/mediaUpload';

// Chọn ảnh / video đính kèm: ô xem trước + % tải lên + xoá / thử lại. Server chưa bật Cloudinary => ẩn hẳn.
export const ComposerMediaPicker = ({ media }) => {
  if (!media.isEnabled) return null;
  const { config, items } = media;
  const canAdd = items.length < config.max_items;

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.map((item) => (
            <li key={item.id} className="relative aspect-square rounded-input overflow-hidden bg-neutral-100">
              {item.kind === 'video' ? (
                <>
                  <video src={item.previewUrl} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                  <Play className="absolute inset-0 m-auto w-7 h-7 text-white drop-shadow" aria-hidden="true" />
                </>
              ) : (
                <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
              )}
              {item.status === 'uploading' && (
                <div className="absolute inset-0 bg-neutral-900/45 flex items-center justify-center text-xs font-bold text-white">{item.progress}%</div>
              )}
              {item.status === 'error' && (
                <button type="button" onClick={() => media.retry(item.id)} title={item.error} className="absolute inset-0 bg-danger-600/70 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-white">
                  <RotateCw className="w-4 h-4" /> Thử lại
                </button>
              )}
              <button type="button" onClick={() => media.remove(item.id)} aria-label="Bỏ file này" className="absolute top-1 right-1 p-1 rounded-pill bg-neutral-900/60 text-white hover:bg-neutral-900/80">
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {canAdd && (
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-button border border-dashed border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer">
          <ImagePlus className="w-4.5 h-4.5 text-primary-600" />
          Thêm ảnh / video
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="sr-only"
            onChange={(event) => {
              media.addFiles(event.target.files);
              event.target.value = ''; // chọn lại đúng file đó vẫn nhận
            }}
          />
        </label>
      )}
      <p className="text-[11px] text-neutral-400">
        Tối đa {config.max_items} file · ảnh ≤ {formatMegabytes(config.image_max_bytes)} · {config.max_videos} video ≤ {config.video_max_seconds} giây, {formatMegabytes(config.video_max_bytes)}
      </p>
      {media.notice && <p className="text-xs text-warning-700">{media.notice}</p>}
    </div>
  );
};
