// src/components/ChatbotWidget.jsx
import { useState, useEffect, useRef } from "react";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    // Load saved messages from localStorage if available
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user", timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/chatbot/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();
      const botMsg = { text: data.reply, sender: "bot", timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to get response. Please try again.");
      setMessages((prev) => [...prev, { 
        text: "Sorry, I couldn't process your request. Please try again later.", 
        sender: "bot",
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      setMessages([]);
      localStorage.removeItem("chatMessages");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {isOpen && (
          <div className="w-80 h-96 bg-white shadow-xl border rounded-lg flex flex-col overflow-hidden">
            <div className="bg-blue-600 text-white py-2 px-3 font-bold flex justify-between items-center">
              <span>AI Assistant</span>
              <div className="flex space-x-2">
                <button 
                  onClick={clearConversation}
                  className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
                  title="Clear conversation"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-blue-700 rounded px-1"
                  title="Close chatbot"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-4">
                  <p>👋 Hi there! How can I help you today?</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[85%] text-sm p-2.5 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-blue-100 text-right ml-auto rounded-br-none"
                        : msg.isError 
                          ? "bg-red-100 text-left mr-auto rounded-bl-none" 
                          : "bg-gray-200 text-left mr-auto rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                    <div className="text-xs opacity-50 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="bg-gray-200 text-left mr-auto rounded p-3 max-w-[85%]">
                  <div className="flex space-x-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="flex border-t p-2 bg-white">
              <input
                className="flex-1 border rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                disabled={isLoading}
              />
              <button
                className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r text-sm flex items-center justify-center ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleSend}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        )}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center w-12 h-12"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open chat"
        >
          {isOpen ? "✕" : "💬"}
          {!isOpen && messages.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center text-white">
              {messages.filter(m => m.sender === "bot" && !m.read).length || ""}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}