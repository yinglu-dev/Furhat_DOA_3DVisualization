import type { ConnectionState } from "../types";

const STATUS_TEXT: Record<ConnectionState, string> = {
  connecting: "Connecting...",
  open: "Connected",
  closed: "Disconnected (retrying in 2s)",
  error: "Connection error",
};

interface Props {
  url: string;
  status: ConnectionState;
  messageCount: number;
}

/** Shows the WebSocket address, a coloured status dot and how many messages arrived. */
export function ConnectionStatus({ url, status, messageCount }: Props) {
  return (
    <>
      <div className="row">
        <div className="label">WebSocket</div>
        <div className="value">{url}</div>
      </div>
      <div className="row">
        <div className="label">Connection Status</div>
        <div className="value status" data-state={status}>
          <span className="status-dot" aria-hidden="true" />
          {STATUS_TEXT[status]}
        </div>
      </div>
      <div className="row">
        <div className="label">Messages Received</div>
        <div className="value">{messageCount}</div>
      </div>
    </>
  );
}
