import { Fragment, type ReactNode } from "react";
import { parseBlocks } from "../app/lib/markdown";

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g;

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-paper">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-panel px-1 py-0.5 font-board text-[0.85em] text-paper">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const HEADING_TAG = ["h2", "h3", "h4", "h5", "h6", "h6"] as const;

export default function Markdown({ children }: { children: string }) {
  const blocks = parseBlocks(children);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-paper/90">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "heading": {
            const Tag = HEADING_TAG[Math.min(b.level, 6) - 1];
            const cls =
              b.level <= 2
                ? "font-display text-lg font-bold tracking-tight text-paper"
                : "font-board text-[11px] font-semibold uppercase tracking-[0.18em] text-signal";
            return (
              <Tag key={i} className={cls}>
                {inline(b.text)}
              </Tag>
            );
          }
          case "hr":
            return <hr key={i} className="border-line/60" />;
          case "ul":
            return (
              <ul key={i} className="space-y-1.5">
                {b.items.map((it, j) => (
                  <li key={j} className="border-l border-line pl-3">
                    {inline(it)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-1.5 pl-5 marker:text-signal">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ol>
            );
          default:
            return <p key={i}>{inline(b.text)}</p>;
        }
      })}
    </div>
  );
}
