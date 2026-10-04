/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { VCoreAnimation } from './components/VCoreAnimation';
import { QuickPrompts } from './components/QuickPrompts';
import { ChatStream } from './components/ChatStream';
import { InputConsole } from './components/InputConsole';
import { ChatMessage, AssistantState } from './types';
import { Shield, Sparkles, Activity, AlertCircle } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCooldown, setRetryCooldown] = useState<number>(0);
  const [showCoreModal, setShowCoreModal] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const countdownTimerRef = useRef<number | null>(null);

  // Auto-scroll when messages or assistant state change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantState]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const startCooldown = (seconds: number) => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setRetryCooldown(seconds);

    countdownTimerRef.current = window.setInterval(() => {
      setRetryCooldown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Send message to backend Gemini API
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || assistantState === 'processing') return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setAssistantState('processing');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = {};

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResp = await response.text();
        throw new Error(
          `Server communication anomaly (${response.status}): ${textResp.slice(0, 80)}`
        );
      }

      if (data.isError || !response.ok) {
        const errMessage = data.error || 'Cognitive pipeline reported an operational issue.';
        setAssistantState('error');
        setErrorMessage(errMessage);

        const delay = data.retryDelaySeconds || (errMessage.includes('5 requests/minute') ? 25 : 5);
        startCooldown(delay);

        const fallbackAssistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: `Operational notice: ${errMessage}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackAssistantMsg]);
        return;
      }

      // Briefly switch to 'responding' to animate output delivery
      setAssistantState('responding');

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role: 'assistant',
        content: data.reply || "I am online, but received an empty response from the core.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setRetryCooldown(0);

      // Settle into idle state
      setTimeout(() => {
        setAssistantState('idle');
      }, 900);
    } catch (err: any) {
      console.error('Transmission failure:', err);
      setAssistantState('error');

      let rawMsg = err?.message || 'Unable to communicate with core.';
      let displayMsg = rawMsg;

      if (typeof rawMsg === 'string') {
        const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.error?.message) {
              displayMsg = parsed.error.message;
            }
          } catch {
            // keep rawMsg
          }
        }
      }

      if (displayMsg.toLowerCase().includes('high demand') || displayMsg.includes('503')) {
        displayMsg = 'The AI model is experiencing a momentary global demand spike. Please click retry in a moment.';
      }

      setErrorMessage(displayMsg);
      startCooldown(15);

      const fallbackAssistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `Operational notice: ${displayMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAssistantMsg]);
    }
  };

  // Quick reset conversation memory
  const handleClearChat = () => {
    setMessages([]);
    setAssistantState('idle');
    setErrorMessage(null);
    setRetryCooldown(0);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };

  // Retry the last user prompt if error occurred
  const handleRetryLast = () => {
    if (retryCooldown > 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="min-h-screen bg-[#040817] text-slate-100 flex flex-col relative overflow-hidden selection:bg-sky-500 selection:text-white">
      {/* Futuristic Background Gradients & Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -bottom-32 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#040817]/85 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCoreModal((prev) => !prev)}
              className="cursor-pointer group flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-900/60 transition-colors"
              title="Click to view V Core Diagnostic Hologram"
            >
              <VCoreAnimation state={assistantState} size="compact" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
              <Shield className="w-3 h-3 text-sky-400" />
              <span>SECURE PROTOCOL</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">SYSTEMS</span>
              <span className="text-emerald-400">NOMINAL</span>
            </div>
          </div>
        </div>
      </header>

      {/* Diagnostic Core Modal if clicked on header avatar */}
      {showCoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-sky-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(56,189,248,0.25)] flex flex-col items-center">
            <button
              onClick={() => setShowCoreModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-slate-800"
            >
              CLOSE [ESC]
            </button>
            <div className="text-xs uppercase font-mono text-sky-400 tracking-widest mb-1">
              Neural Core Matrix
            </div>
            <VCoreAnimation state={assistantState} size="normal" />
            <p className="text-xs text-slate-400 text-center mt-3 max-w-xs">
              Direct real-time telemetry from assistant V.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-between w-full max-w-4xl mx-auto relative z-10">
        {messages.length === 0 ? (
          /* Welcome View with Central Animated V & Starters */
          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
            {/* Holographic V Animation */}
            <VCoreAnimation state={assistantState} size="normal" />

            <div className="text-center mt-2 mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
                <span>Personal Assistant</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 font-mono">
                  V
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
                Sleek, confident, and sharp. Ready to assist with research, reasoning, drafting, and problem-solving.
              </p>
            </div>

            {/* Starter Suggestions */}
            <QuickPrompts
              onSelectPrompt={handleSendMessage}
              disabled={assistantState === 'processing'}
            />
          </div>
        ) : (
          /* Ongoing Chat Stream View */
          <div className="flex-1 overflow-y-auto py-4">
            {errorMessage && (
              <div className="w-full max-w-3xl mx-auto px-4 mb-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <ChatStream
              messages={messages}
              assistantState={assistantState}
              onRetry={handleRetryLast}
              retryCooldown={retryCooldown}
            />
            <div ref={chatBottomRef} />
          </div>
        )}

        {/* Input Console Bar */}
        <InputConsole
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          state={assistantState}
          hasMessages={messages.length > 0}
        />
      </main>

      {/* Footer Branding & State info */}
      <footer className="w-full border-t border-slate-900/80 py-2.5 px-4 text-center text-[11px] font-mono text-slate-600">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>V // ARCHITECTURE 1.0</span>
          </div>
          <span>AUTONOMOUS COGNITION ENGINE</span>
        </div>
      </footer>
    </div>
  );
}
