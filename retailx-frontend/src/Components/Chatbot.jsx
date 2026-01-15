import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Welcome to RetailX! 😊 I’m here to help you discover products, styles, and smart deals. What can I help you with today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Best practice: Use localhost for frontend fetch
      const res = await fetch('http://localhost:5000/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Server connect nahi ho raha!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 h-[450px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          
          <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
            <Bot size={24} />
            <div>
              <p className="font-bold text-sm">RetailX Assistant</p>
              <p className="text-xs opacity-80">Online | AI Powered</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}>
                  {/* Updated Markdown Rendering Logic to avoid Typography Plugin errors */}
                  {msg.role === 'bot' ? (
                    <div className="markdown-container text-sm leading-relaxed space-y-2">
                      <ReactMarkdown 
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                          li: ({children}) => <li className="mb-1">{children}</li>,
                          strong: ({children}) => <strong className="font-bold text-blue-900">{children}</strong>,
                          a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">{children}</a>
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-gray-400 italic flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                RetailX typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about products..."
              className="flex-1 p-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;