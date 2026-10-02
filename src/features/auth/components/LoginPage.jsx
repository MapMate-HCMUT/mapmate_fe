import { Link } from 'react-router';
import { FormAlert } from '../../../components/form/FormAlert';
import { PasswordField } from '../../../components/form/PasswordField';
import { SubmitButton } from '../../../components/form/SubmitButton';
import { TextField } from '../../../components/form/TextField';
import { useLoginForm } from '../hooks/useLoginForm';
import { AuthLayout } from './AuthLayout';

export const LoginPage = () => {
  const { values, errors, formError, remember, setRemember, isSubmitting, handleChange, handleSubmit, redirectTo } =
    useLoginForm();

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay lại MapMate 👋"
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold text-primary-700 hover:underline">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <FormAlert message={formError} />
        <TextField
          label="Email"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="ban@email.com"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
        />
        <PasswordField
          label="Mật khẩu"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange('password')}
          error={errors.password}
        />
        <label className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="w-4 h-4 rounded accent-primary-600"
          />
          Ghi nhớ đăng nhập trên thiết bị này
        </label>
        <SubmitButton isLoading={isSubmitting} loadingText="Đang đăng nhập…">
          Đăng nhập
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};
