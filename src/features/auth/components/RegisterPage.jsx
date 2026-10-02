import { Link } from 'react-router';
import { FormAlert } from '../../../components/form/FormAlert';
import { PasswordField } from '../../../components/form/PasswordField';
import { SubmitButton } from '../../../components/form/SubmitButton';
import { TextField } from '../../../components/form/TextField';
import { UsernameField } from '../../../components/form/UsernameField';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { AuthLayout } from './AuthLayout';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

export const RegisterPage = () => {
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit, redirectTo, passwordStrength, usernameCheck } =
    useRegisterForm();

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Tham gia cộng đồng MapMate — nhận ngay huy hiệu Tiên phong 🏅"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold text-primary-700 hover:underline">
            Đăng nhập
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
        <UsernameField value={values.username} onChange={handleChange('username')} error={errors.username} check={usernameCheck} />
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
        <div className="space-y-2">
          <PasswordField
            label="Mật khẩu"
            autoComplete="new-password"
            placeholder="Ít nhất 8 ký tự, gồm chữ và số"
            value={values.password}
            onChange={handleChange('password')}
            error={errors.password}
          />
          {values.password && <PasswordStrengthMeter strength={passwordStrength} />}
        </div>
        <PasswordField
          label="Nhập lại mật khẩu"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
        />
        <SubmitButton isLoading={isSubmitting} loadingText="Đang tạo tài khoản…">
          Đăng ký
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};
