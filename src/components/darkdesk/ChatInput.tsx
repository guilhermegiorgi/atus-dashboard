"use client";

import { useState, useRef, KeyboardEvent, useCallback } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  X,
  Pause,
  Image as ImageIcon,
  FileText,
  MapPin,
  User,
  Sticker,
} from "lucide-react";

type MediaKind = "image" | "video" | "document" | "sticker";

interface ChatInputProps {
  onSend?: (message: string) => void;
  onAttachment?: (file: File) => void;
  onSendMedia?: (type: MediaKind, file: File) => void;
  onSendLocation?: (lat: number, lng: number, title?: string) => void;
  onSendContact?: (name: string, phone: string) => void;
  onAudio?: (audioBlob: Blob) => void;
  disabled?: boolean;
  placeholder?: string;
}

function classifyMedia(file: File): MediaKind | "audio" {
  const mime = file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (ext === "webp") return "sticker";
  return "document";
}

export function ChatInput({
  onSend,
  onAttachment,
  onSendMedia,
  onSendLocation,
  onSendContact,
  onAudio,
  disabled = false,
  placeholder = "Digite uma mensagem...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachBtnRef = useRef<HTMLButtonElement>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Attach menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Modal states
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const openFilePicker = (accept: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = accept;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        const kind = classifyMedia(file);

        if (kind === "audio") {
          onAudio?.(file);
        } else if (onSendMedia) {
          onSendMedia(kind, file);
        } else if (onAttachment) {
          onAttachment(file);
        }
      }
    };
    input.click();
  };

  const handleOpenGallery = () => openFilePicker("image/*,video/*");
  const handleOpenDocument = () =>
    openFilePicker(".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv");

  const handleEmoji = () => {
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="relative flex items-end gap-2 border-t border-dd-border-subtle bg-dd-surface p-3">
      {/* Attach menu dropdown */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-pointer"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[200px] rounded-dd-md border border-dd-border-subtle bg-dd-surface-raised py-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                handleOpenGallery();
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-dd-on-surface hover:bg-dd-surface-overlay transition-colors"
            >
              <ImageIcon className="h-4 w-4 text-dd-muted" />
              <span>Imagem / Vídeo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                handleOpenDocument();
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-dd-on-surface hover:bg-dd-surface-overlay transition-colors"
            >
              <FileText className="h-4 w-4 text-dd-muted" />
              <span>Documento</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openFilePicker("image/*");
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-dd-on-surface hover:bg-dd-surface-overlay transition-colors"
            >
              <Sticker className="h-4 w-4 text-dd-muted" />
              <span>Sticker</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setLocationModalOpen(true);
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-dd-on-surface hover:bg-dd-surface-overlay transition-colors"
            >
              <MapPin className="h-4 w-4 text-dd-muted" />
              <span>Localização</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setContactModalOpen(true);
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-dd-on-surface hover:bg-dd-surface-overlay transition-colors"
            >
              <User className="h-4 w-4 text-dd-muted" />
              <span>Contato</span>
            </button>
          </div>
        </>
      )}

      {/* Location modal */}
      {locationModalOpen && (
        <LocationModal
          open={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          onConfirm={(lat, lng, title) => onSendLocation?.(lat, lng, title)}
        />
      )}

      {/* Contact modal */}
      {contactModalOpen && (
        <ContactModal
          open={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          onConfirm={(name, phone) => onSendContact?.(name, phone)}
        />
      )}

      {/* Attachment button */}
      <button
        type="button"
        ref={attachBtnRef}
        onClick={() => setMenuOpen((v) => !v)}
        disabled={disabled}
        aria-label="Anexar arquivo"
        className="flex h-9 w-9 items-center justify-center rounded-dd transition-colors text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface focus-visible:ring-2 focus-visible:ring-dd-accent-green disabled:opacity-50"
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
              aria-label="Parar gravação"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-dd-accent-red text-white hover:bg-dd-accent-red/80 focus-visible:ring-2 focus-visible:ring-dd-accent-green"
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
        aria-label="Inserir emoji"
        className="flex h-9 w-9 items-center justify-center rounded-dd transition-colors text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface focus-visible:ring-2 focus-visible:ring-dd-accent-green disabled:opacity-50"
        title="Inserir emoji"
      >
        <Smile className="h-4 w-4" />
      </button>

      {/* Audio recording button */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        aria-label={isRecording ? "Parar gravação" : "Gravar áudio"}
        className={`flex h-9 w-9 items-center justify-center rounded-dd transition-all focus-visible:ring-2 focus-visible:ring-dd-accent-green disabled:opacity-50 ${
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
        aria-label="Enviar mensagem"
        className="flex h-9 w-9 items-center justify-center rounded-dd-full bg-dd-accent-green text-white transition-all hover:bg-dd-green-hover focus-visible:ring-2 focus-visible:ring-dd-accent-green disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---------- Inline modals ---------- */

function LocationModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, title?: string) => void;
}) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [title, setTitle] = useState("");
  const [fetching, setFetching] = useState(false);

  if (!open) return null;

  const handleUseCurrent = async () => {
    setFetching(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }),
      );
      setLat(pos.coords.latitude.toFixed(6));
      setLng(pos.coords.longitude.toFixed(6));
    } catch {
      // user denied or unavailable
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) return;
    onConfirm(latitude, longitude, title.trim() || undefined);
    setLat("");
    setLng("");
    setTitle("");
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-dd-md border border-dd-border-subtle bg-dd-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dd-on-surface">
              Enviar localização
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="text-dd-muted hover:text-dd-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-dd-muted mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="-23.5505"
                  className="w-full rounded-dd-md bg-dd-surface-raised px-3 py-2 text-sm text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-dd-muted mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="-46.6333"
                  className="w-full rounded-dd-md bg-dd-surface-raised px-3 py-2 text-sm text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-dd-muted mb-1">
                Título (opcional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Escritório"
                className="w-full rounded-dd-md bg-dd-surface-raised px-3 py-2 text-sm text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleUseCurrent}
              disabled={fetching}
              className="w-full rounded-dd-md border border-dd-border-subtle px-3 py-2 text-sm text-dd-muted hover:text-dd-on-surface hover:bg-dd-surface-overlay transition-colors disabled:opacity-50"
            >
              {fetching ? "Obtendo localização..." : "Usar localização atual"}
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-dd-md px-3 py-1.5 text-sm text-dd-muted hover:text-dd-on-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))}
              aria-label="Enviar localização"
              className="rounded-dd-md bg-dd-accent-green px-3 py-1.5 text-sm text-white hover:bg-dd-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ContactModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) return;
    onConfirm(name.trim(), phone.trim());
    setName("");
    setPhone("");
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-dd-md border border-dd-border-subtle bg-dd-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dd-on-surface">
              Enviar contato
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="text-dd-muted hover:text-dd-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-dd-muted mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do contato"
                className="w-full rounded-dd-md bg-dd-surface-raised px-3 py-2 text-sm text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-dd-muted mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 99999-0000"
                className="w-full rounded-dd-md bg-dd-surface-raised px-3 py-2 text-sm text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-dd-md px-3 py-1.5 text-sm text-dd-muted hover:text-dd-on-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || !phone.trim()}
              aria-label="Enviar contato"
              className="rounded-dd-md bg-dd-accent-green px-3 py-1.5 text-sm text-white hover:bg-dd-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
