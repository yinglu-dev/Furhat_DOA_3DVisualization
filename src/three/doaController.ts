import * as THREE from "three";
import type { DoaData } from "../types";

export const DOA_ACTIVE_TIMEOUT_MS = 1200;

export interface DirectionStep {
  direction: THREE.Vector3;
  hasFreshDOA: boolean;
  hasExternalDOA: boolean;
  volume: number;
}

/**
 * Smooths incoming DOA samples so the 3D motion looks continuous.
 * If no data arrives for `staleTimeoutMs`, the volume fades back to 0.
 */
export function createDirectionController({
  directionSmoothFactor = 0.18,
  volumeSmoothFactor = 0.2,
  staleTimeoutMs = DOA_ACTIVE_TIMEOUT_MS,
} = {}) {
  const currentDirection = new THREE.Vector3(1, 0, 0);
  const targetDirection = new THREE.Vector3(1, 0, 0);
  let currentVolume = 0;
  let targetVolume = 0;

  let hasExternalDOA = false;
  let lastDOATimeMs = 0;

  function updateFromData(data: DoaData): boolean {
    const { x, y, z } = data;
    if (![x, y, z].every(Number.isFinite)) return false;

    targetDirection.set(x, y, z);
    if (targetDirection.lengthSq() < 1e-8) return false;

    targetVolume = Number.isFinite(data.volume) ? Math.max(0, data.volume as number) : 0;
    targetDirection.normalize();
    hasExternalDOA = true;
    lastDOATimeMs = Date.now();
    return true;
  }

  function getDirectionStep(): DirectionStep {
    const hasFreshDOA = hasExternalDOA && Date.now() - lastDOATimeMs < staleTimeoutMs;

    if (hasFreshDOA) {
      currentDirection.lerp(targetDirection, directionSmoothFactor);
      if (currentDirection.lengthSq() < 1e-8) {
        currentDirection.copy(targetDirection);
      }
      currentDirection.normalize();
      currentVolume = THREE.MathUtils.lerp(currentVolume, targetVolume, volumeSmoothFactor);
      return { direction: currentDirection, hasFreshDOA, hasExternalDOA, volume: currentVolume };
    }

    currentVolume = THREE.MathUtils.lerp(currentVolume, 0, volumeSmoothFactor);
    if (currentVolume < 1e-4) currentVolume = 0;

    return { direction: currentDirection, hasFreshDOA, hasExternalDOA, volume: currentVolume };
  }

  return { updateFromData, getDirectionStep };
}
