
import React from 'react';
import { ChatThread } from '../types';

interface SidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  threads, 
  activeThreadId, 
  onSelectThread, 
  onCreateThread,
  onDeleteThread
}) => {
  return (
    <aside className="w-80 bg-slate-950/40 border-r border-white/5 flex flex-col h-full hidden md:flex shrink-0 z-20">
      <div className="p-6">
        <button 
          onClick={onCreateThread}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <div className="px-4 mb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Chat History
        </div>
        {threads.map(thread => (
          <div 
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
              activeThreadId === thread.id 
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {activeThreadId === thread.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 shrink-0 ${activeThreadId === thread.id ? 'text-blue-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-sm font-medium truncate flex-1 leading-tight">{thread.title}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteThread(thread.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {threads.length === 0 && (
          <div className="px-4 py-12 text-center text-slate-600 text-sm">
            <div className="mb-2 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            Your history will appear here
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-slate-900/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl border border-white/5 bg-white/5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold shadow-lg ring-1 ring-white/20 text-white">
              AI
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-semibold text-slate-100 truncate">Gemini Pro 3</div>
            <div className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">System Ready</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
