// Khung 3 cột kiểu Facebook cho các mục trong Khám phá:
// cột trái (menu, ExploreLayout) rộng BẰNG cột phải => cân đối; cột giữa chỉ 1 cột, rộng tối đa 768px và luôn nằm chính giữa
// (dòng chữ / thẻ không bị kéo dài quá mức khó đọc). Màn càng rộng thì khoảng trống 2 bên cột giữa càng lớn.
export const EXPLORE_SIDEBAR_WIDTH = 'w-64 xl:w-72 2xl:w-80';
export const EXPLORE_GRID = 'grid xl:grid-cols-[minmax(0,1fr)_18rem] 2xl:grid-cols-[minmax(0,1fr)_20rem] gap-6 items-start';
export const EXPLORE_MAIN = 'w-full max-w-3xl mx-auto min-w-0';
// Nhóm 3 tab trên thanh điều hướng rộng ĐÚNG bằng cột giữa (48rem = max-w-3xl) => thẳng hàng với nội dung bên dưới;
// màn chưa có cột phải (< 1280px) thì nhóm tab gọn hơn (36rem) để logo & tài khoản 2 bên còn khoảng thở
export const NAVBAR_GRID = 'grid-cols-[1fr_minmax(0,36rem)_1fr] xl:grid-cols-[1fr_minmax(0,48rem)_1fr]';
