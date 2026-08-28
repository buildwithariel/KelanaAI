import type { Trip } from "../app/lib/types";

// Same destination keys the homepage hero uses, so a trip card and the
// planner form always agree on what a destination "looks like".
const FLAGS: Record<string, string> = {
  japan: "🇯🇵",
  indonesia: "🇮🇩",
  singapore: "🇸🇬",
  thailand: "🇹🇭",
  korea: "🇰🇷",
  malaysia: "🇲🇾",
  france: "🇫🇷",
  usa: "🇺🇸",
};

const CATEGORY_STYLE: Record<string, string> = {
  backpacker: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  standard: "border-signal/40 bg-signal/10 text-signal",
  luxury: "border-violet-400/30 bg-violet-400/10 text-violet-300",
};

export default function TripCard({ trip }: { trip: Trip }) {
  const flag = FLAGS[trip.destination.trim().toLowerCase()] ?? "🌍";
  const categoryStyle =
    CATEGORY_STYLE[trip.category.trim().toLowerCase()] ??
    "border-line bg-panel text-mist";

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-panel/50">
      <div className="flex items-start justify-between gap-4 p-6 sm:p-7">
        <div>
          <p className="font-board text-[10px] font-semibold uppercase tracking-[0.22em] text-mist">
            {trip.days} {trip.days === 1 ? "day" : "days"} · {trip.travel_season}
          </p>
          <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            <span aria-hidden className="mr-2">{flag}</span>
            {trip.destination}
          </h3>
        </div>
        <p className="whitespace-nowrap font-board text-lg font-semibold tabular-nums text-signal">
          USD {trip.budget.toLocaleString("en-US")}
        </p>
      </div>

      <div className="tear" />

      <div className="flex flex-wrap items-center gap-2 p-6 sm:p-7">
        <span
          className={`rounded-full border px-3 py-1 font-board text-[10px] font-semibold uppercase tracking-[0.16em] ${categoryStyle}`}
        >
          {trip.category}
        </span>
        {trip.travel_style && (
          <span className="rounded-full border border-line px-3 py-1 font-board text-[10px] font-semibold uppercase tracking-[0.16em] text-paper/75">
            {trip.travel_style}
          </span>
        )}
      </div>
    </article>
  );
}
