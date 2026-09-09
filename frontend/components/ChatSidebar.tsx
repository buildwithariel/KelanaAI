import type { ConversationSummary } from "../app/lib/types";

type Props = {
  conversations: ConversationSummary[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  className?: string;
};

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  className = "",
}: Props) {
  return (
    <aside className={`flex w-64 shrink-0 flex-col gap-4 ${className}`}>
      <button
        type="button"
        onClick={onNewChat}
        className="flex items-center gap-2 rounded-lg border border-line bg-panel/60 px-4 py-2.5 font-board text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/80 transition hover:border-signal/40 hover:text-signal"
      >
        <span aria-hidden className="text-base leading-none text-signal">+</span>
        New chat
      </button>

      <div className="flex min-h-0 flex-1 flex-col">
        <p className="px-1 font-board text-[10px] font-semibold uppercase tracking-[0.22em] text-mist">
          Recent
        </p>
        {conversations.length === 0 ? (
          <p className="mt-3 px-1 text-xs text-mist">No conversations yet</p>
        ) : (
          <ul className="mt-2 space-y-0.5 overflow-y-auto">
            {conversations.map((c) => {
              const active = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    aria-current={active ? "true" : undefined}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                      active
                        ? "bg-signal/10 text-signal"
                        : "text-paper/75 hover:bg-white/5 hover:text-paper"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`size-1.5 shrink-0 rounded-full ${active ? "bg-signal" : "bg-transparent"}`}
                    />
                    <span className="truncate">{c.title?.trim() || "Untitled chat"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
