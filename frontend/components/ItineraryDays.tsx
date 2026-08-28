import type { Day } from "../app/lib/itinerary";

export default function ItineraryDays({ days, raw }: { days: Day[]; raw: string | null }) {
  if (days.length === 0) {
    return (
      <pre className="mt-8 overflow-x-auto whitespace-pre-wrap rounded-xl border border-line bg-panel/50 p-6 font-sans text-sm leading-relaxed text-paper/80">
        {raw}
      </pre>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
      {days.map((day) => (
        <article
          key={day.title}
          className="rounded-xl border border-line bg-panel/50 p-6 sm:p-7"
        >
          <h3 className="font-display text-xl font-semibold tracking-tight">
            {day.title}
          </h3>
          {day.slots.map((slot) => (
            <div key={slot.label} className="mt-6">
              <p className="font-board text-[10px] font-semibold uppercase tracking-[0.22em] text-signal">
                {slot.label}
              </p>
              <ul className="mt-3 space-y-2.5">
                {slot.items.map((item, i) => (
                  <li
                    key={i}
                    className="border-l border-line pl-4 text-sm leading-relaxed text-paper/75"
                  >
                    {item.name && (
                      <span className="font-semibold text-paper">
                        {item.name}.{" "}
                      </span>
                    )}
                    {item.detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </article>
      ))}
    </div>
  );
}
