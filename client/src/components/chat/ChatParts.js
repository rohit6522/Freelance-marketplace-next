import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import { formatDateTime } from "@/lib/orders";
import { cn } from "@/lib/utils";

export function SystemStamp({ text }) {
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

export function MessageBubble({ message, isOwn }) {
  if (message.type === "system") return <SystemStamp text={message.text} />;

  return (
    <div className={cn("flex items-start gap-space-sm", isOwn && "flex-row-reverse")}>
      <Avatar user={message.sender} size="w-8 h-8" shape="square" className="shrink-0" />
      <div
        className={cn(
          "flex flex-col gap-space-xs p-space-md max-w-xl min-w-0",
          isOwn ? "bg-surface-container-high" : "bg-surface-container-low"
        )}
      >
        <div className="flex items-center justify-between gap-space-md">
          <span className="font-label-sm text-label-sm text-on-surface uppercase font-bold">
            {isOwn ? "You" : message.sender?.name}
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