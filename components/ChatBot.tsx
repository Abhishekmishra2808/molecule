import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Maximize2, Minimize2, ChevronDown, Sparkles } from 'lucide-react';
import { ChatService } from '../services/api';
import { ChatMessage, StructuredResult } from '../types';
import { parse } from 'marked';

interface ChatBotProps {
  context?: StructuredResult | null;
  isDarkMode?: boolean;
}

export const ChatBot: React.FC<ChatBotProps> = ({ context, isDarkMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when context is available
  useEffect(() => {
    if (context) {
      ChatService.initializeChat(context);
      setMessages([
        {
          id: `ctx-${Date.now()}`,
          role: 'model',
          text: "I've analyzed the report. You can ask me about market drivers, competitors, or specific clinical data found.",
          timestamp: new Date()
        }
      ]);
    }
  }, [context]);

  useEffect(() => {
    if (showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowHistory(true); // Auto-open history on interaction

    try {
      const responseText = await ChatService.sendMessage(userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Only render if analysis is complete (context exists)
  if (!context) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div className="w-full max-w-3xl px-4 pb-8 pointer-events-auto flex flex-col items-center">
        
        {/* Chat History Pop-up */}
        {showHistory && (
          <div className={`w-full mb-4 rounded-2xl shadow-2xl border overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 ${isDarkMode ? 'bg-slate-900/95 border-slate-700 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md'}`} style={{ height: '500px', maxHeight: '60vh' }}>
            {/* Header */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/80 border-slate-100'}`}>
              <div className="flex items-center gap-2">
                 <div className="p-1 rounded bg-indigo-500/10">
                    <Bot className="w-4 h-4 text-indigo-500" />
                 </div>
                 <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>MoleculeX Assistant</span>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : `${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'} rounded-bl-sm`
                    }`}
                  >
                    {msg.role === 'model' ? (
                       <div 
                         className={`prose ${isDarkMode ? 'prose-invert' : ''} prose-sm max-w-none 
                           prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-50 
                           [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`}
                         dangerouslySetInnerHTML={{ __html: parse(msg.text) as string }} 
                       />
                    ) : (
                       msg.text
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className={`rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className={`w-full relative rounded-2xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700 shadow-black/50' : 'bg-white border border-slate-200 shadow-slate-200/50'}`}>
           <div className="flex items-center px-2 py-2">
              <div className="pl-3 pr-2">
                 <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={handleKeyPress}
                 placeholder="Ask a follow-up question about the report..."
                 className={`flex-1 bg-transparent border-none outline-none text-sm px-2 py-3 ${isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
              />
              <button 
                 onClick={handleSend}
                 disabled={!input.trim() || isLoading}
                 className={`p-2.5 rounded-xl transition-all ${
                   !input.trim() || isLoading 
                     ? 'text-slate-400 bg-transparent' 
                     : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transform hover:scale-105 active:scale-95'
                 }`}
              >
                 <Send className="w-4 h-4" />
              </button>
           </div>
           
           {/* Helper text if history is hidden and there are messages */}
           {!showHistory && messages.length > 1 && (
             <button 
               onClick={() => setShowHistory(true)}
               className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-medium px-4 py-1.5 rounded-full bg-indigo-600 text-white shadow-lg animate-bounce"
             >
               View {messages.length} messages
             </button>
           )}
        </div>
        
      </div>
    </div>
  );
};