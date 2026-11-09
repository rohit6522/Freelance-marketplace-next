"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import * as conversationService from "@/services/conversationService";
import * as uploadService from "@/services/uploadService";
import { formatBytes, formatDateTime } from "@/lib/orders";
import { cn } from "@/lib/utils";

function SystemStamp({ text }) {
  return (
    <div className="flex items-center justify-center gap-space-sm py-space-xs">
      <div className="h-0.5 bg-surface-container-low flex-1" />
      <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 max-w-[80%]">
        <Icon name="verified_user" className="text-body-sm text-primary" />
        <span className="font-code-sm text-code-sm uppercase font-bold text-on-surface">SYSTEM: {text}</span>
      </div>
      <div className="h-0.5 bg-surface-container-low flex-1" />
    </div>
  );
}

function Bubble({ message, sellerId }) {
  if (message.type === "system") return <SystemStamp text={message.text} />;

  const isSeller = message.sender?._id === sellerId;

  return (
    <div className={cn("flex items-start gap-space-sm", isSeller && "flex-row-reverse")}>
      <Avatar user={message.sender} size="w-8 h-8" shape="square" className="shrink-0" />
      <div
        className={cn(
          "flex flex-col gap-space-xs p-space-md max-w-xl min-w-0",
          isSeller ? "bg-surface-container-high text-left" : "bg-surface-container-low"
        )}
      >
        <div className="flex items-center justify-between gap-space-md">
          <span className="font-label-sm text-label-sm text-on-surface uppercase font-bold">
            {message.sender?.name} ({isSeller ? "Seller" : "Buyer"})
          </span>
          <span className="font-code-sm text-code-sm text-on-surface-variant whitespace-nowrap">
            {formatDateTime(message.createdAt)} UTC
          </span>
        </div>
        {message.text && (
          <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-line break-words">{message.text}</p>
        )}
        {(message.attachments ?? []).length > 0 && (
          <div className="mt-space-xs pt-space-xs flex flex-wrap items-center gap-space-xs">
            {message.attachments.map((file) => (
              <a
                key={file.url}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-code-sm text-code-sm bg-surface-container-lowest px-space-xs py-0.5 text-on-surface font-semibold flex items-center gap-1 hover:text-primary"
              >
                <Icon name="attach_file" className="text-body-sm text-primary" />
                {file.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderChat({ order, refreshKey, actions }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  // Is order ki chat (nahi hai to ban jati hai)
  useEffect(() => {
    let cancelled = false;
    conversationService
      .start({ orderId: order._id })
      .then((res) => {
        if (!cancelled) setConversationId(res.data.conversation._id);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setPhase("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [order._id]);

  const load = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await conversationService.getMessages(conversationId, { limit: 50 });
      setMessages(res.data.messages);
      setPhase("ready");
    } catch (err) {
      setError(err.message);
      setPhase((p) => (p === "ready" ? p : "error"));
    }
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // Har 10 second me naye messages (tab dikh raha ho tabhi)
  useEffect(() => {
    if (!conversationId) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 10000);
    return () => clearInterval(id);
  }, [conversationId, load]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const pickFiles = (e) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    const problem = uploadService.validateFiles(picked, files.length);
    if (problem) {
      toast.error(problem);
      return;
    }
    setFiles((current) => [...current, ...picked]);
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if ((!body && files.length === 0) || sending || !conversationId) return;

    setSending(true);
    try {
      let attachments = [];
      if (files.length > 0) attachments = (await uploadService.uploadFiles(files)).data.files;
      await conversationService.sendMessage(conversationId, { text: body || undefined, attachments });
      setText("");
      setFiles([]);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">
          Contract Audit &amp; Direct Messaging
        </h3>
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 bg-primary" />
          <span className="font-code-sm text-code-sm text-primary font-bold">AUTO-REFRESH 10S</span>
        </div>
      </div>

      <div ref={listRef} className="flex flex-col gap-space-md max-h-96 overflow-y-auto pr-space-xs">
        {phase === "loading" && <div className="h-24 bg-surface-container-low animate-pulse" />}
        {phase === "error" && (
          <p role="alert" className="font-body-sm text-body-sm text-error">
            {error || "Could not load messages."}
          </p>
        )}
        {phase === "ready" && messages.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-space-md">
            No messages yet. Post a contract update or milestone question below.
          </p>
        )}
        {messages.map((message) => (
          <Bubble key={message._id} message={message} sellerId={order.freelancer._id} />
        ))}
      </div>

      <div className="flex flex-col gap-space-sm pt-space-sm">
        {actions}

        {files.length > 0 && (
          <div className="flex flex-wrap gap-space-xs">
            {files.map((file, index) => (
              <span
                key={`${file.name}-${index}`}
                className="font-code-sm text-code-sm bg-surface-container px-space-xs py-0.5 flex items-center gap-1"
              >
                {file.name} ({formatBytes(file.size)})
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  className="hover:text-error"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              </span>
            ))}
          </div>
        )}

        <form onSubmit={send} className="flex items-center bg-surface-container-low p-space-xs">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            aria-label="Message"
            placeholder="Post a contract update or milestone question..."
            className="bg-transparent text-on-surface placeholder:text-outline-variant font-body-sm text-body-sm px-space-sm py-2 focus:outline-none flex-1 min-w-0"
          />
          <label className="p-2 text-on-surface hover:text-primary transition-colors cursor-pointer" title="Attach files">
            <Icon name="attach_file" className="text-body-lg" />
            <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.zip" onChange={pickFiles} className="sr-only" />
          </label>
          <button
            type="submit"
            disabled={sending || (!text.trim() && files.length === 0)}
            className="bg-on-surface text-surface-container-lowest font-label-sm text-label-sm px-space-md py-2 uppercase font-bold hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}