// Ảnh bìa hồ sơ; chưa có ảnh => dải màu thương hiệu (giống trước đây)
export const ProfileCover = ({ src }) =>
  src ? (
    <img src={src} alt="" className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-gradient-to-r from-primary-500 to-secondary-500" />
  );
