import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const POWER = 14;

export interface SceneSetupOptions {
  /** The DOM element the canvas is added to (provided by React via a ref). */
  mount: HTMLElement;
  cameraZ?: number;
  loadSpeaker?: boolean;
}

export interface SceneSetup {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  /** Start the render loop. `onFrame` runs once per frame before rendering. */
  start(onFrame: () => void): void;
  /** Stop the loop, remove the canvas and free GPU memory. */
  dispose(): void;
}

/** Load an OBJ model together with its MTL materials. */
export function loadObjWithMtl(
  mtlUrl: string,
  objUrl: string,
  onLoad: (root: THREE.Group) => void
): void {
  new MTLLoader().load(mtlUrl, (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(objUrl, onLoad, undefined, (err) => console.error("OBJ load error:", err));
  });
}

export function createSceneSetup({
  mount,
  cameraZ = 1,
  loadSpeaker = true,
}: SceneSetupOptions): SceneSetup {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = cameraZ;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.display = "block";
  mount.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enableZoom = false;

  const light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(1, 4, 2);
  scene.add(light);

  const backLight = new THREE.DirectionalLight(0xffffff, 2);
  backLight.position.set(-1, -4, -2);
  scene.add(backLight);

  let disposed = false;

  if (loadSpeaker) {
    // Files in public/ are served from the site root by Vite.
    loadObjWithMtl("/speaker.mtl", "/speaker.obj", (root) => {
      if (disposed) return;
      root.scale.set(9, 9, 9);
      root.rotation.x = -Math.PI / 2;
      scene.add(root);
    });
  }

  // Keep the canvas square and centred inside the stage.
  const resizeRendererToStage = () => {
    const bounds = mount.getBoundingClientRect();
    const width = Math.max(1, bounds.width || window.innerWidth);
    const height = Math.max(1, bounds.height || window.innerHeight);
    const size = Math.max(1, Math.min(width, height));

    camera.aspect = 1;
    camera.updateProjectionMatrix();
    renderer.setSize(size, size, false);
    renderer.domElement.style.width = `${size}px`;
    renderer.domElement.style.height = `${size}px`;
    renderer.domElement.style.left = `${(width - size) * 0.5}px`;
    renderer.domElement.style.top = `${(height - size) * 0.5}px`;
  };

  resizeRendererToStage();
  const resizeObserver = new ResizeObserver(resizeRendererToStage);
  resizeObserver.observe(mount);

  let frameId = 0;

  return {
    scene,
    camera,
    renderer,
    controls,
    start(onFrame) {
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        onFrame();
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
