'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, Sparkles, User, Bot, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function AIAssistantPanel() {
  const { chatMessages, sendChatMessage, isAITyping, setFilter, selectHotspot, hotspots, openDrawer } = useIntelligence();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAITyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  const handleActionClick = (actionKey: string) => {
    if (actionKey === 'QUERY_ABNORMAL') {
      sendChatMessage('Which industrial facilities have abnormal thermal activity?');
    } else if (actionKey === 'FILTER_FIRES') {
      setFilter('industrial_fires');
    } else if (actionKey === 'FILTER_PERSISTENT') {
      setFilter('persistent_sources');
    } else if (actionKey === 'FILTER_CRITICAL') {
      setFilter('critical');
    } else if (actionKey === 'SELECT_DAHEJ') {
      const dahej = hotspots.find((h) => h.id === 'FLX-DHJ-001' || h.name.includes('Dahej') || h.name.includes('ONGC'));
      if (dahej) selectHotspot(dahej, true);
    } else if (actionKey === 'OPEN_ANALYTICS') {
      openDrawer('analytics');
    }
  };

  const quickPrompts = [
    'Which industrial facilities have abnormal thermal activity?',
    'Summarize industrial fires vs normal flares',
    'Explain the Dahej SEZ anomaly diagnosis',
    'How does the FLAREX intelligence pipeline work?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      {/* Header Info */}
      <div className="p-3.5 bg-gradient-to-r from-orange-950/40 via-slate-900/40 to-slate-950/40 border border-orange-500/20 rounded-xl mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Cpu size={16} />
          </div>
          <div>
            <h4 className="text-[12.5px] font-bold text-white leading-tight">
              FLAREX Grounded Intelligence Copilot
            </h4>
            <span className="text-[10px] text-cyan-300 font-mono flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Direct SQLite &amp; Satellite Telemetry Connected
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[9.5px] font-bold font-mono">
          v1.2-NRT
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => sendChatMessage(prompt)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] text-slate-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Sparkles size={11} className="text-cyan-400 shrink-0" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[300px]">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                  <Bot size={13} />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl max-w-[85%] text-[11.5px] leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-sm shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                    : 'glass-card text-slate-200 rounded-tl-sm border-white/[0.08]'
                }`}
              >
                <div className="whitespace-pre-line prose-invert">{msg.text}</div>

                {/* Suggested Action Pills */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/[0.08]">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleActionClick(action.actionKey)}
                        className="py-1 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>{action.label}</span>
                        <ChevronRight size={11} />
                      </button>
                    ))}
                  </div>
                )}

                <span className="block text-[8.5px] text-slate-400 text-right mt-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User size={13} />
                </div>
              )}
            </div>
          );
        })}

        {isAITyping && (
          <div className="flex gap-2.5 items-center text-slate-400 text-[11px]">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot size={13} />
            </div>
            <div className="glass-card px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.3s]" />
              <span className="text-[10.5px] text-slate-400 ml-1">Analyzing database telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Box */}
      <form onSubmit={handleSend} className="relative mt-auto">
        <input
          type="text"
          placeholder="Ask FlameX AI (e.g. Which facilities are abnormal?)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full pl-3 pr-10 py-2.5 rounded-xl text-[11.5px] text-white bg-[rgba(255,90,45,0.04)] border border-[rgba(255,106,61,0.25)] focus:border-cyan-400 focus:outline-none placeholder-slate-500 transition-colors shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_8px_rgba(56,189,248,0.4)] transition-all"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}

export { AIAssistantPanel };
