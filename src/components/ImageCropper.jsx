import { CROPPER_MAX_ZOOM, CROPPER_MIN_ZOOM } from '../hooks/useImageCropper';

const ZOOM_STEP = 0.01;

// Khung cắt ảnh: vùng sáng hình tròn = phần sẽ thành ảnh đại diện. Logic nằm trong useImageCropper.
export const ImageCropper = ({ src, viewportSize, viewportRef, imageStyle, pointerHandlers, zoom, onZoomChange, onReset }) => (
  <div className="flex flex-col items-center gap-3">
    <div
      ref={viewportRef}
      {...pointerHandlers}
      className="relative overflow-hidden rounded-card bg-neutral-900 cursor-grab active:cursor-grabbing touch-none select-none"
      style={{ width: viewportSize, height: viewportSize }}
      aria-label="Kéo để chọn vị trí, cuộn hoặc chụm 2 ngón để phóng to"
    >
      <img src={src} alt="" draggable={false} className="absolute left-1/2 top-1/2 max-w-none pointer-events-none" style={imageStyle} />
      {/* Phủ tối bên ngoài vòng tròn (ring rất dày tràn ra ngoài, bị overflow-hidden cắt) */}
      <div className="absolute inset-0 rounded-pill ring-[9999px] ring-neutral-900/55 pointer-events-none" />
      <div className="absolute inset-0 rounded-pill border-2 border-white/80 pointer-events-none" />
    </div>

    <div className="w-full flex items-center gap-3" style={{ maxWidth: viewportSize }}>
      <span className="text-sm text-neutral-400" aria-hidden="true">－</span>
      <input
        type="range"
        min={CROPPER_MIN_ZOOM}
        max={CROPPER_MAX_ZOOM}
        step={ZOOM_STEP}
        value={zoom}
        onChange={(event) => onZoomChange(Number(event.target.value))}
        aria-label="Phóng to / thu nhỏ"
        className="flex-1 accent-primary-600"
      />
      <span className="text-sm text-neutral-400" aria-hidden="true">＋</span>
      <button type="button" onClick={onReset} className="text-xs font-semibold text-primary-700 hover:underline">
        Đặt lại
      </button>
    </div>
    <p className="text-xs text-neutral-500 text-center">Kéo ảnh để chọn vị trí · cuộn chuột hoặc chụm 2 ngón để phóng to</p>
  </div>
);
