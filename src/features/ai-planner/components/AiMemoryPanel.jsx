import { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, X } from 'lucide-react';
import { describeMemoryFacts } from '../utils/aiFormat';

const chip = 'flex items-center gap-1.5 rounded-input bg-neutral-50 px-2 py-1 text-xs text-neutral-700';
const removeButton = 'ml-auto p-0.5 rounded-pill text-neutral-400 hover:text-danger-600 hover:bg-danger-50';

// "Ghi nhớ của AI": sở thích tự học + ghi chú "nhớ giúp…" — người dùng xem, xoá từng mục, tắt hoặc xoá hết.
export const AiMemoryPanel = ({ memoryState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { memory } = memoryState;
  if (!memory) return null;
  const facts = describeMemoryFacts(memory.facts);
  const count = facts.length + memory.notes.length;

  return (
    <div className="border-t border-neutral-100 p-3">
      <button type="button" onClick={() => setIsOpen((open) => !open)} className="w-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800">
        <Brain className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Ghi nhớ của AI {count > 0 && <span className="text-neutral-400">({count})</span>}</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          <label className="flex items-center justify-between gap-2 text-xs text-neutral-700">
            <span>Cho AI ghi nhớ sở thích</span>
            <input type="checkbox" checked={memory.enabled} onChange={(event) => memoryState.setEnabled(event.target.checked)} className="accent-primary-600" />
          </label>
          {count === 0 ? (
            <p className="text-[11px] text-neutral-400">Chưa có gì. AI tự học sau vài lần bạn lên lộ trình, hoặc nói “nhớ giúp mình là mình ăn chay”.</p>
          ) : (
            <ul className="space-y-1">
              {facts.map((fact) => (
                <li key={fact.key} className={chip}>
                  <span className="text-neutral-400">{fact.label}:</span> <span className="truncate">{fact.value}</span>
                  <button type="button" onClick={() => memoryState.forgetFact(fact.key)} aria-label={`Quên ${fact.label}`} className={removeButton}><X className="w-3 h-3" /></button>
                </li>
              ))}
              {memory.notes.map((note) => (
                <li key={note.id} className={chip}>
                  <span className="truncate">“{note.text}”</span>
                  <button type="button" onClick={() => memoryState.forgetNote(note.id)} aria-label="Xoá ghi nhớ này" className={removeButton}><X className="w-3 h-3" /></button>
                </li>
              ))}
            </ul>
          )}
          {count > 0 && (
            <button type="button" onClick={memoryState.clearAll} className="text-[11px] font-semibold text-neutral-500 hover:text-danger-600">Xoá hết ghi nhớ</button>
          )}
        </div>
      )}
    </div>
  );
};
