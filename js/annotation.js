import * as THREE from 'three';

/**
 * Creates an annotation using a sprite and adds it to the scene.
 * @param {THREE.Scene} scene - The Three.js scene to add the annotation to.
 * @param {THREE.Camera} camera - The camera used for raycasting.
 * @param {THREE.WebGLRenderer} renderer - The renderer used for rendering.
 * @param {THREE.Vector3} position - The position of the annotation.
 * @param {string} textureUrl - The URL of the sprite texture.
 * @param {Function} onClick - The callback function to execute on click.
 * @param {number} [width=1] - The width of the sprite.
 * @param {number} [height=1] - The height of the sprite.
 */
export function createAnnotation(scene, position, textureUrl, width = 0.2, height = 0.2) {
    const spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load(textureUrl),
        depthTest: true,
        depthWrite: true,
        blending: THREE.NormalBlending,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(width, height, 1);

    scene.add(sprite);

    return sprite;
}


let activeAnnotationListener = null;

export function annotationInteraction(camera, sprite, onClick, enabled) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Function to handle mouse clicks
    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(sprite);

        if (intersects.length > 0) {
            onClick();
        }
    }

 
    if (enabled) {
        if (!activeAnnotationListener) {
            window.addEventListener('click', onMouseClick, false);
            activeAnnotationListener = onMouseClick;
        }
    } else {
        if (activeAnnotationListener) {
            window.removeEventListener('click', activeAnnotationListener, false);
            activeAnnotationListener = null;
        }
    }
}