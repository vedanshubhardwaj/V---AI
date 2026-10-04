import React, { useState } from 'react';
import { Copy, Check, User, Bot, RefreshCw } from 'lucide-react';
import { ChatMessage, AssistantState } from '../types';

interface ChatStreamProps {
  messages: ChatMessage[];
  assistantState: AssistantState;
  onRetry?: () => void;
  retryCooldown?: number;
}

export const ChatStream: React.FC<ChatStreamProps> = ({
  messages,
  assistantState,
  onRetry,
  retryCooldown = 0,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-3xl mx-auto px-4 py-2">
      {messages.map((message) => {
        const isUser = message.role === 'user';
        const isNotice = message.content.startsWith('Operational notice:');

        return (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isUser
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : isNotice
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-gradient-to-tr from-sky-600 to-indigo-700 border-sky-400/50 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 transition-all duration-200 border ${
                isUser
                  ? 'bg-slate-800/80 border-slate-700/60 text-slate-100 rounded-tr-sm'
                  : isNotice
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 rounded-tl-sm'
                  : 'bg-slate-900/90 border-slate-800 hover:border-sky-500/40 text-slate-200 rounded-tl-sm shadow-[0_4px_25px_rgba(3,7,18,0.5)]'
              }`}
            >
              {/* Header inside bubble */}
              <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-slate-800/50">
                <span
                  className={`text-[11px] font-mono font-semibold tracking-wider ${
                    isNotice ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {isUser ? 'YOU' : isNotice ? 'V // SYSTEM TELEMETRY' : 'V // ASSISTANT'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {message.timestamp}
                </span>
              </div>

              {/* Message Content */}
              <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap select-text break-words">
                {message.content}
              </div>

              {/* Copy button for Assistant messages */}
              {!isUser && !isNotice && (
                <div className="mt-2.5 pt-1.5 flex items-center justify-end">
                  <button
                    onClick={() => handleCopy(message.id, message.content)}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-sky-400 transition-colors px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800 hover:border-sky-500/30 cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Real Processing State Indicator */}
      {assistantState === 'processing' && (
        <div className="flex items-start gap-3 flex-row animate-pulse">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-sky-950 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Bot className="w-4 h-4" />
          </div>
          <div className="rounded-2xl rounded-tl-sm p-4 bg-slate-900/90 border border-cyan-500/30 text-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono tracking-widest text-cyan-300">
                V IS COMPUTING...
              </span>
            </div>
            <div className="flex gap-1.5 mt-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400/80 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400/80 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400/80 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Error Retry Banner if in Error State */}
      {assistantState === 'error' && onRetry && (
        <div className="flex justify-center my-2">
          <button
            onClick={onRetry}
            disabled={retryCooldown > 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all duration-200 shadow-md ${
              retryCooldown > 0
                ? 'bg-slate-800/80 border border-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-sky-950/90 border border-sky-500/50 text-sky-200 hover:bg-sky-900 cursor-pointer hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]'
            }`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${retryCooldown > 0 ? 'animate-spin' : ''}`}
            />
            <span>
              {retryCooldown > 0
                ? `RETRY READY IN ${retryCooldown}s`
                : 'RETRY DIRECTIVE'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
