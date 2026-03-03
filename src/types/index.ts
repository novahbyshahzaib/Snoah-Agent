export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  images?: string[]; // base64 data URLs
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  apiKey: string;
  model: string;
  systemPrompt: string;
  aiName: string;
  temperature: number;
  thinkingEnabled: boolean;
  agentMode: boolean;
}

export type AppAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'SET_CURRENT_CHAT'; payload: string | null }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean };

export interface AppState {
  chats: Chat[];
  currentChatId: string | null;
  settings: Settings;
  isLoading: boolean;
  isStreaming: boolean;
  sidebarOpen: boolean;
}
