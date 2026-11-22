import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_STYLE, getInitialMode, getWebSocketUrl } from "./config";
import { useDoaSocket } from "./hooks/useDoaSocket";
import { ControlPanel } from "./components/ControlPanel";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { LatestData } from "./components/LatestData";
import { DataHistory } from "./components/DataHistory";
import { ModeSwitch } from "./components/ModeSwitch";
import { StyleControls } from "./components/StyleControls";
import { VisualizerStage, type VisualizerHandle } from "./components/VisualizerStage";
import type { DoaData, OrbMode, StyleState } from "./types";

const WS_URL = getWebSocketUrl();

/**
 * Top-level component. It owns the shared state (mode + styles) and passes it
 * down to the panel components and the 3D stage as props.
 */
export default function App() {
  const [mode, setMode] = useState<OrbMode>(getInitialMode);
  const [styles, setStyles] = useState<StyleState>(DEFAULT_STYLE);
  const stageRef = useRef<VisualizerHandle>(null);

  // Every DOA message goes straight to the 3D scene.
  const handleData = useCallback((data: DoaData) => stageRef.current?.pushData(data), []);
  const { status, latest, history, messageCount } = useDoaSocket(WS_URL, handleData);

  // Keep ?orbStyle= in the URL in sync, so a link still opens the same mode.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("orbStyle", mode);
    window.history.replaceState(null, "", url);
  }, [mode]);

  return (
    <div className="app-shell">
      <ControlPanel>
        <ConnectionStatus url={WS_URL} status={status} messageCount={messageCount} />
        <LatestData latest={latest} />
        <ModeSwitch mode={mode} onChange={setMode} />
        <StyleControls mode={mode} styles={styles} onChange={setStyles} />
        <DataHistory history={history} />
      </ControlPanel>
      <VisualizerStage ref={stageRef} mode={mode} styles={styles} />
    </div>
  );
}
