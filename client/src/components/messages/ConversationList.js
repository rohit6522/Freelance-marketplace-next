"use client";

import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import { cn, timeAgo } from "@/lib/utils";

const tagFor = (c) => (c.order ? `#${c.order.orderNumber}` : c.gig ? c.gig.title : "Direct message");

export default function ConversationList({ conversations, selectedId, onSelect, loading, error, query, onQuery, meId }) {
  const term = query.trim().toLowerCase();
  const items = term
    ? conversations.filter((c) =>
        [c.other?.name, tagFor(c), c.lastMessage?.text].some((value) => value?.toLowerCase().includes(term))
      )
    : conversations;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant flex flex-col h-full min-h-0">
      <div className="p-space-sm border-b border-outline-variant">
        <div className="flex items-center bg-surface-container-low px-space-sm py-2">
          <Icon name="search" className="text-outline text-body-md mr-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label="Search conversations"
            placeholder="Search conversations..."
            className="bg-transparent text-on-surface placeholder:text-outline-variant font-body-sm text-body-sm focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {error && <p role="alert" className="p-space-md font-body-sm text-body-sm text-error">{error}</p>}

        {loading && conversations.length === 0 && (
          <div className="p-space-sm space-y-space-sm">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 bg-surface-container-low animate-pulse" />
            ))}
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="p-space-lg text-center">
            <Icon name="forum" className="text-[36px] text-outline mb-space-xs" />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              No conversations yet. Use &quot;Contact Seller&quot; on a gig or profile to start one.
            </p>
          </div>
        )}

        {conversations.length > 0 && items.length === 0 && (
          <p className="p-space-md font-body-sm text-body-sm text-on-surface-variant text-center">No conversations match.</p>
        )}

        {items.map((c) => {
          const active = c._id === selectedId;
          const mine = c.lastMessage?.sender && String(c.lastMessage.sender) === meId;
          return (
            <button
              key={c._id}
              type="button"
              onClick={() => onSelect(c._id)}
              aria-current={active}
              className={cn(
                "w-full text-left p-space-md border-b border-outline-variant flex gap-space-sm relative transition-colors",
                active ? "bg-surface-container-low" : "bg-surface-container-lowest hover:bg-surface-container-low"
              )}
            >
              <div className={cn("absolute left-0 top-0 bottom-0 w-1", active ? "bg-primary" : "bg-transparent")} />
              <Avatar user={c.other} size="w-10 h-10" shape="square" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-space-xs">
                  <span className="font-label-md text-label-md font-bold text-on-surface truncate">{c.other?.name}</span>
                  <span className="font-code-sm text-[11px] text-on-surface-variant whitespace-nowrap">
                    {c.lastMessage?.sentAt ? timeAgo(c.lastMessage.sentAt) : ""}
                  </span>
                </div>
                <span className="inline-block max-w-full truncate font-code-sm text-[11px] bg-surface-container px-1 text-on-surface-variant uppercase">
                  {tagFor(c)}
                </span>
                <p
                  className={cn(
                    "font-body-sm text-body-sm truncate",
                    c.unreadCount > 0 ? "text-on-surface font-semibold" : "text-on-surface-variant"
                  )}
                >
                  {c.lastMessage?.text ? `${mine ? "You: " : ""}${c.lastMessage.text}` : "No messages yet"}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span className="self-center bg-primary text-on-primary font-code-sm text-code-sm min-w-5 h-5 px-1 flex items-center justify-center shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}