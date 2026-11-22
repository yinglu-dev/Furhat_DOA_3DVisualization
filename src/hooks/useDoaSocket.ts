import { useEffect, useRef, useState } from "react";
import { parseDoaMessage } from "../config";
import type { ConnectionState, DoaData } from "../types";

const RECONNECT_DELAY_MS = 2000;
const HISTORY_SIZE = 8;

export interface DoaSample extends DoaData {
  /** Time the message was received (ms since epoch). */
  receivedAt: number;
}

/**
 * Custom React hook: connects to the DOA WebSocket and reconnects when it drops.
 *
 * - `onData` is called for every valid message. It feeds the 3D scene directly,
 *   so the animation does not wait for React to re-render.
 * - The returned state (status, latest, history) is what the UI components display.
 */
export function useDoaSocket(url: string, onData: (data: DoaData) => void) {
  const [status, setStatus] = useState<ConnectionState>("connecting");
  const [history, setHistory] = useState<DoaSample[]>([]);
  const [messageCount, setMessageCount] = useState(0);

  // Keep the newest callback in a ref so changing it does not reconnect the socket.
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryTimer: number | undefined;
    let stopped = false;

    const connect = () => {
      setStatus("connecting");
      ws = new WebSocket(url);

      ws.onopen = () => setStatus("open");
      ws.onerror = () => setStatus("error");
      ws.onclose = () => {
        if (stopped) return;
        setStatus("closed");
        retryTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
      };
      ws.onmessage = (event) => {
        const data = parseDoaMessage(String(event.data));
        if (!data) return;
        onDataRef.current(data);
        setMessageCount((n) => n + 1);
        setHistory((prev) => [{ ...data, receivedAt: Date.now() }, ...prev].slice(0, HISTORY_SIZE));
      };
    };

    connect();

    // Cleanup runs when the component unmounts or `url` changes.
    return () => {
      stopped = true;
      window.clearTimeout(retryTimer);
      ws?.close();
    };
  }, [url]);

  return { status, latest: history[0] ?? null, history, messageCount };
}
