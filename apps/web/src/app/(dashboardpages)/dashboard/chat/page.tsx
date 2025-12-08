"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100/api";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8100";

function getToken(): string | null {
  try {
    if (typeof document === "undefined") return null;
    const m = document.cookie.match(/(?:^|; )accessToken=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

type Message = {
  _id: string;
  sender: { _id: string } | string;
  receiver: { _id: string } | string;
  content: string;
  createdAt: string;
  isRead?: boolean;
};

export default function ChatPage() {
  const token = useMemo(() => getToken(), []);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const [supportId, setSupportId] = useState<string | null>(null); // assigned employee id (per-user or default)
  const [supportName, setSupportName] = useState<string | null>(null); // optional
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [meId, setMeId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // connect socket
  useEffect(() => {
    if (!token) return;
    const s = io(WS_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      // request server to emit "me" if implemented, otherwise parse token below
      s.emit("whoami", null, (res: any) => {
        if (res?.userId) setMeId(String(res.userId));
      });
    });
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", (e) => {
      console.warn("socket connect_error", e);
      setConnected(false);
    });

    s.on("newMessage", (m: Message) => {
      // Append message if it's for this conversation (sender/receiver matches)
      const otherId =
        (m.sender as any)._id === meId
          ? (m.receiver as any)._id
          : (m.sender as any)._id;
      if (!supportId || otherId !== supportId) {
        // If it's not for current conversation ignore (or refresh)
        return;
      }
      setMessages((p) => [...p, m]);
    });

    s.on("messageRead", ({ messageId }: any) => {
      setMessages((p) =>
        p.map((m) => (m._id === messageId ? { ...m, isRead: true } : m))
      );
    });

    return () => {
      try {
        s.off();
        s.disconnect();
      } catch {}
      setSocket(null);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, meId]);

  // derive meId from token if server doesn't provide it
  useEffect(() => {
    if (!token) return;
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const id = payload.userId ?? payload.sub ?? payload.id;
        if (id) setMeId(String(id));
      }
    } catch {}
  }, [token]);

  // fetch assigned employee for this user (per-user or default fallback on server)
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/assignment`, {
          credentials: "include",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const j = await res.json().catch(() => ({}));
        const empId = j?.assignedEmployeeId ?? null;
        setSupportId(empId);

        // Optional: fetch employee name if you have user API
        if (empId) {
          try {
            const r2 = await fetch(`${API_BASE}/users/${empId}`, {
              credentials: "include",
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            });
            if (r2.ok) {
              const j2 = await r2.json();
              setSupportName(j2?.data?.name ?? empId);
            } else {
              setSupportName(empId);
            }
          } catch {
            setSupportName(empId);
          }
        }
      } catch (err) {
        console.error("assignment fetch failed", err);
      }
    })();
  }, [token]);

  // load past messages with support (if assigned)
  useEffect(() => {
    if (!token || !supportId) return;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/chat/messages?with=${supportId}&limit=200`,
          {
            credentials: "include",
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );
        const j = await res.json().catch(() => ({}));
        if (res.ok && j?.success)
          setMessages(Array.isArray(j.data) ? j.data : []);
      } catch (err) {
        console.error("load messages error", err);
      }
    })();
  }, [token, supportId]);

  // scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setTimeout(() => (el.scrollTop = el.scrollHeight), 50);
  }, [messages]);

  function send() {
    if (!socket || !connected) {
      alert("Not connected to server");
      return;
    }
    if (!text.trim()) return;
    // For user, do NOT include receiverId — server will resolve assigned employee (per-user or default)
    socket.emit("sendMessage", { content: text }, (res: any) => {
      if (res?.error) {
        console.error("sendMessage error", res);
        alert(res.error || "Failed to send");
        return;
      }
      // server returns message (if controller does). Append if belongs to current support
      if (res?.message) {
        const m = res.message as Message;
        const otherId =
          (m.sender as any)._id === meId
            ? (m.receiver as any)._id
            : (m.sender as any)._id;
        if (otherId === supportId) setMessages((p) => [...p, m]);
      }
    });
    setText("");
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="p-3 border-b flex items-center justify-between">
        <div>
          <div className="font-semibold">Support Chat</div>
          <div className="text-xs text-gray-600">
            {supportName
              ? `Chatting with ${supportName}`
              : "Support not assigned"}
          </div>
        </div>
        <div className="text-sm">
          {connected ? (
            <span className="text-green-600">Connected</span>
          ) : (
            <span className="text-red-600">Disconnected</span>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 bg-white" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-sm text-gray-500">
            No messages yet. Say hi 👋
          </div>
        ) : null}
        <div className="space-y-3">
          {messages.map((m) => {
            const senderId =
              typeof m.sender === "string" ? m.sender : (m.sender as any)._id;
            const mine = String(senderId) === String(meId);
            return (
              <div
                key={m._id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded ${
                    mine ? "bg-blue-600 text-white" : "bg-gray-100 text-black"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <div className="text-xs opacity-70 mt-1 text-right">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="p-3 border-t">
        <div className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded"
            placeholder={
              supportId ? "Type a message..." : "No support assigned"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!supportId || !connected}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={send}
            disabled={!text.trim() || !supportId || !connected}
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
