import { FormAlert } from '../../../components/form/FormAlert';
import { PasswordField } from '../../../components/form/PasswordField';
import { SubmitButton } from '../../../components/form/SubmitButton';
import { Modal } from '../../../components/Modal';

export const ChangePasswordModal = ({ modal, values, errors, isSubmitting, onChange, onSubmit }) => (
  <Modal isOpen={modal.isOpen} title="Đổi mật khẩu" onClose={modal.close} containerRef={modal.containerRef}>
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FormAlert message={errors.form} />
      <PasswordField
        label="Mật khẩu hiện tại"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={onChange('currentPassword')}
        error={errors.currentPassword}
      />
      <PasswordField
        label="Mật khẩu mới"
        autoComplete="new-password"
        placeholder="Ít nhất 8 ký tự, gồm chữ và số"
        value={values.newPassword}
        onChange={onChange('newPassword')}
        error={errors.newPassword}
      />
      <PasswordField
        label="Nhập lại mật khẩu mới"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={onChange('confirmPassword')}
        error={errors.confirmPassword}
      />
      <SubmitButton isLoading={isSubmitting} loadingText="Đang đổi…">
        Đổi mật khẩu
      </SubmitButton>
    </form>
  </Modal>
);
