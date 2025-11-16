"use client";
import { useState, useEffect, useRef } from "react";

type Message = {
  sender: string;
  content: string;
};

export default function ChatPage() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
    // 1. Lấy URL API từ biến môi trường (mà bạn đã setup trên Vercel)
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    // 2. Chuyển đổi URL HTTPS thành URL WSS (WebSocket Secure)
    // Ví dụ: https://teste5-rero.onrender.com/ -> wss://teste5-rero.onrender.com/ws
    let wsUrl = '';
    if (API_URL) {
      const url = new URL(API_URL);
      // Sử dụng wss: nếu URL gốc là https: (bắt buộc khi deploy)
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${wsProtocol}//${url.host}/ws`; // Thêm endpoint /ws của Go Backend
    } else {
        // Fallback cho môi trường Dev (hoặc nếu chưa set biến)
        wsUrl = "ws://localhost:8080/ws";
    }

    if (!wsUrl) return; // Không kết nối nếu URL bị trống

    const socket = new WebSocket(wsUrl);
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };
    setWs(socket);

    // Dọn dẹp kết nối khi component unmount
    return () => socket.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (ws && input.trim() && name.trim()) {
      const msg = { sender: name, content: input };
      ws.send(JSON.stringify(msg));
      setInput("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <header className="bg-blue-600 text-white text-xl font-bold p-4 text-center shadow">
        💬Chat-community
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === name ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-2xl ${
                msg.sender === name
                  ? "bg-blue-100 text-gray-900"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="font-semibold text-sm">{msg.sender}</p>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-gray-50 border-t flex gap-2">
        <input
          type="text"
          placeholder="Tên của bạn..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-1/4"
        />
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border border-gray-300 rounded-lg p-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Gửi
        </button>
      </footer>
    </div>
  );
}
