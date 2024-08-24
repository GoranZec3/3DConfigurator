import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { updateCameraAnimation } from './cameraAnimation.js';


const BACKGROUND_COLOR = 0xffffff;
const AMBIENT_LIGHT_COLOR = 0xffffff;
const AMBIENT_LIGHT_INTENSITY = 0.1;
const Y_AXIS = 0.35
let CAMERA_POSITION
if ($(window).width() < 768) {
 CAMERA_POSITION = new THREE.Vector3(2.6,Y_AXIS,0);

}else{
  CAMERA_POSITION = new THREE.Vector3(2,Y_AXIS,0);
}
const ORBIT_TARGET = new THREE.Vector3(0, Y_AXIS, 0);
const HDRI_PATH = '/hdri/studio005small.hdr';

export function initScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND_COLOR);


  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMappingExposure = 1.1;


  const rgbeLoader = new RGBELoader();
  rgbeLoader.load(HDRI_PATH, (texture) => {
    texture.mapping = THREE.EquirectangularRefractionMapping;
    // scene.background = texture; // Set HDRI as background
    scene.environment = texture; // Set HDRI as environment map
  });

  //camera orbit params
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enablePan = false;
  orbit.enableZoom = true;
  orbit.rotateSpeed = 0.5;
  orbit.enableDamping = false;
  orbit.dampingFactor = 1;
  orbit.minDistance = 0;
  orbit.maxDistance = 20;
  orbit.target.copy(ORBIT_TARGET);
  orbit.update();

  const ambientLight = new THREE.AmbientLight(AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY);
  scene.add(ambientLight);

  camera.position.copy(CAMERA_POSITION);
  camera.lookAt(0,Y_AXIS, 0);

  return { scene, camera, renderer, orbit };
}

export function animate(scene, camera, renderer, mixers) {
  const clock = new THREE.Clock();

  function render() {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    if (mixers && mixers.length > 0) {
      mixers.forEach((mixer) => {
        mixer.update(delta);
      });
    }

    updateCameraAnimation();
    renderer.render(scene, camera);
  }

  render(); // Start animation loop
}