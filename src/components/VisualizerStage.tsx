import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { MODE_LABELS } from "../config";
import { RENDERERS } from "../three/renderers";
import type { DoaData, OrbMode, OrbRenderer, StyleState } from "../types";

interface Props {
  mode: OrbMode;
  styles: StyleState;
}

/** What App can call on the stage through a ref. */
export interface VisualizerHandle {
  pushData(data: DoaData): void;
}

/**
 * The bridge between React and Three.js.
 *
 * React renders an empty <div>, and Three.js draws into it. useEffect creates the
 * scene for the current mode and destroys it again when the mode changes, so
 * switching modes no longer needs a page reload.
 */
export const VisualizerStage = forwardRef<VisualizerHandle, Props>(function VisualizerStage(
  { mode, styles },
  ref
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<OrbRenderer | null>(null);
  const stylesRef = useRef(styles);
  stylesRef.current = styles;

  // 1. Build the Three.js scene when the mode changes; clean it up afterwards.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const renderer = RENDERERS[mode](mount);
    if (mode !== "furhat") renderer.setStyle(stylesRef.current[mode]);
    rendererRef.current = renderer;
    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [mode]);

  // 2. Push style changes from the control panel into the scene.
  useEffect(() => {
    if (mode !== "furhat") rendererRef.current?.setStyle(styles[mode]);
  }, [mode, styles]);

  // 3. Let App send DOA data straight to the scene, without a React re-render.
  useImperativeHandle(ref, () => ({
    pushData: (data) => rendererRef.current?.update(data),
  }));

  return (
    <section className="stage-shell">
      <div className="stage-header">
        <span className="stage-pill">Furhat DOA Visualizer</span>
        <span className="stage-pill">{MODE_LABELS[mode]}</span>
      </div>
      <div className="viz-root" ref={mountRef} />
    </section>
  );
});
