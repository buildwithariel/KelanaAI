import type { ReactNode } from "react";

export const control =
  "h-12 w-full rounded-lg border border-ink/15 bg-white px-3.5 text-[15px] text-ink outline-none transition placeholder:text-ink/35 focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-signal";

export default function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-board text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
