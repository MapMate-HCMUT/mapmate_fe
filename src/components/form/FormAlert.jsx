export const FormAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div role="alert" className="flex gap-2 p-3 rounded-input bg-danger-50 border border-danger-200 text-sm text-danger-700">
      <span aria-hidden="true">⚠️</span>
      <p>{message}</p>
    </div>
  );
};
