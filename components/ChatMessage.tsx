
import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Simple formatter for basic markdown patterns
  const formatContent = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Inline Code: `code`
      let parts = line.split(/(`[^`]+`)/g).map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[0.9em] text-blue-300">{part.slice(1, -1)}</code>;
        }
        
        // Bold: **text**
        let boldParts = part.split(/(\*\*[^*]+\*\*)/g).map((bPart, bi) => {
          if (bPart.startsWith('**') && bPart.endsWith('**')) {
            return <strong key={bi} className="font-bold text-white">{bPart.slice(2, -2)}</strong>;
          }
          
          // Italic: *text*
          let italicParts = bPart.split(/(\*[^*]+\*)/g).map((iPart, ii) => {
            if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
              return <em key={ii} className="italic text-slate-300">{iPart.slice(1, -1)}</em>;
            }
            return iPart;
          });
          return italicParts;
        });
        return boldParts;
      });

      return (
        <p key={lineIdx} className="mb-4 last:mb-0 leading-relaxed break-words whitespace-pre-wrap">
          {parts}
        </p>
      );
    });
  };

  return (
    <div className={`flex gap-5 md:gap-7 message-transition ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border ${
        isUser 
          ? 'bg-slate-900 border-white/5 text-slate-400' 
          : 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-white/10 text-white'
      }`}>
        {isUser ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </div>
      
      <div className={`flex-1 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1`}>
          {isUser ? 'You' : 'Gemini'}
        </div>
        <div className={`w-full text-sm md:text-base leading-relaxed ${
          isUser ? 'text-slate-200 text-right' : 'text-slate-300'
        }`}>
          <div className="max-w-none">
            {formatContent(message.content)}
          </div>
        </div>
        <div className="mt-3 text-[10px] text-slate-600 font-medium tracking-tight">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
