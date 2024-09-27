import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { updateCameraAnimation } from './cameraAnimation.js';


const BACKGROUND_COLOR = 0xffffff;
const AMBIENT_LIGHT_COLOR = 0xffffff;
const AMBIENT_LIGHT_INTENSITY = 0.1;
const Y_AXIS = 0.35;
let CAMERA_POSITION;
let reticle;
let renderer;
let scene;
let controller;
let selectedModel = null;

let rotating = false;  
let rotationSpeed = 0.015;  


const ORBIT_TARGET = new THREE.Vector3(0, Y_AXIS, 0);
const HDRI_PATH = '/hdri/studio005small.hdr';

export function initScene(canvas, chairAsset) {
  CAMERA_POSITION = ($(window).width() < 768) ? chairAsset.cameraPosMobile : chairAsset.cameraPos;

  scene = new THREE.Scene();
  sceneBackgroundSet(true);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMappingExposure = 0.85;

  const rgbeLoader = new RGBELoader();
  rgbeLoader.load(HDRI_PATH, (texture) => {
    texture.mapping = THREE.EquirectangularRefractionMapping;
    scene.environment = texture;
    
  });



  // Camera orbit params
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
  camera.lookAt(0, Y_AXIS, 0);


  //AR part
  addReticleToScene();

  controller = renderer.xr.getController(0);
  // controller.addEventListener('select', onSelect);
  controller.addEventListener('selectstart', onSelectStart);
  controller.addEventListener('selectend', onSelectEnd);

  scene.add(controller);

  return { scene, camera, renderer, orbit };
}


//###########################
function addReticleToScene() {
  const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial();
  reticle = new THREE.Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);
}

export function passModelToScene(model) {
  selectedModel = model;
}

export function sceneBackgroundSet(remove = false){
  if(remove){ 
    scene.background = new THREE.Color(BACKGROUND_COLOR);
  }else{
    scene.background = null;
  }
}


function onSelectEnd(event) {
  rotating = false;
}


function onSelectStart(event){
  if (reticle.visible && selectedModel) {
    selectedModel.traverse((child) => {
      if (child.isMesh) {
        child.position.setFromMatrixPosition(reticle.matrix);
        child.quaternion.setFromRotationMatrix(reticle.matrix);
      }
    });
    selectedModel.visible = true;
    
    rotating = true;  
  }

  rotating = true;
}

function rotateModel() {
  if (rotating && selectedModel) {
    selectedModel.traverse((child) => {
      if (child.isMesh) {
        child.rotation.y += rotationSpeed;  // Rotate around the Y-axis
      }
    });
  }
}

let hitTestSource = null;
let localSpace = null;
let hitTestSourceInitialized = false;

async function initializeHitTestSource() {
  const session = renderer.xr.getSession();
  const viewerSpace = await session.requestReferenceSpace("viewer");
  hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
  localSpace = await session.requestReferenceSpace("local");
  hitTestSourceInitialized = true;
  //exit
  session.addEventListener("end", () => {
    hitTestSourceInitialized = false;
    hitTestSource = null;
    selectedModel.traverse((child) => {
      console.log(child);
      
      if (child.isMesh) {
        // Reset position to default
        child.position.set(0, 0, 0);
        child.rotation.set(0, 0, 0);
      }
    });
    scene.remove(reticle);
    sceneBackgroundSet(true);
    selectedModel.visible = true;  
    $('.configurator-btn').click()

  });
}

export function animate(scene, camera, renderer, mixers) {
  const clock = new THREE.Clock();

  renderer.setAnimationLoop((timestamp, frame) => {
    const delta = clock.getDelta();

    if (mixers && mixers.length > 0) {
      mixers.forEach((mixer) => {
        mixer.update(delta);
      });
    }

    if (frame) {
      if (!hitTestSourceInitialized) {
        initializeHitTestSource();
      }

      if (hitTestSourceInitialized) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(localSpace);
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        } else {
          reticle.visible = false;
        }
      }
    }

    rotateModel(); 

    updateCameraAnimation();
    renderer.render(scene, camera);
  });
}
