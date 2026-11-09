"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import * as conversationService from "@/services/conversationService";
import { cn } from "@/lib/utils";

export default function MessagesWorkspace({ initialId }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(initialId);
  const [extra, setExtra] = useState(null); // abhi list me na aayi hui conversation (jaise bina message wali)
  const [query, setQuery] = useState("");
  const [mobileThread, setMobileThread] = useState(Boolean(initialId));

  const loadList = useCallback(async () => {
    try {
      const res = await conversationService.list({ limit: 50 });
      setConversations(res.data.conversations);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") loadList();
    }, 15000);
    return () => clearInterval(id);
  }, [loadList]);

  const items = useMemo(
    () => (extra && !conversations.some((c) => c._id === extra._id) ? [extra, ...conversations] : conversations),
    [conversations, extra]
  );

  // Desktop par pehli conversation apne aap
  useEffect(() => {
    if (!selectedId && items.length > 0 && window.matchMedia("(min-width: 1024px)").matches) {
      setSelectedId(items[0]._id);
    }
  }, [items, selectedId]);

  const select = useCallback((id) => {
    setSelectedId(id);
    setMobileThread(true);
    window.history.replaceState(null, "", `/messages?c=${id}`);
  }, []);

  const onLoaded = useCallback(
    (conversation) => {
      setExtra(conversation);
      loadList(); // padhe jane ke baad unread badge hatane ke liye
    },
    [loadList]
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg flex flex-col gap-space-md">
      <div className="bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex items-center gap-space-xs mb-space-xs">
          <span className="font-code-sm text-code-sm uppercase tracking-widest text-primary font-bold">SYSTEM // INBOX</span>
          <span className="w-1.5 h-1.5 bg-primary" />
          <span className="font-code-sm text-code-sm text-on-surface-variant">ORDER AND GIG CONVERSATIONS</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Messages</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md h-[72vh] min-h-[480px]">
        <div className={cn("lg:col-span-4 min-h-0", mobileThread ? "hidden lg:block" : "block")}>
          <ConversationList
            conversations={items}
            selectedId={selectedId}
            onSelect={select}
            loading={loading}
            error={error}
            query={query}
            onQuery={setQuery}
            meId={user._id}
          />
        </div>

        <div className={cn("lg:col-span-8 min-h-0", mobileThread ? "block" : "hidden lg:block")}>
          {selectedId ? (
            <MessageThread
              key={selectedId}
              conversationId={selectedId}
              meId={user._id}
              onLoaded={onLoaded}
              onSent={loadList}
              onBack={() => setMobileThread(false)}
            />
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant h-full flex flex-col items-center justify-center text-center p-space-lg">
              <Icon name="chat" className="text-[40px] text-outline mb-space-sm" />
              <p className="font-body-sm text-body-sm text-on-surface-variant">Select a conversation to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}