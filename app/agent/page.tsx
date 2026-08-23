"use client";

import { useState } from "react";

type Msg = { role: string; content: string };

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply || "(no reply)" }]);
        setHistory(data.history || []);
      }
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h1>Imvecto Impact Agent</h1>
      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, minHeight: 300, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{m.role === "user" ? "You" : "Agent"}:</strong> {m.content}
          </div>
        ))}
        {loading && <div>Agent is thinking...</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about a project..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  );
}
