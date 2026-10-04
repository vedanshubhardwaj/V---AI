import React from 'react';
import { AssistantState } from '../types';

interface VCoreAnimationProps {
  state: AssistantState;
  size?: 'normal' | 'compact';
}

export const VCoreAnimation: React.FC<VCoreAnimationProps> = ({ state, size = 'normal' }) => {
  const isCompact = size === 'compact';

  // Config based on assistant state
  const stateConfig = {
    idle: {
      title: 'V // READY',
      desc: 'Cognitive systems online. Standing by for input.',
      statusColor: 'text-sky-400',
      glowColor: 'rgba(56, 189, 248, 0.35)',
      ringColor: 'border-sky-500/40',
      coreBg: 'from-sky-500 via-blue-600 to-indigo-800',
      badgeBg: 'bg-sky-950/60 border-sky-500/30 text-sky-300',
    },
    processing: {
      title: 'V // PROCESSING',
      desc: 'Synthesizing knowledge & neural routing...',
      statusColor: 'text-cyan-300',
      glowColor: 'rgba(6, 182, 212, 0.65)',
      ringColor: 'border-cyan-400/80',
      coreBg: 'from-cyan-400 via-sky-500 to-blue-700',
      badgeBg: 'bg-cyan-950/80 border-cyan-400/60 text-cyan-200 animate-pulse',
    },
    responding: {
      title: 'V // TRANSMITTING',
      desc: 'Formulating and streaming response.',
      statusColor: 'text-blue-300',
      glowColor: 'rgba(96, 165, 250, 0.6)',
      ringColor: 'border-blue-400/70',
      coreBg: 'from-blue-400 via-indigo-500 to-cyan-600',
      badgeBg: 'bg-blue-950/80 border-blue-400/50 text-blue-200',
    },
    error: {
      title: 'V // SYSTEM ALERT',
      desc: 'Disruption in neural pipeline. Standing by to retry.',
      statusColor: 'text-rose-400',
      glowColor: 'rgba(244, 63, 94, 0.45)',
      ringColor: 'border-rose-500/60',
      coreBg: 'from-rose-500 via-amber-600 to-rose-900',
      badgeBg: 'bg-rose-950/80 border-rose-500/40 text-rose-200',
    },
  }[state];

  if (isCompact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Subtle glow */}
          <div
            className="absolute inset-0 rounded-full blur-md transition-all duration-700"
            style={{ backgroundColor: stateConfig.glowColor }}
          />

          {/* Outer rotating ring */}
          <div
            className={`absolute inset-0 rounded-full border border-dashed ${stateConfig.ringColor} ${
              state === 'processing' ? 'animate-spin' : 'animate-spin-slow'
            }`}
          />

          {/* Core Orb */}
          <div
            className={`relative w-6 h-6 rounded-full bg-gradient-to-tr ${stateConfig.coreBg} flex items-center justify-center shadow-lg transition-transform duration-500 ${
              state === 'processing'
                ? 'scale-110 animate-pulse'
                : state === 'responding'
                ? 'scale-105'
                : 'scale-100'
            }`}
          >
            <span className="text-[10px] font-bold text-white tracking-widest">V</span>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide text-slate-100">V</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider border ${stateConfig.badgeBg}`}
            >
              {state}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono tracking-tight truncate max-w-[200px]">
            {stateConfig.title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 select-none">
      {/* Central Holographic Animation Vessel */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-2">
        {/* Deep ambient backdrop glow */}
        <div
          className="absolute inset-2 rounded-full blur-2xl transition-all duration-1000 opacity-60 pointer-events-none"
          style={{ backgroundColor: stateConfig.glowColor }}
        />

        {/* Outer Orbit Track 1 */}
        <div
          className={`absolute inset-0 rounded-full border border-sky-500/20 transition-all duration-700 ${
            state === 'processing'
              ? 'scale-105 border-cyan-400/50 animate-spin'
              : 'animate-spin-slow'
          }`}
        >
          {/* Orbital Satellite Node */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,1)]" />
        </div>

        {/* Outer Orbit Track 2 (Reverse Spin) */}
        <div
          className={`absolute inset-4 rounded-full border border-dashed ${stateConfig.ringColor} transition-all duration-700 ${
            state === 'processing'
              ? 'animate-spin-reverse [animation-duration:4s]'
              : 'animate-spin-reverse'
          }`}
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,0.9)]" />
        </div>

        {/* Radial Wave Harmonic Rings (Visible during RESPONDING / PROCESSING) */}
        {state === 'processing' && (
          <div className="absolute inset-8 rounded-full border border-cyan-400/40 animate-ping [animation-duration:2.5s]" />
        )}

        {state === 'responding' && (
          <div className="absolute inset-6 rounded-full border border-blue-400/50 animate-pulse [animation-duration:1.2s]" />
        )}

        {/* Inner Geometric Shield */}
        <div className="absolute inset-10 rounded-full border border-sky-400/25 backdrop-blur-[2px] bg-slate-950/40" />

        {/* Central Core Sphere */}
        <div
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr ${
            stateConfig.coreBg
          } flex items-center justify-center shadow-2xl transition-all duration-500 ${
            state === 'processing'
              ? 'scale-110 shadow-[0_0_50px_rgba(6,182,212,0.85)]'
              : state === 'responding'
              ? 'scale-105 shadow-[0_0_40px_rgba(59,130,246,0.7)] animate-pulse'
              : state === 'error'
              ? 'scale-100 shadow-[0_0_35px_rgba(244,63,94,0.6)]'
              : 'animate-pulse-glow shadow-[0_0_30px_rgba(56,189,248,0.5)]'
          }`}
        >
          {/* Inner Light Core */}
          <div className="absolute inset-2 rounded-full bg-slate-950/30 flex items-center justify-center backdrop-blur-xs">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-widest drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]">
              V
            </span>
          </div>

          {/* Sound/Transmission Waves while responding */}
          {state === 'responding' && (
            <div className="absolute -bottom-8 flex items-center gap-1">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-1 h-5 bg-sky-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-6 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-4 bg-sky-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.5s]" />
            </div>
          )}
        </div>
      </div>

      {/* Futuristic State Status Readout */}
      <div className="text-center mt-3 flex flex-col items-center">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wider border ${stateConfig.badgeBg} transition-all duration-300`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'error'
                ? 'bg-rose-400 animate-ping'
                : state === 'processing'
                ? 'bg-cyan-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          {stateConfig.title}
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 font-normal max-w-sm">
          {stateConfig.desc}
        </p>
      </div>
    </div>
  );
};
