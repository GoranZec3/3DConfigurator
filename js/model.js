import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';



export class ModelLoader {
    constructor(scene, modelPath, camera) {
        this.loader = new GLTFLoader();
        this.model = null;
        this.scene = scene;
        this.camera = camera;
        this.annotations = {};
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.loadModel(modelPath);
    }

    async loadModel(modelPath) {
        const loadingOverlay = document.getElementById("loading-overlay");
        try {
            loadingOverlay.style.display = "flex";
            // Fetch the modified GLB file as an ArrayBuffer
            const response = await fetch(modelPath);
            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
    
         
            if (uint8Array[0] === 0x67 && uint8Array[1] === 0x6C && uint8Array[2] === 0x74 && uint8Array[3] === 0x66) {
                uint8Array[2] = 0x54; 
                uint8Array[3] = 0x46; 
    
                // Create a Blob from the modified Uint8Array
                const revertedBlob = new Blob([uint8Array], { type: 'model/gltf-binary' });
                const revertedUrl = URL.createObjectURL(revertedBlob);
    
                // Load the reverted Blob into Three.js
                return new Promise((resolve, reject) => {
                    this.loader.load(
                        revertedUrl,
                        (gltf) => {
                            this.model = gltf.scene;
                            this.scene.add(this.model);
                            console.log('Model loaded and reversed successfully.');
                            loadingOverlay.style.display = "none";
                            // Clean up the URL object after loading
                            URL.revokeObjectURL(revertedUrl);
                            resolve(this.model);
                        },
                        undefined,
                        (error) => {
                            console.error('Error loading reverted GLB:', error);
                            loadingOverlay.style.display = "none";
                            reject(error);
                        }
                    );
                });
            } else {
                throw new Error('File format is not as expected.');
            }
        } catch (error) {
            console.error('Error during the model loading process:', error);
            loadingOverlay.style.display = "none";
            throw error;
        }
    }
    
    

    //old loader
    // loadModel(modelPath) {
    //     return new Promise((resolve, reject) => {
    //         this.loader.load(
    //             modelPath,
    //             (gltf) => {
    //                 this.model = gltf.scene;
    //                 this.scene.add(this.model);
    //                 // this.model.position.z = -2;
    //                 console.log('Model loaded successfully.');
                    
    //                 resolve();
    //             },
    //             undefined,
    //             (error) => {
    //                 console.error('Error loading model:', error);
    //                 reject(error);
    //             }
    //         );
    //     });
    // }


    changeModelColor(materialName, color, removeMap = false) {
        if (this.model) {
            let materialFound = false;

            this.model.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (child.material.name === materialName) {
                        if (removeMap) {
                            child.material.map = null; // Remove texture map
                            child.material.needsUpdate = true;
                        }
                        child.material.color.set(color);
                        materialFound = true;
                    }
                }
            });

            if (!materialFound) {
                console.warn('There is no material named ' + materialName);
            }
        } else {
            console.warn('Model is not loaded yet.');
        }
    }

    addAnnotation(name, position, textureUrl, width = 0.2, height = 0.2) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load(textureUrl),
            depthTest: true,
            depthWrite: true,
            blending: THREE.NormalBlending,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.scale.set(width, height, 1);

        this.scene.add(sprite);

        // Store annotation
        this.annotations[name] = {
            sprite: sprite,
            onClick: null, // Default to null, will be set later
            onMouseClick: null,
        };

        // Update interaction after adding annotation
        this.updateInteraction(name);
    }


    /**
 * Sets the visibility of a specific annotation or all annotations.
 * @param {string} name - The name of the annotation to change visibility.
 *                        If 'all' is passed, the visibility of all annotations will be set.
 * @param {boolean} visible - Whether to make the annotation(s) visible or not.
 */
    setAnnotationVisibility(name, visible) {
        if(name === 'all'){
            for(const key in this.annotations){
                this.annotations[key].sprite.visible = visible;
                this.updateInteraction(key);
            }
        }else{
            const annotation = this.annotations[name];
            if (annotation) {
                annotation.sprite.visible = visible;
                this.updateInteraction(name); // Update interaction based on visibility
            } else {
                console.warn('Annotation with name ' + name + ' not found.');
            }
        }

    }

    updateInteraction(name) {
        const annotation = this.annotations[name];
        if (!annotation) {
            console.warn('Annotation with name ' + name + ' not found in updateInteraction.');
            return;
        }

        // Remove existing interaction if it exists
        if (annotation.onMouseClick) {
            window.removeEventListener('click', annotation.onMouseClick, false);
            annotation.onMouseClick = null;
        }

        // Set up new interaction if the annotation is visible and has an onClick handler
        if (annotation.sprite.visible && this.camera && annotation.onClick) {
            const raycaster = this.raycaster;
            const mouse = this.mouse;

            annotation.onMouseClick = (event) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, this.camera);
                const intersects = raycaster.intersectObject(annotation.sprite);

                if (intersects.length > 0) {
                    annotation.onClick();
                }
            };

            // Ensure that only one event listener is active for the annotation
            window.addEventListener('click', annotation.onMouseClick, false);
        }
    }

    triggerInteraction(name, onClick) {
        const annotation = this.annotations[name];
        if (annotation) {
            // Update the onClick function
            annotation.onClick = onClick;
            // Ensure interaction is updated
            this.updateInteraction(name);
        } else {
            console.warn('No annotation found for ' + name);
        }
    }
}
