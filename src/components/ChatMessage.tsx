import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeMathjax from 'rehype-mathjax';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, ChevronDown, ChevronRight, Brain, User, Bot } from 'lucide-react';
import type { Message } from '../types';
import 'highlight.js/styles/github-dark.css';

interface Props {
  message: Message;
  aiName: string;
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const lang = className?.replace('language-', '') || 'code';
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = () => {
    const text = codeRef.current?.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded-md hover:bg-slate-700/50"
        >
          {copied ? (
            <>
              <Check size={12} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto bg-slate-900/80 p-4 m-0">
        <code ref={codeRef} className={className}>
          {children}
        </code>
      </pre>
    </div>
  );
}

function ThinkingSection({
  thinking,
  defaultOpen = false,
}: {
  thinking: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-3 rounded-xl border border-violet-500/20 bg-violet-950/20 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-violet-300 hover:bg-violet-950/30 transition-colors"
      >
        <Brain size={14} className="shrink-0 text-violet-400" />
        <span className="font-medium">Thinking process</span>
        <span className="ml-auto">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      <div
        className={`thinking-collapse ${open ? 'thinking-collapse-open' : ''}`}
      >
        <div className="px-4 pb-4 pt-1 border-t border-violet-500/20">
          <div className="text-sm text-slate-400 break-words leading-relaxed prose prose-invert prose-sm max-w-none thinking-prose">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeMathjax, rehypeHighlight]}
            >
              {thinking}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatMessage({ message, aiName }: Props) {
  const isUser = message.role === 'user';

  const markdownComponents = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ inline, className, children, ...props }: any) {
      if (inline) {
        return (
          <code
            className="bg-slate-800 text-violet-300 px-1.5 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }
      return <CodeBlock className={className}>{children}</CodeBlock>;
    },
    p({ children }: { children?: React.ReactNode }) {
      return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
    },
    ul({ children }: { children?: React.ReactNode }) {
      return <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>;
    },
    ol({ children }: { children?: React.ReactNode }) {
      return <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>;
    },
    li({ children }: { children?: React.ReactNode }) {
      return <li className="leading-relaxed">{children}</li>;
    },
    h1({ children }: { children?: React.ReactNode }) {
      return <h1 className="text-2xl font-bold mb-3 mt-4 text-slate-100">{children}</h1>;
    },
    h2({ children }: { children?: React.ReactNode }) {
      return <h2 className="text-xl font-bold mb-2 mt-4 text-slate-100">{children}</h2>;
    },
    h3({ children }: { children?: React.ReactNode }) {
      return <h3 className="text-lg font-semibold mb-2 mt-3 text-slate-200">{children}</h3>;
    },
    blockquote({ children }: { children?: React.ReactNode }) {
      return (
        <blockquote className="border-l-4 border-violet-500 pl-4 my-3 italic text-slate-400">
          {children}
        </blockquote>
      );
    },
    a({ href, children }: { href?: string; children?: React.ReactNode }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300 underline"
        >
          {children}
        </a>
      );
    },
    table({ children }: { children?: React.ReactNode }) {
      return (
        <div className="max-w-full overflow-x-auto my-3 -mx-4 px-4 md:mx-0 md:px-0">
          <table className="min-w-full table-auto border-collapse border border-slate-700 rounded-lg overflow-hidden">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }: { children?: React.ReactNode }) {
      return <thead className="bg-slate-800">{children}</thead>;
    },
    th({ children }: { children?: React.ReactNode }) {
      return <th className="px-3 py-2 align-top text-left text-slate-300 font-semibold border border-slate-700 whitespace-normal break-words max-w-[200px]">{children}</th>;
    },
    td({ children }: { children?: React.ReactNode }) {
      return <td className="px-3 py-2 align-top text-slate-300 border border-slate-800 whitespace-normal break-words max-w-[200px]">{children}</td>;
    },
    hr() {
      return <hr className="border-slate-700 my-4" />;
    },
    strong({ children }: { children?: React.ReactNode }) {
      return <strong className="text-slate-100 font-semibold">{children}</strong>;
    },
  };

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-violet-500 to-cyan-500'
            : 'bg-gradient-to-br from-slate-700 to-slate-600 border border-slate-600'
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Content */}
      <div className={`min-w-0 max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <span className="text-xs text-slate-500 px-1">
          {isUser ? 'You' : aiName}
        </span>

        {/* Image previews */}
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`upload-${i}`}
                className="max-h-48 max-w-xs rounded-lg border border-slate-700 object-cover"
              />
            ))}
          </div>
        )}

        {/* Thinking section */}
        {message.thinking && <ThinkingSection thinking={message.thinking} />}

        {/* Message bubble */}
        {message.content && (
          <div
            className={`overflow-hidden rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg min-w-0 ${
              isUser
                ? 'bg-gradient-to-br from-violet-600 to-cyan-600 text-white rounded-tr-sm'
                : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none break-words overflow-x-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeMathjax, rehypeHighlight]}
                  components={markdownComponents}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator({ aiName }: { aiName: string }) {
  return (
    <div className="flex gap-3 mb-6">
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600 border border-slate-600 shadow-lg">
        <Bot size={14} className="text-white" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 px-1">{aiName}</span>
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex gap-1.5 items-center h-4">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StreamingMessage({
  content,
  thinking,
  aiName,
}: {
  content: string;
  thinking: string;
  aiName: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [content, thinking]);

  const markdownComponents = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ inline, className, children, ...props }: any) {
      if (inline) {
        return (
          <code className="bg-slate-800 text-violet-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
            {children}
          </code>
        );
      }
      return <CodeBlock className={className}>{children}</CodeBlock>;
    },
    p({ children }: { children?: React.ReactNode }) {
      return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
    },
    ul({ children }: { children?: React.ReactNode }) {
      return <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>;
    },
    ol({ children }: { children?: React.ReactNode }) {
      return <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>;
    },
    li({ children }: { children?: React.ReactNode }) {
      return <li className="leading-relaxed">{children}</li>;
    },
    h1({ children }: { children?: React.ReactNode }) {
      return <h1 className="text-2xl font-bold mb-3 mt-4 text-slate-100">{children}</h1>;
    },
    h2({ children }: { children?: React.ReactNode }) {
      return <h2 className="text-xl font-bold mb-2 mt-4 text-slate-100">{children}</h2>;
    },
    h3({ children }: { children?: React.ReactNode }) {
      return <h3 className="text-lg font-semibold mb-2 mt-3 text-slate-200">{children}</h3>;
    },
    blockquote({ children }: { children?: React.ReactNode }) {
      return (
        <blockquote className="border-l-4 border-violet-500 pl-4 my-3 italic text-slate-400">
          {children}
        </blockquote>
      );
    },
    a({ href, children }: { href?: string; children?: React.ReactNode }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
          {children}
        </a>
      );
    },
    table({ children }: { children?: React.ReactNode }) {
      return (
        <div className="max-w-full overflow-x-auto my-3 -mx-4 px-4 md:mx-0 md:px-0">
          <table className="min-w-full table-auto border-collapse border border-slate-700 rounded-lg overflow-hidden">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }: { children?: React.ReactNode }) {
      return <thead className="bg-slate-800">{children}</thead>;
    },
    th({ children }: { children?: React.ReactNode }) {
      return <th className="px-3 py-2 align-top text-left text-slate-300 font-semibold border border-slate-700 whitespace-normal break-words max-w-[200px]">{children}</th>;
    },
    td({ children }: { children?: React.ReactNode }) {
      return <td className="px-3 py-2 align-top text-slate-300 border border-slate-800 whitespace-normal break-words max-w-[200px]">{children}</td>;
    },
    strong({ children }: { children?: React.ReactNode }) {
      return <strong className="text-slate-100 font-semibold">{children}</strong>;
    },
  };

  return (
    <div className="flex gap-3 mb-6">
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600 border border-slate-600 shadow-lg">
        <Bot size={14} className="text-white" />
      </div>
      <div className="min-w-0 max-w-[85%] md:max-w-[75%] flex flex-col gap-1">
        <span className="text-xs text-slate-500 px-1">{aiName}</span>
        {thinking && <ThinkingSection thinking={thinking} defaultOpen />}
        {content && (
          <div className="overflow-hidden bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-lg min-w-0">
            <div className="prose prose-invert prose-sm max-w-none break-words overflow-x-auto">
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeMathjax, rehypeHighlight]}
                components={markdownComponents}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
        {!content && !thinking && (
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1.5 items-center h-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
