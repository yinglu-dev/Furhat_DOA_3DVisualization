import * as THREE from "three";
import { createSceneSetup } from "../sceneSetup";
import { createDirectionController } from "../doaController";
import { setOpacity, spikeTowards } from "./orbUtils";
import type { OrbRenderer } from "../../types";

const VOLUME_SCALE = 0.001;

/** "Wireframe" mode: a lighter mesh orb that spikes towards the sound. */
export function createWireframeRenderer(mount: HTMLElement): OrbRenderer {
  const setup = createSceneSetup({ mount, cameraZ: 1.22 });
  const directionController = createDirectionController();

  const geometry = new THREE.IcosahedronGeometry(0.4, 3);
  const basePositions = geometry.attributes.position.array.slice();

  const material = new THREE.MeshPhongMaterial({
    color: 0x5e07c3,
    opacity: 0.2,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const icosahedron = new THREE.Mesh(geometry, material);
  setup.scene.add(icosahedron);

  const lineMaterial = new THREE.MeshPhongMaterial({
    color: 0x76f3f7,
    wireframe: true,
    opacity: 0.5,
    transparent: true,
  });
  icosahedron.add(new THREE.Mesh(geometry, lineMaterial));

  setup.start(() => {
    const { direction, volume } = directionController.getDirectionStep();
    spikeTowards(geometry, basePositions, direction, volume * VOLUME_SCALE);
  });

  return {
    update: (data) => directionController.updateFromData(data),
    setStyle(style) {
      if (style.fillColor) material.color.set(style.fillColor);
      if (style.fillOpacity !== undefined) setOpacity(material, style.fillOpacity);
      if (style.wireColor) lineMaterial.color.set(style.wireColor);
      if (style.wireOpacity !== undefined) setOpacity(lineMaterial, style.wireOpacity);
    },
    dispose: () => setup.dispose(),
  };
}
