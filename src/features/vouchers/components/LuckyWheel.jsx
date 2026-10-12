import { useMemo } from 'react';

const RADIUS = 100;

const polar = (angle, radius = RADIUS) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [RADIUS + radius * Math.cos(rad), RADIUS + radius * Math.sin(rad)];
};

export const LuckyWheel = ({ slices, rotation, isSpinning }) => {
  const size = 360 / slices.length;
  const paths = useMemo(
    () =>
      slices.map((slice, index) => {
        const [x1, y1] = polar(index * size);
        const [x2, y2] = polar((index + 1) * size);
        const [tx, ty] = polar(index * size + size / 2, RADIUS * 0.62);
        return { ...slice, d: `M${RADIUS},${RADIUS} L${x1},${y1} A${RADIUS},${RADIUS} 0 0 1 ${x2},${y2} Z`, tx, ty, angle: index * size + size / 2 };
      }),
    [slices, size],
  );

  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto">
      {/* Kim chỉ */}
      <div className="absolute left-1/2 -top-2 -translate-x-1/2 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-neutral-900 drop-shadow" aria-hidden="true" />
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full rounded-full shadow-[0_10px_30px_-8px_rgb(0_0_0/0.35)] ring-8 ring-neutral-900"
        style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 1)' : 'none' }}
        role="img"
        aria-label={`Vòng quay gồm: ${slices.filter((slice) => slice.prizeId).map((slice) => slice.label).join(', ')}`}
      >
        {paths.map((slice) => (
          <g key={slice.key}>
            <path d={slice.d} fill={slice.color} stroke="#fff" strokeWidth="1.5" />
            <text x={slice.tx} y={slice.ty} transform={`rotate(${slice.angle} ${slice.tx} ${slice.ty})`} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="700" fill={slice.prizeId ? '#fff' : '#525252'}>
              {slice.label.length > 14 ? `${slice.label.slice(0, 13)}…` : slice.label}
            </text>
          </g>
        ))}
        <circle cx="100" cy="100" r="14" fill="#171717" />
        <circle cx="100" cy="100" r="6" fill="#fbbf24" />
      </svg>
    </div>
  );
};
