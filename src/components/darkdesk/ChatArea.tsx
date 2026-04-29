"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Sparkles, Zap } from "lucide-react";
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
}

function MessageBubble({
  content,
  timestamp,
  actorName,
  actorType,
  direction,
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
        <p className="whitespace-pre-wrap text-sm text-dd-on-surface">
          {content || "-"}
        </p>
      </div>
    </div>
  );
}

export function ChatArea({ conversation, isLoading }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only scroll to bottom on initial load, not on every message update
  // This allows user to scroll up and stay there
  useEffect(() => {
    if (conversation?.messages && conversation.messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [conversation?.lead_id]); // Only trigger when changing conversations, not when messages update

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
    <div className="flex h-full flex-col">
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
