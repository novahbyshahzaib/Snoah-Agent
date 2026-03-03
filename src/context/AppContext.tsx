import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, AppAction, Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  systemPrompt: 'You are Snoah, a helpful, smart, and friendly AI assistant. You provide clear, accurate, and thoughtful responses.',
  aiName: 'Snoah',
  temperature: 1.0,
  thinkingEnabled: false,
  agentMode: false,
};

const initialState: AppState = {
  chats: [],
  currentChatId: null,
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  isStreaming: false,
  sidebarOpen: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'ADD_CHAT':
      return { ...state, chats: [action.payload, ...state.chats] };
    case 'UPDATE_CHAT': {
      const updated = state.chats.map((c) =>
        c.id === action.payload.id ? action.payload : c
      );
      return { ...state, chats: updated };
    }
    case 'DELETE_CHAT': {
      const remaining = state.chats.filter((c) => c.id !== action.payload);
      const newCurrentId =
        state.currentChatId === action.payload
          ? (remaining[0]?.id ?? null)
          : state.currentChatId;
      return { ...state, chats: remaining, currentChatId: newCurrentId };
    }
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChatId: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload };
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'snoah-agent-state';

function loadFromStorage(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveToStorage(state: AppState) {
  try {
    const toSave = {
      chats: state.chats,
      currentChatId: state.currentChatId,
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const persisted = loadFromStorage();
  const merged: AppState = {
    ...initialState,
    ...persisted,
    settings: { ...DEFAULT_SETTINGS, ...(persisted.settings ?? {}) },
    sidebarOpen: window.innerWidth >= 768,
  };

  const [state, dispatch] = useReducer(appReducer, merged);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
