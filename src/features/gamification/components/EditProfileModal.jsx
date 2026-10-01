import { FormAlert } from '../../../components/form/FormAlert';
import { SubmitButton } from '../../../components/form/SubmitButton';
import { UsernameField } from '../../../components/form/UsernameField';
import { Modal } from '../../../components/Modal';

const formatDate = (date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const EditProfileModal = ({ editor }) => {
  const { modal, username, errors, isSubmitting, usernameCheck, lockedUntil, handleChange, handleSubmit } = editor;

  return (
    <Modal isOpen={modal.isOpen} title="Đổi tên người dùng" onClose={modal.close} containerRef={modal.containerRef}>
      <form
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <FormAlert message={errors.form} />
        {lockedUntil ? (
          <p className="p-3 rounded-input bg-accent-50 border border-accent-200 text-sm text-accent-800">
            ⏳ Bạn vừa đổi tên gần đây. Có thể đổi lại từ ngày <strong>{formatDate(lockedUntil)}</strong>.
          </p>
        ) : (
          <>
            <UsernameField
              value={username}
              onChange={handleChange}
              error={errors.username}
              check={usernameCheck}
              hint="Chỉ được đổi tên 1 lần mỗi 14 ngày"
            />
            <SubmitButton isLoading={isSubmitting} loadingText="Đang lưu…">
              Lưu tên mới
            </SubmitButton>
          </>
        )}
      </form>
    </Modal>
  );
};
