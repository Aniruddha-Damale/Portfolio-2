import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Trash2, X, Zap } from 'lucide-react';
import { apiRequest } from '../lib/api.ts';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const STARTER_PROMPTS = [
  'Summarize key projects',
  'What programming languages and tools are listed?',
  'Tell me about SmartCity 360',
  'How can I get in touch?',
];

export function ChatAssistant({ ownerName }: { ownerName: string }) {
  const [open, setOpen] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Hi! I'm the portfolio assistant for ${ownerName}. Ask me anything about their projects, technical skills, education, or resume.`,
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    setError(null);
    const historyToSend = messages.slice(1);
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    if (!textOverride) setInput('');
    setSending(true);

    try {
      const data = await apiRequest<{ reply: string }>('/api/chat', {
        method: 'POST',
        body: {
          message: text,
          fastMode,
          history: historyToSend,
        },
      });
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch (err: any) {
      setError(err.message || 'Unable to reach the portfolio assistant right now.');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setError(null);
    setMessages([
      {
        role: 'model',
        text: `Hi! I'm the portfolio assistant for ${ownerName}. Ask me anything about their projects, technical skills, education, or resume.`,
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="swiss-pill-btn-solid inline-flex items-center gap-2.5 px-5 py-3 text-xs whitespace-nowrap"
          aria-label="Open portfolio assistant chat"
        >
          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
          <span>Ask Portfolio</span>
        </button>
      ) : (
        <div className="w-[calc(100vw-2.5rem)] sm:w-96 h-[520px] max-h-[80vh] bg-[#f2f2f2] border border-[#1e1e1e] rounded-[2px] flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#1e1e1e]/12 flex items-center justify-between gap-2 bg-white">
            <div className="min-w-0">
              <h3 className="text-sm font-display font-bold uppercase tracking-[-0.02em] text-[#111111] truncate">
                Portfolio Assistant
              </h3>
              <p className="text-xs font-normal text-[#838282] truncate">
                Answers grounded in live portfolio data
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setFastMode((f) => !f)}
                title={fastMode ? 'Fast mode enabled' : 'Standard mode'}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
                  fastMode
                    ? 'bg-[#1e1e1e] text-[#f2f2f2] border-[#1e1e1e]'
                    : 'border-[#1e1e1e]/20 text-[#111111] hover:border-[#1e1e1e]'
                }`}
              >
                <Zap className="w-3 h-3" strokeWidth={1.5} />
                {fastMode ? 'Fast' : 'Std'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Clear conversation"
                className="p-1.5 rounded-full text-[#838282] hover:text-[#111111] transition-colors"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="p-1.5 rounded-full text-[#838282] hover:text-[#111111] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-[2px] px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap text-sm font-normal ${
                    msg.role === 'user'
                      ? 'bg-[#1e1e1e] text-[#f2f2f2]'
                      : 'bg-white border border-[#1e1e1e]/12 text-[#111111]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && !sending && (
              <div className="pt-2 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#838282]">
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void sendMessage(q)}
                      className="text-left text-xs px-3 py-1.5 rounded-full border border-[#1e1e1e]/20 bg-white text-[#111111] hover:bg-[#1e1e1e] hover:text-[#f2f2f2] hover:border-[#1e1e1e] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-[2px] px-3.5 py-2.5 bg-white border border-[#1e1e1e]/12 text-[#838282] text-xs font-mono">
                  Thinking...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-[2px] border border-[#1e1e1e] bg-white px-3 py-2 text-xs text-[#111111]">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="p-3 border-t border-[#1e1e1e]/12 flex items-center gap-2 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skills, projects, or education..."
              className="flex-1 min-w-0 px-3 py-2 text-sm rounded-[2px] border border-[#1e1e1e]/20 bg-[#f2f2f2] text-[#111111] placeholder:text-[#838282] focus:outline-none focus:border-[#1e1e1e] focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label="Send message"
              className="w-9 h-9 rounded-full border border-[#1e1e1e] bg-[#1e1e1e] text-[#f2f2f2] hover:bg-transparent hover:text-[#111111] inline-flex items-center justify-center disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
