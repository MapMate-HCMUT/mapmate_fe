// Dữ liệu mẫu theo schema collection PLACES (Milestone 2 — mục 4.2).
// Tọa độ GeoJSON: [kinh độ, vĩ độ]. Sẽ thay bằng API /api/places/trending khi backend sẵn sàng.

const point = (lng, lat) => ({ type: 'Point', coordinates: [lng, lat] });

export const MOCK_PLACES = [
  {
    id: 'pl_01', name: 'Phở Hòa Pasteur', category: 'food',
    address: '260C Pasteur, Phường 8, Quận 3', location: point(106.6893, 10.7869),
    rating: 4.6, review_count: 2345, price_range: { min: 60000, max: 120000 },
    opening_hours: '05:30 – 23:00', is_trending: true,
  },
  {
    id: 'pl_02', name: 'Bánh mì Huỳnh Hoa', category: 'food',
    address: '26 Lê Thị Riêng, Phường Bến Thành, Quận 1', location: point(106.6927, 10.7713),
    rating: 4.5, review_count: 5120, price_range: { min: 55000, max: 80000 },
    opening_hours: '14:30 – 23:00', is_trending: true,
  },
  {
    id: 'pl_03', name: 'Cơm tấm Ba Ghiền', category: 'food',
    address: '84 Đặng Văn Ngữ, Phường 10, Phú Nhuận', location: point(106.6731, 10.7959),
    rating: 4.4, review_count: 1890, price_range: { min: 50000, max: 90000 },
    opening_hours: '07:00 – 21:00', is_trending: false,
  },
  {
    id: 'pl_04', name: 'Bún bò Huế Đông Ba', category: 'food',
    address: '110A Nguyễn Du, Phường Bến Thành, Quận 1', location: point(106.6968, 10.7745),
    rating: 4.3, review_count: 870, price_range: { min: 45000, max: 75000 },
    opening_hours: '06:00 – 22:00', is_trending: false,
  },
  {
    id: 'pl_05', name: 'The Workshop Coffee', category: 'cafe',
    address: '27 Ngô Đức Kế, Phường Bến Nghé, Quận 1', location: point(106.7053, 10.7741),
    rating: 4.6, review_count: 3210, price_range: { min: 60000, max: 120000 },
    opening_hours: '08:00 – 21:00', is_trending: true,
  },
  {
    id: 'pl_06', name: 'Cộng Cà Phê', category: 'cafe',
    address: '26 Lý Tự Trọng, Phường Bến Nghé, Quận 1', location: point(106.7030, 10.7804),
    rating: 4.5, review_count: 2760, price_range: { min: 40000, max: 80000 },
    opening_hours: '07:00 – 23:00', is_trending: true,
  },
  {
    id: 'pl_07', name: 'Chung cư 42 Nguyễn Huệ', category: 'cafe',
    address: '42 Nguyễn Huệ, Phường Bến Nghé, Quận 1', location: point(106.7046, 10.7738),
    rating: 4.4, review_count: 4105, price_range: { min: 50000, max: 100000 },
    opening_hours: '08:00 – 23:00', is_trending: false,
  },
  {
    id: 'pl_08', name: 'Dinh Độc Lập', category: 'sightseeing',
    address: '135 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1', location: point(106.6953, 10.7770),
    rating: 4.7, review_count: 18400, price_range: { min: 40000, max: 65000 },
    opening_hours: '08:00 – 16:30', is_trending: true,
  },
  {
    id: 'pl_09', name: 'Nhà thờ Đức Bà', category: 'sightseeing',
    address: '01 Công xã Paris, Phường Bến Nghé, Quận 1', location: point(106.6990, 10.7798),
    rating: 4.7, review_count: 21500, price_range: { min: 0, max: 0 },
    opening_hours: 'Cả ngày', is_trending: false,
  },
  {
    id: 'pl_10', name: 'Bưu điện Trung tâm Sài Gòn', category: 'sightseeing',
    address: '02 Công xã Paris, Phường Bến Nghé, Quận 1', location: point(106.7000, 10.7799),
    rating: 4.6, review_count: 16300, price_range: { min: 0, max: 0 },
    opening_hours: '07:00 – 19:00', is_trending: false,
  },
  {
    id: 'pl_11', name: 'Bitexco Saigon Skydeck', category: 'sightseeing',
    address: '36 Hồ Tùng Mậu, Phường Bến Nghé, Quận 1', location: point(106.7044, 10.7717),
    rating: 4.4, review_count: 7900, price_range: { min: 200000, max: 260000 },
    opening_hours: '09:30 – 21:30', is_trending: false,
  },
  {
    id: 'pl_12', name: 'Nhà hát Thành phố', category: 'entertainment',
    address: '07 Công trường Lam Sơn, Phường Bến Nghé, Quận 1', location: point(106.7032, 10.7767),
    rating: 4.7, review_count: 6400, price_range: { min: 300000, max: 700000 },
    opening_hours: 'Theo lịch diễn', is_trending: true,
  },
  {
    id: 'pl_13', name: 'Phố đi bộ Nguyễn Huệ', category: 'entertainment',
    address: 'Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1', location: point(106.7034, 10.7752),
    rating: 4.6, review_count: 25300, price_range: { min: 0, max: 0 },
    opening_hours: 'Cả ngày', is_trending: true,
  },
  {
    id: 'pl_14', name: 'Chợ Bến Thành', category: 'shopping',
    address: 'Đường Lê Lợi, Phường Bến Thành, Quận 1', location: point(106.6981, 10.7725),
    rating: 4.3, review_count: 30100, price_range: { min: 50000, max: 300000 },
    opening_hours: '06:00 – 18:00', is_trending: true,
  },
  {
    id: 'pl_15', name: 'Saigon Centre', category: 'shopping',
    address: '65 Lê Lợi, Phường Bến Nghé, Quận 1', location: point(106.7012, 10.7731),
    rating: 4.5, review_count: 9800, price_range: { min: 100000, max: 1000000 },
    opening_hours: '09:30 – 22:00', is_trending: false,
  },
];
