import { useState } from 'react';
import { Icon } from '../Icon';
import { TextField } from './TextField';

// Ô mật khẩu có nút ẩn/hiện. useState ở đây chỉ là trạng thái hiển thị thuần UI.
export const PasswordField = (props) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      icon="lock"
      type={isVisible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          className="p-2 rounded-input text-neutral-400 hover:text-neutral-700"
        >
          <Icon name={isVisible ? 'eyeOff' : 'eye'} className="w-4.5 h-4.5" />
        </button>
      }
    />
  );
};
