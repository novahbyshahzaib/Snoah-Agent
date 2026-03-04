import { useEffect, useRef, useCallback, useState, lazy, Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Settings as SettingsIcon,
  Sparkles,
  Menu,
  ChevronRight,
  Brain,
  Zap,
  AlertCircle,
  Bot,
} from 'lucide-react';
import { useApp } from './context/AppContext';
import type { Chat, Message, Settings } from './types';
import { streamChatResponse } from './utils/gemini';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import SettingsModal from './components/SettingsModal';
import PersonalizationModal from './components/PersonalizationModal';

const ChatMessage = lazy(() => import('./components/ChatMessage'));
const StreamingMessage = lazy(() =>
  import('./components/ChatMessage').then((mod) => ({ default: mod.StreamingMessage }))
);

const STREAM_TIMEOUT_MS = 60000;

function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim().replace(/\n+/g, ' ');
  return trimmed.length > 30 ? trimmed.slice(0, 30) + '…' : trimmed || 'New chat';
}

export default function App() {
  const { state, dispatch } = useApp();
  const { chats, currentChatId, settings, isStreaming, sidebarOpen } = state;

  const [showSettings, setShowSettings] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingThinking, setStreamingThinking] = useState('');
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((c) => c.id === currentChatId) ?? null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, streamingContent, scrollToBottom]);

  const handleNewChat = useCallback(() => {
    const chat: Chat = {
      id: uuidv4(),
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_CHAT', payload: chat });
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chat.id });
  }, [dispatch]);

  // Auto-create initial chat
  useEffect(() => {
    if (chats.length === 0) {
      handleNewChat();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectChat = useCallback(
    (id: string) => {
      dispatch({ type: 'SET_CURRENT_CHAT', payload: id });
    },
    [dispatch]
  );

  const handleDeleteChat = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_CHAT', payload: id });
    },
    [dispatch]
  );

  const handleSaveSettings = useCallback(
    (s: Settings) => {
      dispatch({ type: 'SET_SETTINGS', payload: s });
    },
    [dispatch]
  );

  const handleToggleThinking = useCallback(() => {
    dispatch({
      type: 'SET_SETTINGS',
      payload: { ...settings, thinkingEnabled: !settings.thinkingEnabled },
    });
  }, [dispatch, settings]);

  const handleToggleAgent = useCallback(() => {
    dispatch({
      type: 'SET_SETTINGS',
      payload: { ...settings, agentMode: !settings.agentMode },
    });
  }, [dispatch, settings]);

  const handleStop = useCallback(() => {
    abortRef.current?.();
  }, []);

  const handleSend = useCallback(
    async (content: string, images: string[]) => {
      setError(null);

      let chat = currentChat;
      if (!chat) {
        const newChat: Chat = {
          id: uuidv4(),
          title: 'New conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        dispatch({ type: 'ADD_CHAT', payload: newChat });
        dispatch({ type: 'SET_CURRENT_CHAT', payload: newChat.id });
        chat = newChat;
      }

      const userMsg: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        images: images.length > 0 ? images : undefined,
        timestamp: Date.now(),
      };

      const updatedMessages = [...chat.messages, userMsg];
      const titleUpdate =
        chat.messages.length === 0 ? generateTitle(content || 'Image') : chat.title;

      const updatedChat: Chat = {
        ...chat,
        title: titleUpdate,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      dispatch({ type: 'UPDATE_CHAT', payload: updatedChat });
      dispatch({ type: 'SET_STREAMING', payload: true });

      setStreamingContent('');
      setStreamingThinking('');

      let accContent = '';
      let accThinking = '';
      let aborted = false;

      abortRef.current = () => {
        aborted = true;
        dispatch({ type: 'SET_STREAMING', payload: false });
        if (accContent || accThinking) {
          const assistantMsg: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: accContent,
            thinking: accThinking || undefined,
            timestamp: Date.now(),
          };
          const finalChat: Chat = {
            ...updatedChat,
            messages: [...updatedMessages, assistantMsg],
            updatedAt: Date.now(),
          };
          dispatch({ type: 'UPDATE_CHAT', payload: finalChat });
        }
        setStreamingContent('');
        setStreamingThinking('');
      };

      try {
        await new Promise<void>((resolve, reject) => {
          let timeoutId: ReturnType<typeof window.setTimeout> | undefined;
          const resetTimeout = () => {
            if (timeoutId !== undefined) {
              window.clearTimeout(timeoutId);
            }
            timeoutId = window.setTimeout(() => {
              reject(new Error('Request timed out. Please try again.'));
            }, STREAM_TIMEOUT_MS);
          };
          resetTimeout();

          streamChatResponse(updatedMessages, settings, {
            onChunk: (text) => {
              if (aborted) return;
              resetTimeout();
              accContent += text;
              setStreamingContent((prev) => prev + text);
            },
            onThinking: (text) => {
              if (aborted) return;
              resetTimeout();
              accThinking += text;
              setStreamingThinking((prev) => prev + text);
            },
            onDone: () => {
              if (aborted) return;
              dispatch({ type: 'SET_STREAMING', payload: false });

              const assistantMsg: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: accContent,
                thinking: accThinking || undefined,
                timestamp: Date.now(),
              };

              const finalChat: Chat = {
                ...updatedChat,
                messages: [...updatedMessages, assistantMsg],
                updatedAt: Date.now(),
              };

              dispatch({ type: 'UPDATE_CHAT', payload: finalChat });
              setStreamingContent('');
              setStreamingThinking('');
              if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
              }
              resolve();
            },
            onError: (err) => {
              if (aborted) return;
              if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
              }
              reject(err);
            },
          }).catch((err) => {
            if (timeoutId !== undefined) {
              window.clearTimeout(timeoutId);
            }
            reject(err);
          });
        });
      } catch (err) {
        if (!aborted) {
          aborted = true;
          dispatch({ type: 'SET_STREAMING', payload: false });
          setError(err instanceof Error ? err.message : String(err));
          setStreamingContent('');
          setStreamingThinking('');
        }
      }
    },
    [currentChat, dispatch, settings]
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false })}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm shrink-0">
          <button
            onClick={() =>
              dispatch({ type: 'SET_SIDEBAR_OPEN', payload: !sidebarOpen })
            }
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <ChevronRight size={18} /> : <Menu size={18} />}
          </button>

          {!sidebarOpen && (
            <div className="flex items-center gap-2 mr-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow">
                <Bot size={14} className="text-white" />
              </div>
              <span className="font-bold text-sm text-slate-100 hidden sm:inline">
                Snoah Agent
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {currentChat?.title || 'New conversation'}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {settings.thinkingEnabled && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300">
                <Brain size={10} />
                Thinking
              </span>
            )}
            {settings.agentMode && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-cyan-600/20 border border-cyan-500/30 text-cyan-300">
                <Zap size={10} />
                Agent
              </span>
            )}
            <span className="text-xs text-slate-600 font-mono">{settings.model}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPersonalization(true)}
              title="AI Personalization"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Sparkles size={16} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              title="Settings"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <SettingsIcon size={16} />
            </button>
          </div>
        </header>

        {/* Messages area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {/* Empty state */}
            {(!currentChat || currentChat.messages.length === 0) && !isStreaming && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-violet-500/20 mb-5">
                  <Bot size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">
                  Hello, I'm {settings.aiName}
                </h2>
                <p className="text-slate-400 mb-6 max-w-sm text-sm leading-relaxed">
                  Your AI assistant powered by Google Gemini. Ask me anything — code, math, writing, analysis, or just chat!
                </p>
                {!settings.apiKey && (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-medium transition-all shadow-lg hover:shadow-violet-500/25"
                  >
                    <SettingsIcon size={14} />
                    Add API Key to start
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3 mt-6 max-w-sm w-full">
                  {[
                    'Explain quantum entanglement',
                    'Write a Python web scraper',
                    'Solve: ∫x² dx',
                    'Plan a React app architecture',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion, [])}
                      disabled={!settings.apiKey}
                      className="text-left px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400 hover:text-slate-200 hover:border-violet-500/30 hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <Suspense fallback={null}>
              {currentChat?.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  aiName={settings.aiName}
                />
              ))}

              {/* Streaming */}
              {isStreaming && (
                <StreamingMessage
                  content={streamingContent}
                  thinking={streamingThinking}
                  aiName={settings.aiName}
                />
              )}
            </Suspense>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/30">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-300">Error</p>
                  <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
                  {error.includes('API key') && (
                    <button
                      onClick={() => setShowSettings(true)}
                      className="mt-2 text-xs text-violet-400 hover:underline"
                    >
                      Open Settings →
                    </button>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input */}
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
            thinkingEnabled={settings.thinkingEnabled}
            agentMode={settings.agentMode}
            onToggleThinking={handleToggleThinking}
            onToggleAgent={handleToggleAgent}
            disabled={!settings.apiKey}
          />
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showPersonalization && (
        <PersonalizationModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowPersonalization(false)}
        />
      )}
    </div>
  );
}
