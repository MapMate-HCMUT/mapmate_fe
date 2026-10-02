const THOUSAND = 1000;

// 55000 -> "55k", 1000000 -> "1.000k"
export const formatShortVND = (amount) => `${Math.round(amount / THOUSAND).toLocaleString('vi-VN')}k`;

export const formatPriceRange = ({ min, max }) => {
  if (!max) return 'Miễn phí';
  if (min === max) return formatShortVND(min);
  return `${formatShortVND(min)} – ${formatShortVND(max)}`;
};
