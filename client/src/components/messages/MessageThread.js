"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import { MessageBubble } from "@/components/chat/ChatParts";
import MessageComposer from "@/components/chat/MessageComposer";
import * as conversationService from "@/services/conversationService";

// Id se unique, purane se naya
const merge = (prev, incoming) => {
  const map = new Map(prev.map((m) => [m._id, m]));
  incoming.forEach((m) => map.set(m._id, m));
  return [...map.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export default function MessageThread({ conversationId, meId, onLoaded, onSent, onBack }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  const [older, setOlder] = useState({ page: 2, has: false, loading: false });
  const listRef = useRef(null);
  const lastSeen = useRef(null);
  const firstLoad = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await conversationService.getMessages(conversationId, { limit: 30 });
      setConversation(res.data.conversation);
      setMessages((prev) => merge(prev, res.data.messages));
      if (firstLoad.current) {
        firstLoad.current = false;
        setOlder({ page: 2, has: res.data.pagination.hasNext, loading: false });
        onLoaded?.(res.data.conversation);
      }
      setPhase("ready");
    } catch (err) {
      setError(err.message);
      setPhase((p) => (p === "ready" ? p : "error"));
    }
  }, [conversationId, onLoaded]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 8000);
    return () => clearInterval(id);
  }, [load]);

  // Naya message end me aaye tabhi neeche scroll (purane load karne par nahi)
  const lastId = messages[messages.length - 1]?._id;
  useEffect(() => {
    const el = listRef.current;
    if (el && lastId && lastId !== lastSeen.current) {
      lastSeen.current = lastId;
      el.scrollTop = el.scrollHeight;
    }
  }, [lastId]);

  const loadOlder = async () => {
    setOlder((o) => ({ ...o, loading: true }));
    try {
      const res = await conversationService.getMessages(conversationId, { limit: 30, page: older.page });
      setMessages((prev) => merge(prev, res.data.messages));
      setOlder({ page: older.page + 1, has: res.data.pagination.hasNext, loading: false });
    } catch (err) {
      setError(err.message);
      setOlder((o) => ({ ...o, loading: false }));
    }
  };

  const send = async ({ text, attachments }) => {
    await conversationService.sendMessage(conversationId, { text: text || undefined, attachments });
    await load();
    onSent?.();
  };

  const other = conversation?.other;
  const context = conversation?.order
    ? { href: `/orders?id=${conversation.order._id}`, label: `Order #${conversation.order.orderNumber}` }
    : conversation?.gig
      ? { href: `/gigs/${conversation.gig.slug}`, label: conversation.gig.title }
      : null;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-space-sm p-space-md border-b border-outline-variant">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="lg:hidden w-8 h-8 border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-white"
        >
          <Icon name="arrow_back" className="text-[18px]" />
        </button>
        {other && <Avatar user={other} size="w-10 h-10" shape="square" />}
        <div className="min-w-0 flex-1">
          {other?.role === "freelancer" ? (
            <Link
              href={`/freelancers/${other._id}`}
              className="font-headline-sm text-headline-sm text-on-surface font-bold hover:text-primary block truncate"
            >
              {other.name}
            </Link>
          ) : (
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold block truncate">
              {other?.companyName || other?.name || "Conversation"}
            </span>
          )}
          {context && (
            <Link href={context.href} className="font-code-sm text-code-sm text-primary uppercase hover:underline block truncate">
              {context.label}
            </Link>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-space-xs shrink-0">
          <span className="w-2 h-2 bg-primary" />
          <span className="font-code-sm text-code-sm text-primary font-bold">AUTO-REFRESH 8S</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto min-h-0 p-space-md flex flex-col gap-space-md">
        {phase === "loading" && <div className="h-24 bg-surface-container-low animate-pulse" />}
        {phase === "error" && (
          <p role="alert" className="font-body-sm text-body-sm text-error">
            {error || "Could not load this conversation."}
          </p>
        )}

        {older.has && (
          <button
            type="button"
            onClick={loadOlder}
            disabled={older.loading}
            className="self-center font-label-sm text-label-sm uppercase font-bold text-primary hover:underline disabled:opacity-60"
          >
            {older.loading ? "Loading..." : "Load earlier messages"}
          </button>
        )}

        {phase === "ready" && messages.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-space-lg">
            No messages yet. Say hello to start the conversation.
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} isOwn={message.sender?._id === meId} />
        ))}
      </div>

      <div className="p-space-sm border-t border-outline-variant">
        <MessageComposer onSend={send} />
      </div>
    </div>
  );
}