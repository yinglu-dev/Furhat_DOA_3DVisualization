import * as THREE from "three";
import { POWER } from "../sceneSetup";

const v = new THREE.Vector3();
const n = new THREE.Vector3();

/**
 * Push the vertices that face `dir` outwards, creating a spike towards the sound source.
 * `basePositions` is the untouched geometry, so the deformation never accumulates.
 */
export function spikeTowards(
  geometry: THREE.BufferGeometry,
  basePositions: ArrayLike<number>,
  dir: THREE.Vector3,
  strength: number
): void {
  const pos = geometry.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const ix = i * 3;
    v.set(basePositions[ix], basePositions[ix + 1], basePositions[ix + 2]);
    n.copy(v).normalize();

    let w = Math.max(0, n.dot(dir));
    w = Math.pow(w, POWER);

    v.addScaledVector(n, w * strength);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

/** Set a material's opacity and keep `transparent` in sync. */
export function setOpacity(material: THREE.Material, opacity: number): void {
  material.opacity = THREE.MathUtils.clamp(opacity, 0, 1);
  material.transparent = material.opacity < 1;
}
