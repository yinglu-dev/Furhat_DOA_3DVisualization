import * as THREE from "three";
import { createSceneSetup } from "../sceneSetup";
import { createDirectionController } from "../doaController";
import type { OrbRenderer } from "../../types";

const IDLE_LENGTH_BASE = 1;
const VOLUME_SCALE = 0.001;

/** "Arrow" mode: an arrow that points to the sound and grows with volume. */
export function createArrowRenderer(mount: HTMLElement): OrbRenderer {
  const setup = createSceneSetup({ mount, cameraZ: 1.5 });
  const directionController = createDirectionController();

  const material = new THREE.MeshPhongMaterial({ color: 0x4de7c8 });

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, 0.32, 48), material);
  shaft.position.y = 0.16;

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.05, 48), material);
  tip.position.y = 0.185;
  shaft.add(tip);

  setup.scene.add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 32, 32), material));

  const arrow = new THREE.Object3D();
  arrow.add(shaft);
  setup.scene.add(arrow);

  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion();
  let lengthScale = 1;

  setup.start(() => {
    const { direction, volume } = directionController.getDirectionStep();
    const length = (IDLE_LENGTH_BASE + volume * VOLUME_SCALE) * lengthScale;
    arrow.scale.set(1, length, 1);
    q.setFromUnitVectors(up, direction);
    arrow.quaternion.copy(q);
  });

  return {
    update: (data) => directionController.updateFromData(data),
    setStyle(style) {
      if (style.arrowColor) material.color.set(style.arrowColor);
      if (style.lengthScale !== undefined) {
        lengthScale = THREE.MathUtils.clamp(style.lengthScale, 0.5, 2.5);
      }
    },
    dispose: () => setup.dispose(),
  };
}
