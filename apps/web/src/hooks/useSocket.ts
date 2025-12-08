"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket(
  url: string | undefined,
  token: string | null,
  handlers?: (s: Socket) => void
) {
  const ref = useRef<Socket | null>(null);

  useEffect(() => {
    if (!url || !token) return;
    const s = io(url, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    ref.current = s;

    s.on("connect_error", (e) => console.warn("socket connect_error", e));
    s.on("connect", () => console.log("socket connected", s.id));

    if (handlers) handlers(s);

    return () => {
      try {
        s.off();
        s.disconnect();
      } catch {}
      ref.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, token]);

  return ref;
}
