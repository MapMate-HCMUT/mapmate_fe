import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { FormAlert } from '../../../components/form/FormAlert';
import { useToast } from '../../../hooks/useToast';
import { ERROR_KINDS } from '../../../utils/errorMessages';
import { addBusinessPlaceApi, updateBusinessPlaceApi } from '../api/businessApi';
import { useGalleryEditor } from '../hooks/useGalleryEditor';
import { useConsole } from '../hooks/useConsole';
import { usePlaceForm } from '../hooks/usePlaceForm';
import { formToPlacePayload, placeToForm } from '../utils/placeForm';
import { GalleryManager } from '../components/GalleryManager';
import { PlaceInfoFields } from '../components/PlaceInfoFields';
import { PlaceLocationFields } from '../components/PlaceLocationFields';

const Card = ({ title, children }) => (
  <section className="bg-surface rounded-card shadow-card p-4 sm:p-6 space-y-4">
    <h2 className="text-base font-bold text-neutral-900">{title}</h2>
    {children}
  </section>
);

// Form thêm / sửa 1 cửa hàng (dựng lại khi đổi cửa hàng nhờ key)
const PlaceEditor = ({ data, place, onSaved }) => {
  const isNew = !place;
  const form = usePlaceForm(place ? placeToForm(place) : null);
  const gallery = useGalleryEditor({ saved: place?.gallery ?? [], tier: data.tier, usage: data.usage });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const save = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!form.validate()) return setFormError('Kiểm tra lại các ô được đánh dấu đỏ nhé');
    if (gallery.isUploading) return setFormError('Đợi ảnh / video tải lên xong rồi lưu nhé');
    setIsSaving(true);
    try {
      const payload = formToPlacePayload(form.values);
      if (isNew) await addBusinessPlaceApi(payload);
      else await updateBusinessPlaceApi(place.id, { ...payload, ...(gallery.isDirty && { gallery: gallery.toPayload() }) });
      showToast(isNew ? 'Đã thêm cửa hàng lên bản đồ' : 'Đã lưu cửa hàng');
      onSaved();
      navigate('/business/stores');
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-5" noValidate>
      <Card title="Thông tin cửa hàng">
        <PlaceInfoFields form={form} />
      </Card>
      <Card title="Vị trí trên bản đồ">
        <PlaceLocationFields form={form} skipPlaceId={place?.id ?? null} />
      </Card>
      <Card title="Ảnh & video">
        {isNew ? (
          <p className="text-sm text-neutral-500">Lưu cửa hàng trước, sau đó bấm "Sửa & ảnh" để thêm ảnh / video.</p>
        ) : (
          <GalleryManager gallery={gallery} tier={data.tier} />
        )}
      </Card>
      <FormAlert message={formError} />
      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-neutral-100/95 backdrop-blur border-t border-neutral-200 flex justify-end gap-2">
        <Link to="/business/stores" className="px-4 py-2.5 rounded-button text-sm font-semibold text-neutral-600 hover:bg-neutral-200">
          Huỷ
        </Link>
        <button type="submit" disabled={isSaving || gallery.isUploading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-70">
          {isSaving && <span className="w-4 h-4 rounded-pill border-2 border-white/40 border-t-white animate-spin" />}
          {gallery.isUploading ? 'Đang tải ảnh / video…' : isNew ? 'Thêm cửa hàng' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
};

// /business/stores/new và /business/stores/:placeId (trong trang quản lý)
export const StoreEditorPage = () => {
  const { placeId } = useParams();
  const { data, reload } = useConsole();
  const place = placeId ? data.places.find((item) => item.id === placeId) : null;
  const isFull = !placeId && data.usage.places >= data.usage.max_places;

  return (
    <div className="max-w-3xl space-y-4">
      <Link to="/business/stores" className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-800">
        <ArrowLeft className="w-4 h-4" /> Danh sách cửa hàng
      </Link>
      <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">{placeId ? `Sửa: ${place?.name ?? ''}` : 'Thêm cửa hàng'}</h2>
      {placeId && !place && <ErrorState error={{ kind: ERROR_KINDS.NOT_FOUND }} title="Không tìm thấy cửa hàng này" />}
      {isFull && (
        <div className="bg-surface rounded-card shadow-card p-6 text-center space-y-3">
          <p className="font-semibold text-neutral-900">Gói {data.tier.label} có tối đa {data.usage.max_places} cửa hàng</p>
          <Link to="/business/plans" className="inline-flex px-4 py-2.5 rounded-button bg-primary-600 text-white text-sm font-bold">Xem các gói</Link>
        </div>
      )}
      {(place || (!placeId && !isFull)) && <PlaceEditor key={placeId ?? 'new'} data={data} place={place} onSaved={reload} />}
    </div>
  );
};
