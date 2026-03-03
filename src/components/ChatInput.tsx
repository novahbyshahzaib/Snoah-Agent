import React, { useRef, useState, useCallback } from 'react';
import {
  Send,
  ImagePlus,
  X,
  Brain,
  Bot,
  Zap,
  StopCircle,
} from 'lucide-react';

interface Props {
  onSend: (content: string, images: string[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  thinkingEnabled: boolean;
  agentMode: boolean;
  onToggleThinking: () => void;
  onToggleAgent: () => void;
  disabled: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
  thinkingEnabled,
  agentMode,
  onToggleThinking,
  onToggleAgent,
  disabled,
}: Props) {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          setImages((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    },
    []
  );

  const removeImage = useCallback((idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    if (disabled || isStreaming) return;
    onSend(trimmed, images);
    setText('');
    setImages([]);
  }, [text, images, disabled, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      // Auto-resize
      const el = e.target;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    },
    []
  );

  return (
    <div className="border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm p-3 md:p-4">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`preview-${i}`}
                className="w-16 h-16 object-cover rounded-lg border border-slate-700"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mode toggles */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={onToggleThinking}
          title="Toggle thinking mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            thinkingEnabled
              ? 'bg-violet-600/30 border border-violet-500/50 text-violet-300'
              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600'
          }`}
        >
          <Brain size={12} />
          <span className="hidden sm:inline">Thinking</span>
        </button>
        <button
          onClick={onToggleAgent}
          title="Toggle agent mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            agentMode
              ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-300'
              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600'
          }`}
        >
          <Zap size={12} />
          <span className="hidden sm:inline">Agent</span>
        </button>
        <span className="text-xs text-slate-600 ml-1 hidden sm:inline">
          {thinkingEnabled && agentMode
            ? 'Thinking + Agent'
            : thinkingEnabled
            ? 'Shows reasoning'
            : agentMode
            ? 'Deep task mode'
            : 'Shift+Enter for newline'}
        </span>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl px-3 py-2 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
        {/* Image upload */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          title="Upload image"
          className="shrink-0 p-1.5 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 mb-0.5"
        >
          <ImagePlus size={18} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message Snoah…"
          rows={1}
          className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-sm resize-none outline-none leading-relaxed py-1 max-h-48 disabled:opacity-50"
          style={{ height: 'auto', minHeight: '1.5rem' }}
        />

        {/* Send / Stop */}
        {isStreaming ? (
          <button
            onClick={onStop}
            title="Stop generation"
            className="shrink-0 p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-all mb-0.5"
          >
            <StopCircle size={18} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && images.length === 0)}
            title="Send message"
            className="shrink-0 p-2 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 text-white hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-violet-500/25 mb-0.5"
          >
            <Send size={18} />
          </button>
        )}
      </div>
      <p className="text-center text-xs text-slate-600 mt-2">
        Powered by Google Gemini · <Bot size={10} className="inline" /> Snoah Agent
      </p>
    </div>
  );
}
