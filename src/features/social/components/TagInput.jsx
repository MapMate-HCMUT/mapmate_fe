import { Icon } from '../../../components/Icon';

// Ô nhập hashtag: gõ rồi Enter / dấu phẩy / dấu cách để thêm; bấm × để xoá.
export const TagInput = ({ tags, inputValue, onInputChange, onAdd, onRemove }) => (
  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-surface border border-neutral-300 rounded-input focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
    {tags.map((tag) => (
      <span key={tag} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-pill bg-info-100 text-info-700 text-xs font-medium">
        #{tag}
        <button type="button" onClick={() => onRemove(tag)} aria-label={`Xoá hashtag ${tag}`} className="rounded-pill hover:bg-info-200">
          <Icon name="close" className="w-3 h-3" />
        </button>
      </span>
    ))}
    <input
      type="text"
      value={inputValue}
      onChange={(event) => onInputChange(event.target.value)}
      onKeyDown={(event) => {
        if (['Enter', ',', ' '].includes(event.key)) {
          event.preventDefault();
          onAdd();
        }
      }}
      onBlur={onAdd}
      placeholder={tags.length ? 'Thêm hashtag…' : '#hẹnhò #ănvặt …'}
      aria-label="Hashtag"
      className="flex-1 min-w-24 py-0.5 text-sm bg-transparent focus:outline-none placeholder:text-neutral-400"
    />
  </div>
);
