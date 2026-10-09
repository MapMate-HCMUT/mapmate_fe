import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Ảnh / video trong bài viết: 1 file => hiện lớn; nhiều file => lưới. Bấm ảnh => xem to (trái / phải để chuyển).
export const PostMedia = ({ media }) => {
  const [openIndex, setOpenIndex] = useState(null);
  if (!media?.length) return null;
  const images = media.filter((item) => item.type === 'image');
  const single = media.length === 1;

  return (
    <>
      <div className={single ? '' : 'grid grid-cols-2 sm:grid-cols-3 gap-1.5'}>
        {media.map((item, index) =>
          item.type === 'video' ? (
            <video
              key={item.url}
              src={item.url}
              poster={item.poster_url}
              controls
              playsInline
              preload="none"
              className={`w-full rounded-input bg-neutral-900 ${single ? 'max-h-[480px]' : 'aspect-square object-cover col-span-2 sm:col-span-1'}`}
            />
          ) : (
            <button key={item.url} type="button" onClick={() => setOpenIndex(images.indexOf(item))} className="block w-full overflow-hidden rounded-input bg-neutral-100" aria-label={`Xem ảnh ${index + 1}`}>
              <img src={single ? item.url : item.thumb_url} alt="" loading="lazy" className={`w-full object-cover hover:opacity-95 transition ${single ? 'max-h-[480px]' : 'aspect-square'}`} />
            </button>
          ),
        )}
      </div>

      {openIndex !== null && images[openIndex] && (
        <div className="fixed inset-0 z-[80] bg-neutral-950/90 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Xem ảnh" onClick={() => setOpenIndex(null)}>
          <img src={images[openIndex].url} alt="" className="max-w-full max-h-full object-contain rounded-input" onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={() => setOpenIndex(null)} aria-label="Đóng" className="absolute top-4 right-4 p-2 rounded-pill bg-white/15 text-white hover:bg-white/25">
            <X className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" aria-label="Ảnh trước" onClick={(event) => { event.stopPropagation(); setOpenIndex((openIndex - 1 + images.length) % images.length); }} className="absolute left-3 p-2 rounded-pill bg-white/15 text-white hover:bg-white/25">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button type="button" aria-label="Ảnh sau" onClick={(event) => { event.stopPropagation(); setOpenIndex((openIndex + 1) % images.length); }} className="absolute right-3 p-2 rounded-pill bg-white/15 text-white hover:bg-white/25">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};
