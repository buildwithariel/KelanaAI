export default function Board({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-deep/80 px-4 py-3.5">
      <dt className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
        {label}
      </dt>
      <dd className="mt-1 truncate font-board text-lg font-semibold tabular-nums text-signal">
        {value}
      </dd>
    </div>
  );
}
