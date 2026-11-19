import * as THREE from "three";
import { createSceneSetup } from "../sceneSetup";
import { createDirectionController } from "../doaController";
import { setOpacity, spikeTowards } from "./orbUtils";
import type { OrbRenderer } from "../../types";

const VOLUME_SCALE = 0.001;

/** "Faces" mode: a filled orb with a wire overlay whose faces are pushed apart. */
export function createFacesRenderer(mount: HTMLElement): OrbRenderer {
  const setup = createSceneSetup({ mount, cameraZ: 1.18 });
  const directionController = createDirectionController();

  const geometry = new THREE.IcosahedronGeometry(0.34, 3); // already non-indexed: every triangle has its own vertices
  const basePositions = geometry.attributes.position.array.slice();

  const material = new THREE.MeshPhongMaterial({
    color: 0xcfa1f3,
    opacity: 0.3,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const icosahedron = new THREE.Mesh(geometry, material);
  setup.scene.add(icosahedron);

  const lineMaterial = new THREE.MeshPhongMaterial({
    color: 0x76f3f7,
    wireframe: true,
    opacity: 0.6,
    transparent: true,
  });
  icosahedron.add(new THREE.Mesh(geometry, lineMaterial));

  let explode = 0.1;

  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const tmpC = new THREE.Vector3();
  const edge = new THREE.Vector3();
  const faceNormal = new THREE.Vector3();

  // Move every triangle along its own normal, so the faces separate slightly.
  function explodeFaces(amount: number) {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i += 3) {
      tmpA.fromBufferAttribute(pos, i);
      tmpB.fromBufferAttribute(pos, i + 1);
      tmpC.fromBufferAttribute(pos, i + 2);

      faceNormal.subVectors(tmpB, tmpA).cross(edge.subVectors(tmpC, tmpA)).normalize();

      tmpA.addScaledVector(faceNormal, amount);
      tmpB.addScaledVector(faceNormal, amount);
      tmpC.addScaledVector(faceNormal, amount);

      pos.setXYZ(i, tmpA.x, tmpA.y, tmpA.z);
      pos.setXYZ(i + 1, tmpB.x, tmpB.y, tmpB.z);
      pos.setXYZ(i + 2, tmpC.x, tmpC.y, tmpC.z);
    }
    pos.needsUpdate = true;
  }

  setup.start(() => {
    const { direction, volume } = directionController.getDirectionStep();
    spikeTowards(geometry, basePositions, direction, volume * VOLUME_SCALE);
    explodeFaces(explode);
  });

  return {
    update: (data) => directionController.updateFromData(data),
    setStyle(style) {
      if (style.fillColor) material.color.set(style.fillColor);
      if (style.fillOpacity !== undefined) setOpacity(material, style.fillOpacity);
      if (style.wireColor) lineMaterial.color.set(style.wireColor);
      if (style.wireOpacity !== undefined) setOpacity(lineMaterial, style.wireOpacity);
      if (style.explodeAmount !== undefined) {
        explode = THREE.MathUtils.clamp(style.explodeAmount, 0, 0.3);
      }
    },
    dispose: () => setup.dispose(),
  };
}
