import { useOutletContext } from 'react-router';

// Dữ liệu doanh nghiệp dùng chung trong trang quản lý (BusinessConsoleLayout nạp 1 lần): { data, reload }
export const useConsole = () => useOutletContext();
