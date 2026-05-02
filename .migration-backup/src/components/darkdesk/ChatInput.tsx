"use client";

import { useState, useRef, KeyboardEvent, useCallback } from "react";
import { Send, Paperclip, Smile, Mic, X, Pause } from "lucide-react";

interface ChatInputProps {
  onSend?: (message: string) => void;
  onAttachment?: (file: File) => void;
  onAudio?: (audioBlob: Blob) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onAttachment,
  onAudio,
  disabled = false,
  placeholder = "Digite uma mensagem...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleAttachment = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0 && onAttachment) {
        onAttachment(files[0]);
      }
    };
    input.click();
  };

  const handleEmoji = () => {
    // Simple emoji picker - could be replaced with a proper emoji picker library
    const emojis = ["😊", "👍", "❤️", "🎉", "🔥", "✅", "❌", "💡", "⭐", "🙏"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage((prev) => prev + randomEmoji);
    textareaRef.current?.focus();
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        if (onAudio && audioChunksRef.current.length > 0) {
          onAudio(audioBlob);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
    }
  }, [onAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
        onClick={handleAttachment}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-dd transition-colors text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface disabled:opacity-50"
        title="Anexar arquivo"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      {/* Input */}
      <div className="flex-1 relative">
        {isRecording ? (
          <div className="flex items-center gap-2 h-[38px] px-3 rounded-dd-md bg-dd-accent-red/20 border border-dd-accent-red">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-dd-accent-red animate-pulse" />
              <span className="text-sm text-dd-accent-red font-medium">
                Gravando...
              </span>
            </div>
            <span className="text-sm text-dd-accent-red ml-auto">
              {formatTime(recordingTime)}
            </span>
            <button
              type="button"
              onClick={stopRecording}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-dd-accent-red text-white hover:bg-dd-accent-red/80"
              title="Parar gravação"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* Emoji button */}
      <button
        type="button"
        onClick={handleEmoji}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-dd transition-colors text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface disabled:opacity-50"
        title="Inserir emoji"
      >
        <Smile className="h-4 w-4" />
      </button>

      {/* Audio recording button */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`flex h-9 w-9 items-center justify-center rounded-dd transition-all disabled:opacity-50 ${
          isRecording
            ? "bg-dd-accent-red text-white animate-pulse"
            : "text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface"
        }`}
        title={isRecording ? "Parar gravação" : "Gravar áudio"}
      >
        {isRecording ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
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
