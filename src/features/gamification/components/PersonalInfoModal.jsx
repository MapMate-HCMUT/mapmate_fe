import { FormAlert } from '../../../components/form/FormAlert';
import { SubmitButton } from '../../../components/form/SubmitButton';
import { TextField } from '../../../components/form/TextField';
import { Icon } from '../../../components/Icon';
import { Modal } from '../../../components/Modal';
import { CITY_SUGGESTIONS } from '../utils/profileConfig';

const today = () => new Date().toISOString().slice(0, 10);

export const PersonalInfoModal = ({ editor }) => {
  const { modal, values, errors, isSubmitting, isLocating, handleChange, handleSubmit, fillFromLocation } = editor;

  return (
    <Modal isOpen={modal.isOpen} title="Thông tin cá nhân" onClose={modal.close} containerRef={modal.containerRef}>
      <form
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <FormAlert message={errors.form} />
        <TextField label="Ngày sinh" type="date" max={today()} value={values.birthDate ?? ''} onChange={handleChange('birthDate')} error={errors.birthDate} />

        <div className="flex items-center justify-between pt-1">
          <p className="text-sm font-semibold text-neutral-700">Khu vực sinh sống</p>
          <button
            type="button"
            onClick={fillFromLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-info-700 hover:underline disabled:opacity-60"
          >
            <Icon name="locate" className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Đang xác định…' : 'Lấy từ vị trí hiện tại'}
          </button>
        </div>
        <TextField label="Tên đường (không ghi số nhà)" placeholder="VD: Lý Thường Kiệt" value={values.street ?? ''} onChange={handleChange('street')} error={errors.street} />
        <TextField label="Quận / Phường" placeholder="VD: Quận 10 hoặc Phường Diên Hồng" value={values.district ?? ''} onChange={handleChange('district')} error={errors.district} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Thành phố" list="mapmate-city-suggestions" value={values.city ?? ''} onChange={handleChange('city')} error={errors.city} />
          <TextField label="Quốc gia" value={values.country ?? ''} onChange={handleChange('country')} error={errors.country} />
        </div>
        <datalist id="mapmate-city-suggestions">
          {CITY_SUGGESTIONS.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>

        <SubmitButton isLoading={isSubmitting} loadingText="Đang lưu…">
          Lưu thông tin
        </SubmitButton>
      </form>
    </Modal>
  );
};
