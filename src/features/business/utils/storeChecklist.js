// Mức hoàn thiện thông tin 1 cửa hàng — gợi ý việc nên làm để khách tin và chọn quán hơn
export const storeChecklist = (place) => [
  { key: 'photos', label: 'Có ít nhất 3 ảnh / video', done: place.gallery.length >= 3, to: `/business/stores/${place.id}` },
  { key: 'description', label: 'Có giới thiệu ngắn', done: Boolean(place.description), to: `/business/stores/${place.id}` },
  { key: 'hours', label: 'Có giờ mở cửa', done: place.hours_known, to: `/business/stores/${place.id}` },
  { key: 'phone', label: 'Có số điện thoại', done: Boolean(place.contact?.phone), to: `/business/stores/${place.id}` },
  { key: 'specialties', label: 'Có món / dịch vụ nổi bật', done: place.specialties.length > 0, to: `/business/stores/${place.id}` },
  { key: 'promotion', label: 'Đang có khuyến mãi', done: Boolean(place.promotion), to: '/business/promotions' },
];
export const checklistScore = (items) => Math.round((items.filter((item) => item.done).length / items.length) * 100);
