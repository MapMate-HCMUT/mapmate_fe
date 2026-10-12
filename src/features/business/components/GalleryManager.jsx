import { useRef } from 'react';
import { ImagePlus, LoaderCircle, Play, RotateCw, X } from 'lucide-react';

// Lưới ảnh / video của cửa hàng: thêm (tải ngay lên Cloudinary), bỏ, thử lại. Thay đổi chỉ có hiệu lực khi bấm Lưu.
export const GalleryManager = ({ gallery, tier }) => {
  const inputRef = useRef(null);
  const videoCount = gallery.items.filter((item) => item.kind === 'video').length;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-700">Ảnh & video cửa hàng</p>
        <p className="text-xs text-neutral-500">
          {gallery.items.length}/{tier.gallery_items} file · {videoCount}/{tier.gallery_videos} video
        </p>
      </div>
      <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {gallery.items.map((item) => (
          <li key={item.id} className="relative aspect-square rounded-input overflow-hidden bg-neutral-100">
            {item.kind === 'video' && item.status !== 'saved' ? (
              <video src={item.previewUrl} muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
            )}
            {item.kind === 'video' && (
              <span className="absolute bottom-1.5 left-1.5 p-1 rounded-pill bg-ink/70 text-white" aria-label="Video">
                <Play className="w-3 h-3 fill-white" />
              </span>
            )}
            {item.status === 'uploading' && (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/50 text-white text-xs font-semibold">
                <LoaderCircle className="w-5 h-5 animate-spin" /> {item.progress}%
              </span>
            )}
            {item.status === 'error' && (
              <button type="button" onClick={() => gallery.retry(item.id)} className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-danger-700/70 text-white text-xs font-semibold">
                <RotateCw className="w-4 h-4" /> Thử lại
              </button>
            )}
            <button
              type="button"
              onClick={() => gallery.remove(item.id)}
              aria-label="Bỏ file này"
              className="absolute top-1 right-1 p-1 rounded-pill bg-ink/70 text-white hover:bg-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
        {gallery.items.length < tier.gallery_items && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={!gallery.isEnabled}
              className="w-full aspect-square rounded-input border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50/50 text-neutral-500 hover:text-primary-700 flex flex-col items-center justify-center gap-1 text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImagePlus className="w-6 h-6" />
              Thêm
            </button>
          </li>
        )}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          gallery.addFiles(event.target.files);
          event.target.value = '';
        }}
      />
      {gallery.notice && <p className="text-xs font-medium text-warning-700" role="status">{gallery.notice}</p>}
    </div>
  );
};
