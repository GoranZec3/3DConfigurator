import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let MODEL_LOADED = null;

/**
 * Loads a GLTF model and adds it to the provided scene.
 * @param {THREE.Scene} scene - The Three.js scene to add the model to.
 * @param {string} modelPath - The path to the GLTF model file.
 * @returns {Promise<void>} A Promise that resolves once the model is loaded.
 */
export function loadModel(scene, modelPath) {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            modelPath,
            (gltf) => {
                MODEL_LOADED = gltf.scene;
                scene.add(MODEL_LOADED);
                resolve(); // Resolve the promise when the model is loaded
            },
            undefined, // You can add a progress callback here if needed
            (error) => {
                reject(error); // Reject the promise if there's an error
                console.error('An error occurred while loading the model:', error);
            }
        );
    });
}


/**
 * Changes the color of the loaded model.
 * @param {THREE.Color | string} color - The color to apply to the material.
 * @param {THREE.Color | string} materialName - The material to apply the color.
 * @param {THREE.Color | boolean} removeMap - Remove map with true.
 */
export function changeModelColor(materialName, color, removeMap = false) {
    if (MODEL_LOADED) {

        let materialFound = false;

        MODEL_LOADED.traverse((child) => {
            if (child.isMesh && child.material) {
                if(child.material.name === materialName){   
                    if(removeMap){
                        child.material.map = null; // Remove texture map
                        child.material.needsUpdate = true;
                    }
                    // child.material.roughness = 0;
                    // child.material.metalness = 0;
                    child.material.color.set(color);
                    materialFound = true;
                }
            }
        });
        
        if(!materialFound){
            console.warn("There is no material named " + materialName)
        }
    } else {
        console.warn('Model is not loaded yet.');
    }
}

