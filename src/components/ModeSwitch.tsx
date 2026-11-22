import { MODE_LABELS } from "../config";
import { ORB_MODES, type OrbMode } from "../types";

interface Props {
  mode: OrbMode;
  onChange: (mode: OrbMode) => void;
}

/** Four buttons to choose the visualization mode. */
export function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div className="row">
      <div className="label">Orb Mode</div>
      <div className="mode-switch">
        {ORB_MODES.map((m) => (
          <button
            key={m}
            type="button"
            className="mode-btn"
            data-active={m === mode}
            aria-pressed={m === mode}
            onClick={() => onChange(m)}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
