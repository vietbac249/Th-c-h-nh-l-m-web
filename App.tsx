
import React, { useState, useEffect, useRef } from 'react';
import { PHP_FILES } from './data/phpFiles';
import { PHPFile, ChatMessage } from './types';
import { getGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  // Tìm file README.md để hiển thị đầu tiên
  const readmeFile = PHP_FILES.find(f => f.name === 'README.md') || PHP_FILES[0];
  const [selectedFile, setSelectedFile] = useState<PHPFile>(readmeFile);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const response = await getGeminiResponse(input, PHP_FILES);
    const aiMessage: ChatMessage = { role: 'assistant', content: response };
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedFile.content);
    alert('Đã sao chép mã nguồn vào bộ nhớ tạm!');
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 overflow-hidden">
      {/* Sidebar - File Explorer */}
      <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-code text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-sm uppercase tracking-tight">PHP Architect</h1>
            <p className="text-[10px] text-blue-400 font-mono">DEBUG_MODE_ACTIVE</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Cấu trúc dự án
          </div>
          {PHP_FILES.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left px-6 py-2 flex items-center gap-3 transition-colors ${
                selectedFile.path === file.path 
                ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' 
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <i className={`fa-solid ${
                file.name === 'README.md' ? 'fa-circle-info text-yellow-500' :
                file.name === 'check.php' ? 'fa-stethoscope text-green-500' :
                file.language === 'php' ? 'fa-file-code text-indigo-400' :
                file.language === 'sql' ? 'fa-database text-yellow-400' :
                file.language === 'markdown' ? 'fa-file-lines text-blue-400' :
                'fa-file text-gray-500'
              } text-sm`}></i>
              <span className="text-sm truncate">{file.name}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4 bg-gray-800/30 text-xs text-gray-500 border-t border-gray-800">
           <div className="flex items-center gap-2 mb-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <span>Server Ready</span>
           </div>
           <p>PHP 8.x + MVC + Security</p>
        </div>
      </div>

      {/* Main Area - Code Viewer */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
             <div className="flex items-center text-sm text-gray-400 gap-2">
                <i className="fa-solid fa-folder-open"></i>
                <span>root / {selectedFile.path}</span>
             </div>
          </div>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95"
          >
            <i className="fa-regular fa-copy"></i>
            Copy Mã Nguồn
          </button>
        </header>

        <main className="flex-1 overflow-auto p-0 flex">
          <div className="flex-1 relative overflow-auto h-full bg-[#0d1117]">
            <pre className="p-8 text-sm code-font leading-relaxed">
              <code className={selectedFile.language === 'markdown' ? 'text-gray-300' : 'text-blue-300'}>
                {selectedFile.content}
              </code>
            </pre>
          </div>

          {/* Chat Panel */}
          <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl shrink-0">
            <div className="p-4 border-b border-gray-800 bg-gray-800/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-headset text-blue-400"></i>
                <h2 className="text-sm font-semibold text-gray-200">Hỗ trợ kỹ thuật</h2>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full uppercase font-bold">Online</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-10 px-6">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-bug-slash text-2xl text-blue-500"></i>
                  </div>
                  <h3 className="text-sm font-medium text-gray-200 mb-2">Bạn đang gặp lỗi gì?</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Hãy mô tả lỗi bạn gặp (ví dụ: "Lỗi 500", "Trang trắng") để tôi hướng dẫn bạn sửa ngay lập tức.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-400 rounded-2xl px-4 py-2 text-sm italic flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Chat với Architect..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all active:scale-90 disabled:opacity-30"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
