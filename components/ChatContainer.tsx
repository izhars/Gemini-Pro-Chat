
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatThread, Message, Role } from '../types';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from './ChatMessage';
import { v4 as uuidv4 } from 'uuid';

interface ChatContainerProps {
  thread: ChatThread;
  onUpdateMessages: (messages: Message[]) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ thread, onUpdateMessages }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [thread.messages, scrollToBottom]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: Role.USER,
      content: inputValue,
      timestamp: Date.now(),
    };

    const newMessages = [...thread.messages, userMessage];
    onUpdateMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    const modelMessageId = uuidv4();
    let modelContent = '';

    try {
      const stream = geminiService.streamChat(newMessages);
      
      for await (const chunk of stream) {
        modelContent += chunk;
        onUpdateMessages([
          ...newMessages,
          {
            id: modelMessageId,
            role: Role.MODEL,
            content: modelContent,
            timestamp: Date.now(),
          }
        ]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      onUpdateMessages([
        ...newMessages,
        {
          id: uuidv4(),
          role: Role.MODEL,
          content: "I'm sorry, I encountered an error. Please check your connection or API key and try again.",
          timestamp: Date.now(),
        }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-slate-950/40 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <div className="md:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">{thread.title}</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Model: 3 Pro Preview</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-10 md:px-12 lg:px-24 xl:px-48"
      >
        {thread.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto py-12">
             <div className="w-20 h-20 mb-8 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">How can I help today?</h3>
            <p className="text-slate-500 text-center mb-10 text-sm max-w-sm">
              I can help with coding, brainstorming, data analysis, or just a quick chat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {[
                { title: "Code", text: "Create a modern React component using Tailwind CSS" },
                { title: "Explain", text: "How do large language models actually work?" },
                { title: "Plan", text: "Draft a 10-day road trip through Scandinavia" },
                { title: "Creative", text: "Write a short cyberpunk story set in a flooded London" }
              ].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setInputValue(suggestion.text);
                    inputRef.current?.focus();
                  }}
                  className="p-4 text-left glass border border-white/5 rounded-2xl hover:border-blue-500/50 hover:bg-white/10 transition-all group"
                >
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{suggestion.title}</div>
                  <p className="text-xs text-slate-400 group-hover:text-slate-200 leading-snug">{suggestion.text}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10">
            {thread.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && !thread.messages.some(m => m.id.length > 0 && m.role === Role.MODEL && m.timestamp >= Date.now() - 3000) && (
              <div className="flex gap-5 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 shrink-0" />
                <div className="flex-1 space-y-3 pt-2">
                  <div className="h-2.5 bg-slate-800 rounded-full w-4/5" />
                  <div className="h-2.5 bg-slate-800 rounded-full w-2/3" />
                  <div className="h-2.5 bg-slate-800 rounded-full w-1/2" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 md:px-12 lg:px-24 xl:px-48 shrink-0 relative z-20">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[24px] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative glass border border-white/10 rounded-[22px] overflow-hidden shadow-2xl">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Gemini..."
              className="w-full bg-transparent text-slate-100 py-4.5 pl-5 pr-14 focus:outline-none transition-all resize-none min-h-[58px] max-h-[200px] leading-relaxed"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <div className="absolute right-3 bottom-2.5">
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  !inputValue.trim() || isLoading 
                    ? 'text-slate-600' 
                    : 'text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto flex justify-between px-2 mt-2">
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">Experimental Interface</p>
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">End-to-End Encrypted</p>
        </div>
      </div>
    </div>
  );
};
