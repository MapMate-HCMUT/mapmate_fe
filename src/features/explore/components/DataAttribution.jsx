// Dòng ghi nguồn dữ liệu địa điểm — bắt buộc khi dùng dữ liệu OpenStreetMap (ODbL) và Overture Maps (CDLA).
export const DataAttribution = ({ items = [] }) => {
  if (items.length === 0) return null;
  return (
    <p className="mt-4 text-center text-[11px] text-neutral-400">
      Dữ liệu địa điểm:{' '}
      {items.map((item, index) => (
        <span key={item.url}>
          {index > 0 && ' · '}
          <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline">{item.label}</a> ({item.license})
        </span>
      ))}
      {' '}· MapMate. Giá, giờ mở cửa của dữ liệu mở có thể chưa chính xác.
    </p>
  );
};
