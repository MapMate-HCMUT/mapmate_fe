import { useEffect, useState } from 'react';
import { useErrorRedirect } from '../../../hooks/useErrorRedirect';
import { getAiOptionsApi } from '../api/aiApi';

const FALLBACK = {
  llm_enabled: false,
  default_model: 'smart',
  models: [
    { value: 'fast', label: 'Nhanh', description: 'Trả lời nhanh, tiết kiệm' },
    { value: 'smart', label: 'Thông minh', description: 'Tư vấn kỹ hơn, chậm hơn một chút' },
  ],
  examples: ['Tối nay 2 người đi hẹn hò ở Quận 1, khoảng 500k/người'],
  prompt_max_length: 1000,
};

// Chế độ AI, câu mẫu, giới hạn độ dài — lấy từ server (không hardcode ở giao diện).
export const useAiOptions = () => {
  const [options, setOptions] = useState(FALLBACK);
  const redirectOnError = useErrorRedirect();
  useEffect(() => {
    let isActive = true;
    getAiOptionsApi()
      .then((data) => isActive && setOptions(data))
      .catch((error) => isActive && redirectOnError(error)); // máy chủ không phản hồi => trang lỗi (lỗi khác: dùng cấu hình mặc định)
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ tải 1 lần khi vào trang
  }, []);
  return options;
};
