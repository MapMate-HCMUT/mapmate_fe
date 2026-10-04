import { describeSource, TRACE_STATUS } from '../utils/aiFormat';

// "Cách MapMate xử lý": các bước của pipeline (hiểu yêu cầu -> chuẩn hoá -> lên lộ trình -> tư vấn), minh bạch nguồn trả lời.
export const PipelineTrace = ({ trace, sources }) => {
  if (!trace?.length) return null;
  const usedFallback = sources && (sources.interpreter !== 'llm' || sources.advisor !== 'llm');
  return (
    <details className="text-[11px] text-neutral-500">
      <summary className="cursor-pointer select-none hover:text-neutral-700">
        Cách MapMate xử lý{usedFallback ? ' · đang dùng chế độ dự phòng' : ''}
      </summary>
      <ol className="mt-1.5 space-y-1 border-l border-neutral-200 pl-3">
        {trace.map((step) => {
          const status = TRACE_STATUS[step.status] ?? TRACE_STATUS.ok;
          const source = describeSource(step);
          return (
            <li key={step.key} className="flex flex-wrap gap-x-2">
              <span className="font-medium text-neutral-700">{step.label}</span>
              <span className={status.className}>{status.label}</span>
              {source && <span>· {source}</span>}
              <span className="tabular-nums">· {step.ms} ms</span>
            </li>
          );
        })}
      </ol>
    </details>
  );
};
