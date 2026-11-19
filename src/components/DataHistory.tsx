import type { DoaSample } from "../hooks/useDoaSocket";

interface Props {
  history: DoaSample[];
}

/** Azimuth angle in degrees in the x/y plane, the same convention the Furhat mode uses. */
function azimuthDeg({ x, y }: { x: number; y: number }): string {
  return `${Math.round((Math.atan2(x, y) * 180) / Math.PI)}°`;
}

/** A small table of the latest DOA samples, newest first. */
export function DataHistory({ history }: Props) {
  return (
    <div className="row">
      <div className="label">Recent Samples</div>
      {history.length === 0 ? (
        <div className="value muted">No samples yet</div>
      ) : (
        <table className="history">
          <thead>
            <tr>
              <th>Time</th>
              <th>Azimuth</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {history.map((s) => (
              // receivedAt + coordinates is unique enough to be a React key here.
              <tr key={`${s.receivedAt}-${s.x}-${s.y}-${s.z}`}>
                <td>{new Date(s.receivedAt).toLocaleTimeString()}</td>
                <td>{azimuthDeg(s)}</td>
                <td>{s.volume !== undefined ? s.volume.toFixed(1) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
