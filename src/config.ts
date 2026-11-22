import { ORB_MODES, type DoaData, type OrbMode, type StyleState } from "./types";

export const DEFAULT_WS_URL = "ws://192.168.1.217:8765";

export const DEFAULT_STYLE: StyleState = {
  faces: {
    fillColor: "#cfa1f3",
    fillOpacity: 0.3,
    wireColor: "#76f3f7",
    wireOpacity: 0.6,
    explodeAmount: 0.1,
  },
  wireframe: {
    fillColor: "#5e07c3",
    fillOpacity: 0.2,
    wireColor: "#76f3f7",
    wireOpacity: 0.5,
  },
  arrow: {
    arrowColor: "#4de7c8",
    lengthScale: 1,
  },
};

export const MODE_LABELS: Record<OrbMode, string> = {
  faces: "Faces",
  wireframe: "Wireframe",
  arrow: "Arrow",
  furhat: "Furhat",
};

/** Read ?orbStyle=... from the URL, falling back to "faces". */
export function getInitialMode(): OrbMode {
  const fromUrl = new URLSearchParams(window.location.search).get("orbStyle");
  return ORB_MODES.includes(fromUrl as OrbMode) ? (fromUrl as OrbMode) : "faces";
}

/** Read ?ws=... from the URL, accepting only ws:// or wss:// addresses. */
export function getWebSocketUrl(): string {
  const fromUrl = new URLSearchParams(window.location.search).get("ws");
  if (!fromUrl) return DEFAULT_WS_URL;
  try {
    const parsed = new URL(fromUrl);
    if (parsed.protocol === "ws:" || parsed.protocol === "wss:") return parsed.toString();
  } catch {
    console.warn("Invalid ws query parameter, falling back to default WebSocket URL.");
  }
  return DEFAULT_WS_URL;
}

/** Turn a raw WebSocket message into DoaData, or null if it has the wrong shape. */
export function parseDoaMessage(raw: string): DoaData | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn("Invalid JSON message:", raw);
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  const x = Number(obj.x);
  const y = Number(obj.y);
  const z = Number(obj.z);
  if (![x, y, z].every(Number.isFinite)) {
    console.warn("Unexpected DOA message shape:", parsed);
    return null;
  }

  // "strength" is accepted for backward compatibility; "volume" is preferred.
  const volume = Number.isFinite(Number(obj.volume))
    ? Number(obj.volume)
    : Number.isFinite(Number(obj.strength))
      ? Number(obj.strength)
      : undefined;

  return volume === undefined ? { x, y, z } : { x, y, z, volume };
}
