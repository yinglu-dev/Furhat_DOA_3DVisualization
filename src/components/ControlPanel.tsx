import type { ReactNode } from "react";

/** The left-hand panel: logo header plus whatever children App puts inside. */
export function ControlPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="status-panel">
      <div className="brand-row">
        <img className="brand-mark" src="/furhat-logo.svg" alt="Furhat Robotics" />
        <span className="brand-chip">DOA Monitor</span>
      </div>
      {children}
    </aside>
  );
}
