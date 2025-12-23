
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { ChatThread, Message, Role } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Load threads from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gemini_chat_threads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThreads(parsed);
        if (parsed.length > 0) {
          setActiveThreadId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved threads", e);
      }
    }
  }, []);

  // Save threads to local storage
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('gemini_chat_threads', JSON.stringify(threads));
    }
  }, [threads]);

  const activeThread = threads.find(t => t.id === activeThreadId) || null;

  const handleCreateThread = useCallback(() => {
    const newThread: ChatThread = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  }, []);

  const handleDeleteThread = useCallback((id: string) => {
    setThreads(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (activeThreadId === id) {
        setActiveThreadId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [activeThreadId]);

  const handleUpdateThread = useCallback((id: string, messages: Message[]) => {
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        // Derive title from first user message if it's "New Chat"
        let title = t.title;
        if (title === 'New Chat' && messages.length > 0) {
          const firstUserMsg = messages.find(m => m.role === Role.USER);
          if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
          }
        }
        return { ...t, messages, title, updatedAt: Date.now() };
      }
      return t;
    }));
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar 
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onCreateThread={handleCreateThread}
        onDeleteThread={handleDeleteThread}
      />
      <main className="flex-1 flex flex-col relative min-w-0">
        {activeThread ? (
          <ChatContainer 
            thread={activeThread} 
            onUpdateMessages={(msgs) => handleUpdateThread(activeThread.id, msgs)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Gemini Pro</h1>
            <p className="text-slate-400 max-w-md mb-8">
              Start a new conversation to experience the power of the Gemini 3 Pro model.
            </p>
            <button 
              onClick={handleCreateThread}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              Start Chatting
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
