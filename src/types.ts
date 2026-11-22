// Shared types used by both the React UI and the Three.js renderers.

/** One DOA message from the WebSocket server: a direction vector and an optional volume. */
export interface DoaData {
  x: number;
  y: number;
  z: number;
  volume?: number;
}

/** The four visualization modes. */
export type OrbMode = "faces" | "wireframe" | "arrow" | "furhat";

export const ORB_MODES: OrbMode[] = ["faces", "wireframe", "arrow", "furhat"];

export interface FacesStyle {
  fillColor: string;
  fillOpacity: number;
  wireColor: string;
  wireOpacity: number;
  explodeAmount: number;
}

export interface WireframeStyle {
  fillColor: string;
  fillOpacity: number;
  wireColor: string;
  wireOpacity: number;
}

export interface ArrowStyle {
  arrowColor: string;
  lengthScale: number;
}

/** Style settings for every mode. Furhat has no style controls. */
export interface StyleState {
  faces: FacesStyle;
  wireframe: WireframeStyle;
  arrow: ArrowStyle;
}

/** WebSocket connection states shown in the status indicator. */
export type ConnectionState = "connecting" | "open" | "closed" | "error";

/**
 * The contract every Three.js renderer implements.
 * React only talks to the 3D scene through this small interface.
 */
export interface OrbRenderer {
  /** Feed a new DOA sample into the scene. */
  update(data: DoaData): void;
  /** Apply style settings (ignored by modes without styles). */
  setStyle(style: Partial<FacesStyle & WireframeStyle & ArrowStyle>): void;
  /** Stop the animation loop and free GPU resources. */
  dispose(): void;
}
