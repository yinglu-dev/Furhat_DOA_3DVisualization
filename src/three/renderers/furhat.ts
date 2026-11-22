import * as THREE from "three";
import { createSceneSetup, loadObjWithMtl } from "../sceneSetup";
import { createDirectionController } from "../doaController";
import type { OrbRenderer } from "../../types";

const VOLUME_SCALE = 0.001;

/** "Furhat" mode: the Furhat head turns towards the sound and lifts with volume. */
export function createFurhatRenderer(mount: HTMLElement): OrbRenderer {
  const setup = createSceneSetup({ mount, cameraZ: 1.35 });
  const directionController = createDirectionController();

  let furhat: THREE.Group | null = null;
  let disposed = false;

  loadObjWithMtl("/furhat.mtl", "/furhat.obj", (model) => {
    if (disposed) return;
    furhat = model;
    setup.scene.add(model);
  });

  setup.start(() => {
    const { direction, volume } = directionController.getDirectionStep();
    if (furhat) {
      furhat.position.y = volume * VOLUME_SCALE + 0.1;
      furhat.rotation.y = Math.atan2(direction.x, direction.y);
    }
  });

  return {
    update: (data) => directionController.updateFromData(data),
    setStyle: () => {},
    dispose: () => {
      disposed = true;
      setup.dispose();
    },
  };
}
