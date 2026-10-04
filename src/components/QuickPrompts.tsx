import React from 'react';
import { Sparkles, HelpCircle, Mail, BookOpen } from 'lucide-react';
import { QuickStarter } from '../types';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const STARTERS: QuickStarter[] = [
  {
    id: 'brief',
    title: 'Brief me on today',
    subtitle: 'High-level status & priorities',
    prompt: 'Give me a brief morning briefing on how to structure my day effectively, set clear priorities, and stay focused.',
    iconName: 'Sparkles',
  },
  {
    id: 'solve',
    title: 'Help me solve a problem',
    subtitle: 'Systematic tactical analysis',
    prompt: 'I have a challenging problem I need to solve. Guide me through diagnosing it step-by-step with structured questions.',
    iconName: 'HelpCircle',
  },
  {
    id: 'email',
    title: 'Draft an email',
    subtitle: 'Polished & professional tone',
    prompt: 'Help me compose a crisp, professional, and confident email. Ask me who it is for and what the main objective is.',
    iconName: 'Mail',
  },
  {
    id: 'explain',
    title: 'Explain a concept',
    subtitle: 'Clear, intuitive breakdown',
    prompt: 'Explain an intricate concept to me simply and intuitively, using a great analogy and practical examples.',
    iconName: 'BookOpen',
  },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, disabled }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-sky-400" />;
      case 'HelpCircle':
        return <HelpCircle className="w-4 h-4 text-cyan-400" />;
      case 'Mail':
        return <Mail className="w-4 h-4 text-indigo-400" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 px-2">
      <div className="text-center mb-3">
        <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">
          Initiate Direct Directives
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {STARTERS.map((starter) => (
          <button
            key={starter.id}
            onClick={() => onSelectPrompt(starter.prompt)}
            disabled={disabled}
            className="group relative flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-900/90 text-left transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
          >
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 group-hover:border-sky-500/40 transition-colors">
              {getIcon(starter.iconName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                {starter.title}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {starter.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
