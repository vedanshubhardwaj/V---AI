export type AssistantState = 'idle' | 'processing' | 'responding' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuickStarter {
  id: string;
  title: string;
  prompt: string;
  iconName: string;
  subtitle: string;
}
