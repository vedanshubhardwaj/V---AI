import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, CornerDownLeft } from 'lucide-react';
import { AssistantState } from '../types';

interface InputConsoleProps {
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  state: AssistantState;
  hasMessages: boolean;
}

export const InputConsole: React.FC<InputConsoleProps> = ({
  onSendMessage,
  onClearChat,
  state,
  hasMessages,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isBusy = state === 'processing';

  const handleSend = () => {
    if (!input.trim() || isBusy) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-sky-500/60 focus-within:shadow-[0_0_25px_rgba(56,189,248,0.25)] transition-all duration-300 backdrop-blur-md">
        {/* Top Control Bar with Quick Reset */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 text-xs text-slate-400 border-b border-slate-800/40">
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBusy ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="font-mono text-[11px] tracking-wider text-slate-400">
              V CORE COMMAND LINE
            </span>
          </div>

          {hasMessages && (
            <button
              onClick={onClearChat}
              disabled={isBusy}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-0.5 rounded transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Reset conversation and start fresh"
            >
              <Trash2 className="w-3 h-3" />
              <span>Reset Context</span>
            </button>
          )}
        </div>

        {/* Text Input Row */}
        <div className="flex items-end gap-2 p-2.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isBusy}
            placeholder={
              isBusy
                ? 'V is processing your command...'
                : 'Instruct V... (Enter to send, Shift+Enter for newline)'
            }
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base resize-none outline-none max-h-36 min-h-[38px] py-1.5 px-2 font-normal"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isBusy}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              input.trim() && !isBusy
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)] active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Send directive (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom helper info */}
        <div className="flex items-center justify-between px-3 pb-1.5 text-[10px] font-mono text-slate-500">
          <span className="hidden sm:inline">
            Press <CornerDownLeft className="inline w-2.5 h-2.5 mx-0.5" /> to transmit
          </span>
          <span className="ml-auto">Model: Gemini 3.8 Flash</span>
        </div>
      </div>
    </div>
  );
};
