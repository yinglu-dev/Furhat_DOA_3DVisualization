import { DEFAULT_STYLE } from "../config";
import type { OrbMode, StyleState } from "../types";
import { ColorControl, SliderControl } from "./controls";

interface Props {
  mode: OrbMode;
  styles: StyleState;
  onChange: (styles: StyleState) => void;
}

/**
 * Style controls for the current mode. This is a "controlled" component:
 * it owns no state, it shows `styles` and reports changes through `onChange`.
 */
export function StyleControls({ mode, styles, onChange }: Props) {
  if (mode === "furhat") return null; // Furhat mode has no style options.

  // Update one field of one mode, keeping everything else.
  const set = <M extends keyof StyleState>(m: M, patch: Partial<StyleState[M]>) =>
    onChange({ ...styles, [m]: { ...styles[m], ...patch } });

  const reset = () => onChange({ ...styles, [mode]: DEFAULT_STYLE[mode] });

  return (
    <div className="row">
      <div className="label">Style Controls</div>
      <div className="controls">
        {mode === "faces" && (
          <>
            <ColorControl id="faces-fill-color" label="Fill Color" value={styles.faces.fillColor}
              onChange={(fillColor) => set("faces", { fillColor })} />
            <SliderControl id="faces-fill-opacity" label="Fill Opacity" min={0} max={1}
              value={styles.faces.fillOpacity} onChange={(fillOpacity) => set("faces", { fillOpacity })} />
            <ColorControl id="faces-wire-color" label="Wire Color" value={styles.faces.wireColor}
              onChange={(wireColor) => set("faces", { wireColor })} />
            <SliderControl id="faces-wire-opacity" label="Wire Opacity" min={0} max={1}
              value={styles.faces.wireOpacity} onChange={(wireOpacity) => set("faces", { wireOpacity })} />
            <SliderControl id="faces-explode" label="Explode" min={0} max={0.3}
              value={styles.faces.explodeAmount} onChange={(explodeAmount) => set("faces", { explodeAmount })} />
          </>
        )}

        {mode === "wireframe" && (
          <>
            <ColorControl id="wire-fill-color" label="Fill Color" value={styles.wireframe.fillColor}
              onChange={(fillColor) => set("wireframe", { fillColor })} />
            <SliderControl id="wire-fill-opacity" label="Fill Opacity" min={0} max={1}
              value={styles.wireframe.fillOpacity} onChange={(fillOpacity) => set("wireframe", { fillOpacity })} />
            <ColorControl id="wire-line-color" label="Wire Color" value={styles.wireframe.wireColor}
              onChange={(wireColor) => set("wireframe", { wireColor })} />
            <SliderControl id="wire-line-opacity" label="Wire Opacity" min={0} max={1}
              value={styles.wireframe.wireOpacity} onChange={(wireOpacity) => set("wireframe", { wireOpacity })} />
          </>
        )}

        {mode === "arrow" && (
          <>
            <ColorControl id="arrow-color" label="Arrow Color" value={styles.arrow.arrowColor}
              onChange={(arrowColor) => set("arrow", { arrowColor })} />
            <SliderControl id="arrow-length-scale" label="Length Scale" min={0.5} max={2.5}
              value={styles.arrow.lengthScale} onChange={(lengthScale) => set("arrow", { lengthScale })} />
          </>
        )}

        <div className="button-row">
          <button type="button" className="reset-btn" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
