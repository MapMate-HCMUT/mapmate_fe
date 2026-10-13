// Màu ô vòng quay (trang trí, không mang dữ liệu) — ô "trượt" luôn xám
const SLICE_COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899'];
const LOSE_COLOR = '#d4d4d4';

/** Các ô của vòng quay: mỗi giải 1 ô, xen "Trượt" giữa các giải (chỉ để nhìn — kết quả thật do server bốc thăm) */
const MIN_SLICES = 8; // ít giải thì lặp lại cho vòng quay đủ ô, nhìn "đã mắt" hơn

export const buildSlices = (prizes) => {
  const slices = [];
  for (let round = 0; round === 0 || slices.length < MIN_SLICES; round += 1) {
    prizes.forEach((prize, index) => {
      slices.push({ key: `p-${prize.id}-${round}`, prizeId: String(prize.id), label: prize.label, color: SLICE_COLORS[index % SLICE_COLORS.length] });
      slices.push({ key: `l-${index}-${round}`, prizeId: null, label: 'Trượt', color: LOSE_COLOR });
    });
  }
  return slices;
};

/** Góc quay để kim (ở đỉnh) chỉ vào ô của kết quả: quay thêm vài vòng cho đã mắt */
export const targetRotation = (slices, prizeId, current) => {
  const candidates = slices.map((slice, index) => ({ slice, index })).filter(({ slice }) => slice.prizeId === (prizeId ? String(prizeId) : null));
  const { index } = candidates[Math.floor(Math.random() * candidates.length)] ?? { index: 0 };
  const size = 360 / slices.length;
  const center = index * size + size / 2;
  const base = current - (current % 360);
  return base + 360 * 6 + (360 - center);
};
