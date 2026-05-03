"use client";

import { useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Bot,
  User,
  Sparkles,
  Zap,
  FileText,
  MapPin,
  Contact,
  Download,
} from "lucide-react";
import type { InboxConversationDetail } from "@/types/dashboard";

interface ChatAreaProps {
  conversation: InboxConversationDetail | null;
  isLoading?: boolean;
}

function formatTime(timestamp?: string | null): string {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

interface MessageBubbleProps {
  content?: string | null;
  timestamp?: string | null;
  actorName?: string | null;
  actorType?: string | null;
  direction?: string;
  tipo_msg?: string;
}

function detectMediaType(content: string, tipo_msg?: string): string {
  if (tipo_msg === "sticker") return "sticker";
  if (tipo_msg === "location") return "location";
  if (tipo_msg === "contact") return "contact";
  if (tipo_msg === "document") return "document";
  if (
    content.startsWith("data:image/") ||
    content.match(/\.(png|jpe?g|gif|webp|svg)$/i)
  )
    return "image";
  if (
    content.startsWith("data:audio/") ||
    content.match(/\.(ogg|opus|mp3|wav|m4a)$/i)
  )
    return "audio";
  if (content.startsWith("data:video/") || content.match(/\.(mp4|webm|3gp)$/i))
    return "video";
  return "text";
}

function MediaContent({
  content,
  tipo_msg,
}: {
  content: string;
  tipo_msg?: string;
}) {
  const type = detectMediaType(content, tipo_msg);

  switch (type) {
    case "image":
      return (
        <div className="relative h-64 w-full">
          <Image
            src={content}
            alt="Imagem"
            fill
            unoptimized
            className="rounded-dd-sm object-cover"
          />
        </div>
      );

    case "sticker":
      return (
        <Image
          src={content}
          alt="Sticker"
          width={120}
          height={120}
          unoptimized
          className="object-contain"
        />
      );

    case "audio":
      return (
        <audio controls className="w-full">
          <source src={content} />
        </audio>
      );

    case "video":
      return (
        <video controls className="max-h-64 w-full rounded-dd-sm">
          <source src={content} />
        </video>
      );

    case "document":
      return (
        <a
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-dd-sm border border-dd-border-subtle px-3 py-2 transition-opacity hover:opacity-80"
        >
          <FileText className="h-4 w-4 text-dd-on-muted" />
          <span className="text-sm text-dd-on-surface">Documento</span>
          <Download className="ml-auto h-3.5 w-3.5 text-dd-on-muted" />
        </a>
      );

    case "location": {
      const parts = content.split(",");
      const lat = parts[0]?.trim();
      const lng = parts[1]?.trim();
      const mapsUrl =
        lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : "#";
      return (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-dd-sm border border-dd-border-subtle px-3 py-2 transition-opacity hover:opacity-80"
        >
          <MapPin className="h-4 w-4 text-dd-on-muted" />
          <span className="text-sm text-dd-on-surface">
            {lat && lng ? `${lat}, ${lng}` : "Localização"}
          </span>
        </a>
      );
    }

    case "contact": {
      return (
        <div className="flex items-center gap-2 rounded-dd-sm border border-dd-border-subtle px-3 py-2">
          <Contact className="h-4 w-4 text-dd-on-muted" />
          <span className="text-sm text-dd-on-surface">{content}</span>
        </div>
      );
    }

    default:
      return (
        <p className="whitespace-pre-wrap text-sm text-dd-on-surface">
          {content || "-"}
        </p>
      );
  }
}

function MessageBubble({
  content,
  timestamp,
  actorName,
  actorType,
  direction,
  tipo_msg,
}: MessageBubbleProps) {
  const isOutgoing = direction === "SAIDA";

  return (
    <div className={cn("flex", isOutgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-dd-lg px-4 py-3",
          isOutgoing ? "bg-dd-accent-green-muted" : "bg-dd-surface-raised",
        )}
      >
        {/* Metadata */}
        <div className="mb-1.5 flex items-center gap-1.5 text-timestamp text-dd-on-muted">
          {isOutgoing ? (
            <Bot className="h-3 w-3" />
          ) : (
            <User className="h-3 w-3" />
          )}
          <span className="font-medium">
            {actorName || actorType || (isOutgoing ? "Bot" : "Cliente")}
          </span>
          <span>·</span>
          <span>{formatTime(timestamp)}</span>
        </div>

        {/* Content */}
        {content ? (
          <MediaContent content={content} tipo_msg={tipo_msg} />
        ) : (
          <p className="text-sm text-dd-on-surface">-</p>
        )}
      </div>
    </div>
  );
}

export function ChatArea({ conversation, isLoading }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesJson = useMemo(
    () => JSON.stringify(conversation?.messages),
    [conversation?.messages],
  );

  // Scroll to bottom when conversation changes or new messages arrive
  useEffect(() => {
    if (conversation?.messages && conversation.messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [conversation?.lead_id, messagesJson]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        {/* Messages area */}
        <div className="flex-1 h-0 overflow-y-auto p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[70%] rounded-dd-lg p-4",
                  i % 2 === 0 ? "ml-auto" : "mr-auto",
                )}
              >
                <div className="mb-2 h-3 w-24 animate-pulse rounded bg-dd-surface-overlay" />
                <div className="space-y-2">
                  <div
                    className={cn(
                      "h-4 animate-pulse rounded",
                      i % 2 === 0
                        ? "bg-dd-accent-green-muted w-48"
                        : "bg-dd-surface-raised w-64",
                    )}
                  />
                  <div
                    className={cn(
                      "h-4 animate-pulse rounded",
                      i % 2 === 0
                        ? "bg-dd-accent-green-muted w-32"
                        : "bg-dd-surface-raised w-48",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-dd-full bg-dd-surface">
          <MessageSquare className="h-8 w-8 text-dd-muted" />
        </div>
        <h3 className="text-h3 text-dd-on-surface">Selecione uma conversa</h3>
        <p className="mt-1 text-body-sm text-dd-on-muted">
          Escolha uma conversa na lista para ver as mensagens
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 h-0 overflow-y-auto p-4">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-dd-on-muted">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversation.messages.map((message, index) => (
              <MessageBubble
                key={message.id || `${index}-${message.timestamp}`}
                content={message.content}
                timestamp={message.timestamp}
                actorName={message.actor_name}
                actorType={message.actor_type}
                direction={message.direction}
                tipo_msg={message.tipo_msg}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* AI Actions */}
      {conversation.messages.length > 0 && (
        <div className="flex gap-2 border-t border-dd-border-subtle bg-dd-surface p-3">
          <button className="ai-button-summarize flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80">
            <Sparkles className="h-3.5 w-3.5" />
            Resumir com IA
          </button>
          <button className="ai-button-followup flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80">
            <Zap className="h-3.5 w-3.5" />
            Sugerir follow-up
          </button>
        </div>
      )}
    </div>
  );
}

// Import para o ícone
import { MessageSquare } from "lucide-react";
