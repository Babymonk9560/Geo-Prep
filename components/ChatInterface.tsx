import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, AppMode } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  currentMode: AppMode;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, currentMode }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const getPlaceholder = () => {
    switch (currentMode) {
      case AppMode.SYLLABUS_DECODER:
        return "Enter a syllabus topic (e.g., 'Geomorphic Cycles')...";
      case AppMode.INTERVIEW_SIMULATOR:
        return "Answer the question or say 'Start Interview'...";
      case AppMode.HARYANA_CONTEXTUALIZER:
        return "Enter a concept to link to Haryana (e.g., 'Green Revolution')...";
      default:
        return "Type a message...";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header for Mobile */}
      <div className="md:hidden p-4 bg-slate-900 text-white flex items-center justify-between">
        <span className="font-serif font-bold">Geo-Mentor</span>
        <span className="text-xs bg-blue-600 px-2 py-1 rounded">
            {currentMode === AppMode.SYLLABUS_DECODER && "Syllabus"}
            {currentMode === AppMode.INTERVIEW_SIMULATOR && "Simulator"}
            {currentMode === AppMode.HARYANA_CONTEXTUALIZER && "Context"}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
            <div className="text-6xl mb-4 grayscale">
              {currentMode === AppMode.SYLLABUS_DECODER && '📚'}
              {currentMode === AppMode.INTERVIEW_SIMULATOR && '🎤'}
              {currentMode === AppMode.HARYANA_CONTEXTUALIZER && '🌾'}
            </div>
            <p className="text-lg font-serif">Select a topic or say "Hello" to begin.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none prose prose-sm md:prose-base max-w-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1 text-blue-800" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLoading}
              className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner text-slate-800 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              AI can make mistakes. Review syllabus & sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;