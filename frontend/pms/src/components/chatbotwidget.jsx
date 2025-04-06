// src/components/ChatbotWidget.jsx
import { useState } from "react";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const res = await fetch("http://localhost:8000/api/chatbot/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    const botMsg = { text: data.reply, sender: "bot" };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {isOpen && (
          <div className="w-72 h-96 bg-white shadow-xl border rounded-lg flex flex-col overflow-hidden">
            <div className="bg-blue-600 text-white text-center py-2 font-bold">
              AI Assistant
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`text-sm p-2 rounded ${
                    msg.sender === "user"
                      ? "bg-blue-100 text-right ml-auto"
                      : "bg-gray-200 text-left mr-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="flex border-t p-2">
              <input
                className="flex-1 border rounded px-2 text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        )}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          💬
        </button>
      </div>
    </div>
  );
}
