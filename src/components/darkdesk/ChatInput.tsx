"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Smile } from "lucide-react";

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Digite uma mensagem...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-dd-border-subtle bg-dd-surface p-3">
      {/* Attachment button */}
      <button
        type="button"
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-dd transition-colors text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface disabled:opacity-50"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      {/* Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none rounded-dd-md bg-dd-surface-raised px-3 py-2 pr-10 text-sm text-dd-on-surface placeholder:text-dd-muted border border-transparent focus:border-dd-accent-green focus:outline-none disabled:opacity-50"
          style={{ minHeight: "38px", maxHeight: "120px" }}
        />
      </div>

      {/* Emoji button */}
      <button
        type="button"
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-dd transition-colors text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface disabled:opacity-50"
      >
        <Smile className="h-4 w-4" />
      </button>

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="flex h-9 w-9 items-center justify-center rounded-dd-full bg-dd-accent-green text-white transition-all hover:bg-[#17a348] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
