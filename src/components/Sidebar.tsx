import React, { useCallback } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  Bot,
  ChevronLeft,
} from 'lucide-react';
import type { Chat } from '../types';

interface Props {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onClose,
}: Props) {
  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDeleteChat(id);
    },
    [onDeleteChat]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full z-30 md:z-auto flex flex-col w-72 bg-slate-900 border-r border-slate-700/50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${!isOpen ? 'md:w-0 md:overflow-hidden md:border-0' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-lg">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100">Snoah Agent</h1>
              <p className="text-xs text-slate-500">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 py-3 shrink-0">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 hover:border-violet-500/50 text-slate-200 hover:text-white text-sm font-medium transition-all hover:from-violet-600/30 hover:to-cyan-600/30 group"
          >
            <Plus size={16} className="text-violet-400 group-hover:text-violet-300" />
            New conversation
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-4">
              <MessageSquare size={24} className="text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-600">Start a new chat above</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    chat.id === currentChatId
                      ? 'bg-violet-600/20 border border-violet-500/30 text-slate-100'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare
                    size={14}
                    className={`shrink-0 mt-0.5 ${
                      chat.id === currentChatId ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-snug">{chat.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{timeAgo(chat.updatedAt)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collapse button (desktop) */}
        <div className="hidden md:flex items-center justify-end px-3 pb-3 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={14} />
            Collapse
          </button>
        </div>
      </aside>
    </>
  );
}
