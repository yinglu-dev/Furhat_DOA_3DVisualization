import type { DoaData } from "../types";

interface Props {
  latest: DoaData | null;
}

/** The most recent DOA payload as formatted JSON. */
export function LatestData({ latest }: Props) {
  // Drop the receivedAt field we added, so this shows exactly what the server sent.
  const payload = latest && {
    x: latest.x,
    y: latest.y,
    z: latest.z,
    ...(latest.volume !== undefined && { volume: latest.volume }),
  };
  return (
    <div className="row">
      <div className="label">Latest DOA Data</div>
      <pre className="value latest">
        {payload ? JSON.stringify(payload, null, 2) : "Waiting for messages..."}
      </pre>
    </div>
  );
}
