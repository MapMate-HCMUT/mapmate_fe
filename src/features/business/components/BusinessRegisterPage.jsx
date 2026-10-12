import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { FormAlert } from '../../../components/form/FormAlert';
import { useToast } from '../../../hooks/useToast';
import { useAuthStore } from '../../../stores/authStore';
import { registerBusinessApi } from '../api/businessApi';
import { useBusinessTiers } from '../hooks/useBusinessTiers';
import { useMyBusiness } from '../hooks/useMyBusiness';
import { usePlaceForm } from '../hooks/usePlaceForm';
import { formToPlacePayload } from '../utils/placeForm';
import { PlaceInfoFields } from './PlaceInfoFields';
import { PlaceLocationFields } from './PlaceLocationFields';
import { TierPlans } from './TierPlans';

const STEPS = [
  { title: 'Thông tin cửa hàng', fields: ['name', 'phone', 'weekly', 'price_min', 'price_max'] },
  { title: 'Vị trí trên bản đồ', fields: ['coordinates', 'address'] },
  { title: 'Chọn gói', fields: [] },
];

const StepIndicator = ({ current }) => (
  <ol className="flex items-center gap-2 text-xs font-semibold">
    {STEPS.map((step, index) => {
      const isDone = index < current;
      const isActive = index === current;
      return (
        <li key={step.title} className="flex items-center gap-2 min-w-0">
          <span className={`w-6 h-6 rounded-pill flex items-center justify-center shrink-0 ${isDone ? 'bg-primary-600 text-white' : isActive ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500' : 'bg-neutral-200 text-neutral-500'}`}>
            {isDone ? <Check className="w-3.5 h-3.5" /> : index + 1}
          </span>
          <span className={`hidden sm:inline truncate ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`}>{step.title}</span>
          {index < STEPS.length - 1 && <span className="w-6 sm:w-10 h-px bg-neutral-300" aria-hidden="true" />}
        </li>
      );
    })}
  </ol>
);

// /business/register — 3 bước: thông tin quán -> chọn vị trí trên bản đồ -> chọn gói. Đã là doanh nghiệp => về trang quản lý.
export const BusinessRegisterPage = () => {
  const me = useMyBusiness();
  const { tiers, error: tiersError, reload: reloadTiers } = useBusinessTiers();
  const form = usePlaceForm();
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const updateUser = useAuthStore((state) => state.updateUser);
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (me.isRegistered) return <Navigate to="/business" replace />;

  const next = () => {
    if (!form.validate(STEPS[step].fields)) return;
    setStep((value) => value + 1);
  };

  const submit = async () => {
    if (!form.validate()) {
      setStep(form.values.coordinates ? 0 : 1);
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    const place = formToPlacePayload(form.values);
    try {
      const result = await registerBusinessApi({ name: place.name, phone: place.phone, description: place.description, tier, place });
      updateUser(result.profile);
      showToast('Cửa hàng của bạn đã lên bản đồ MapMate 🎉');
      navigate('/business', { replace: true });
    } catch (error) {
      setFormError(error.message);
      // Lỗi ở ô nào thì quay về bước có ô đó
      const fields = (error.details ?? []).map((detail) => String(detail.field ?? detail.path ?? ''));
      if (fields.some((field) => field.includes('coordinates') || field.includes('address'))) setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex-1 overflow-y-auto">
      <div className={`w-full ${step === 2 ? 'max-w-5xl' : 'max-w-3xl'} mx-auto p-4 lg:p-6 space-y-5`}>
        <header className="space-y-3">
          <button type="button" onClick={() => (step > 0 ? setStep(step - 1) : navigate('/for-business'))} className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-800">
            <ArrowLeft className="w-4 h-4" /> {step > 0 ? 'Bước trước' : 'MapMate cho doanh nghiệp'}
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Đăng ký cửa hàng</h1>
          <StepIndicator current={step} />
        </header>

        {me.error ? (
          <ErrorState error={me.error} onRetry={me.reload} />
        ) : (
          <div className="bg-surface rounded-card shadow-card p-4 sm:p-6 space-y-5">
            <h2 className="text-base font-bold text-neutral-900">{STEPS[step].title}</h2>
            {step === 0 && <PlaceInfoFields form={form} />}
            {step === 1 && <PlaceLocationFields form={form} />}
            {step === 2 &&
              (tiersError ? (
                <ErrorState error={tiersError} onRetry={reloadTiers} compact />
              ) : (
                <>
                  <TierPlans tiers={tiers} variant="select" selected={tier} onSelect={setTier} />
                  <p className="text-xs text-neutral-500">Bản demo: chưa thu phí, đổi gói bất cứ lúc nào trong trang quản lý.</p>
                </>
              ))}

            <FormAlert message={formError} />

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="px-5 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold">
                  Tiếp tục
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-70">
                  {isSubmitting && <span className="w-4 h-4 rounded-pill border-2 border-white/40 border-t-white animate-spin" />}
                  Hoàn tất & lên bản đồ
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
