"use client";

import { useState } from "react";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import * as uploadService from "@/services/uploadService";
import { formatBytes } from "@/lib/orders";

export default function MessageComposer({ onSend }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  const pick = (e) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    const problem = uploadService.validateFiles(picked, files.length);
    if (problem) {
      toast.error(problem);
      return;
    }
    setFiles((current) => [...current, ...picked]);
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if ((!body && files.length === 0) || sending) return;

    setSending(true);
    try {
      const attachments = files.length > 0 ? (await uploadService.uploadFiles(files)).data.files : [];
      await onSend({ text: body, attachments });
      setText("");
      setFiles([]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-xs">
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

      <form onSubmit={submit} className="flex items-center bg-surface-container-low p-space-xs">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          aria-label="Message"
          placeholder="Write a message..."
          className="bg-transparent text-on-surface placeholder:text-outline-variant font-body-sm text-body-sm px-space-sm py-2 focus:outline-none flex-1 min-w-0"
        />
        <label className="p-2 text-on-surface hover:text-primary transition-colors cursor-pointer" title="Attach files">
          <Icon name="attach_file" className="text-body-lg" />
          <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.zip" onChange={pick} className="sr-only" />
        </label>
        <button
          type="submit"
          disabled={sending || (!text.trim() && files.length === 0)}
          className="bg-on-surface text-surface-container-lowest font-label-sm text-label-sm px-space-md py-2 uppercase font-bold hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}