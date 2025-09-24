"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatComponent() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Error sending message." },
      ]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-2 py-4 ">
      <div className="flex flex-col w-full max-w-lg h-[400px] sm:h-[500px] border rounded-lg shadow-lg ">
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "text-blue-600 mb-2 break-words"
                  : m.role === "system"
                  ? "text-red-600 mb-2 break-words"
                  : "text-green-600 mb-2 break-words"
              }
            >
              <b>{m.role}:</b> {m.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex p-1 sm:p-2 border-t bg-white w-full">
          <input
            className="flex-1 border p-2 rounded-l-lg outline-none text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type your message..."
          />
          <button
            className="bg-blue-500 text-white px-3 sm:px-4 rounded-r-lg text-sm"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
