import type { OrbMode, OrbRenderer } from "../../types";
import { createFacesRenderer } from "./faces";
import { createWireframeRenderer } from "./wireframe";
import { createArrowRenderer } from "./arrow";
import { createFurhatRenderer } from "./furhat";

/** Map each mode to the function that builds its Three.js scene. */
export const RENDERERS: Record<OrbMode, (mount: HTMLElement) => OrbRenderer> = {
  faces: createFacesRenderer,
  wireframe: createWireframeRenderer,
  arrow: createArrowRenderer,
  furhat: createFurhatRenderer,
};
