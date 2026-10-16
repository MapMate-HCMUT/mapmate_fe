// Ảnh bìa hồ sơ; chưa có ảnh => banner bản đồ thám hiểm MapMate (dải màu gradient sâu + đường đồng mức địa hình / contour map tinh tế)
export const ProfileCover = ({ src, alt = '' }) => {
  if (src) {
    return <img src={src} alt={alt} className="w-full h-full object-cover" />;
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 select-none"
      aria-hidden="true"
    >
      {/* Lớp phủ sáng mềm (ambient glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_65%)]" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-emerald-400/25 blur-2xl pointer-events-none" />
      <div className="absolute -top-12 right-1/4 w-52 h-52 rounded-full bg-cyan-300/20 blur-2xl pointer-events-none" />

      {/* Hoạ tiết đường đồng mức bản đồ (Topographic Map Contours) tinh tế */}
      <svg
        className="absolute inset-0 w-full h-full stroke-white/[0.15] fill-none pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M-50,180 C120,130 220,190 380,140 C540,90 680,160 850,110" strokeWidth="1.5" />
        <path d="M-50,140 C140,80 260,160 420,100 C580,40 700,120 850,70" strokeWidth="1.5" />
        <path d="M-50,100 C100,50 240,110 400,60 C560,10 660,80 850,30" strokeWidth="1.2" strokeDasharray="6 4" />
        <path d="M-50,60 C80,10 210,70 360,20 C510,-30 640,40 850,-10" strokeWidth="1.5" />
        <path d="M-50,20 C160,-20 300,40 480,-10 C620,-50 720,10 850,-30" strokeWidth="1" />

        {/* Điểm toạ độ / waypoint cách điệu */}
        <circle cx="280" cy="85" r="3" className="fill-white/30" />
        <circle cx="280" cy="85" r="8" strokeWidth="1" className="stroke-white/20" />
        <circle cx="580" cy="115" r="2.5" className="fill-white/30" />
        <circle cx="580" cy="115" r="7" strokeWidth="1" className="stroke-white/20" />
        <circle cx="670" cy="45" r="2" className="fill-white/25" />

        {/* La bàn / compass rose góc phải mờ */}
        <g transform="translate(730, 60)" opacity="0.12" className="stroke-white">
          <circle cx="0" cy="0" r="36" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="28" strokeWidth="0.8" strokeDasharray="3 3" />
          <path d="M0,-36 L0,36 M-36,0 L36,0" strokeWidth="1" />
          <polygon points="0,-32 4,-12 0,-16 -4,-12" className="fill-white" />
          <polygon points="0,32 4,12 0,16 -4,12" className="fill-white/60" />
          <polygon points="-32,0 -12,4 -16,0 -12,-4" className="fill-white/60" />
          <polygon points="32,0 12,4 16,0 12,-4" className="fill-white/60" />
        </g>
      </svg>
    </div>
  );
};
