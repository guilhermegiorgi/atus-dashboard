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
import { Skeleton } from "@/components/ui/skeleton";
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
  midia_url?: string;
}

function detectMediaType(
  content: string,
  tipo_msg?: string,
  midia_url?: string,
): string {
  const t = tipo_msg?.toUpperCase();
  if (t === "STICKER" || t === "STICKER") return "sticker";
  if (t === "LOCALIZACAO" || t === "LOCATION") return "location";
  if (t === "CONTACT" || t === "CONTATO") return "contact";
  if (t === "DOCUMENTO" || t === "DOCUMENT") return "document";
  if (t === "IMAGEM" || t === "IMAGE") return "image";
  if (t === "AUDIO") return "audio";
  if (t === "VIDEO" || t === "VÍDEO") return "video";
  if (midia_url) {
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(midia_url)) return "image";
    if (/\.(ogg|opus|mp3|wav|m4a)$/i.test(midia_url)) return "audio";
    if (/\.(mp4|webm|3gp)$/i.test(midia_url)) return "video";
  }
  if (content.startsWith("data:image/")) return "image";
  if (content.startsWith("data:audio/")) return "audio";
  if (content.startsWith("data:video/")) return "video";
  return "text";
}

function MediaContent({
  content,
  tipo_msg,
  midia_url,
}: {
  content: string;
  tipo_msg?: string;
  midia_url?: string;
}) {
  const type = detectMediaType(content, tipo_msg, midia_url);
  const mediaSrc = midia_url || content;
  const isValidMediaSrc =
    mediaSrc.startsWith("data:") ||
    mediaSrc.startsWith("http") ||
    mediaSrc.startsWith("/");

  switch (type) {
    case "image":
      if (!isValidMediaSrc) {
        return (
          <div className="flex items-center gap-2 rounded-dd-sm border border-dd-border-subtle px-3 py-2">
            <FileText className="h-4 w-4 text-dd-on-muted" />
            <span className="text-sm text-dd-on-surface">Imagem</span>
          </div>
        );
      }
      return (
        <div className="relative h-64 w-full">
          <Image
            src={mediaSrc}
            alt="Imagem"
            fill
            unoptimized
            className="rounded-dd-sm object-cover"
          />
        </div>
      );

    case "sticker":
      if (!isValidMediaSrc) {
        return <span className="text-sm text-dd-on-muted">Sticker</span>;
      }
      return (
        <Image
          src={mediaSrc}
          alt="Sticker"
          width={120}
          height={120}
          unoptimized
          className="object-contain"
        />
      );

    case "audio":
      if (!isValidMediaSrc) {
        return (
          <div className="flex items-center gap-2 rounded-dd-sm border border-dd-border-subtle px-3 py-2">
            <FileText className="h-4 w-4 text-dd-on-muted" />
            <span className="text-sm text-dd-on-surface">Áudio</span>
          </div>
        );
      }
      return (
        <audio controls aria-label="Áudio da conversa" className="w-full">
          <source src={mediaSrc} />
        </audio>
      );

    case "video":
      if (!isValidMediaSrc) {
        return (
          <div className="flex items-center gap-2 rounded-dd-sm border border-dd-border-subtle px-3 py-2">
            <FileText className="h-4 w-4 text-dd-on-muted" />
            <span className="text-sm text-dd-on-surface">Vídeo</span>
          </div>
        );
      }
      return (
        <video
          controls
          aria-label="Vídeo da conversa"
          className="max-h-64 w-full rounded-dd-sm"
        >
          <source src={mediaSrc} />
        </video>
      );

    case "document":
      if (!isValidMediaSrc) {
        return (
          <div className="flex items-center gap-2 rounded-dd-sm border border-dd-border-subtle px-3 py-2">
            <FileText className="h-4 w-4 text-dd-on-muted" />
            <span className="text-sm text-dd-on-surface">Documento</span>
          </div>
        );
      }
      return (
        <a
          href={mediaSrc}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Baixar documento"
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
          aria-label={`Abrir localização ${lat}, ${lng} no Google Maps`}
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
  midia_url,
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
          <MediaContent
            content={content}
            tipo_msg={tipo_msg}
            midia_url={midia_url}
          />
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
                <Skeleton className="mb-2 h-3 w-24" />
                <div className="space-y-2">
                  <Skeleton
                    className={cn("h-4", i % 2 === 0 ? "w-48" : "w-64")}
                  />
                  <Skeleton
                    className={cn("h-4", i % 2 === 0 ? "w-32" : "w-48")}
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
                midia_url={message.midia_url}
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
