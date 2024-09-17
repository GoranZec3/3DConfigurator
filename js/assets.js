import * as THREE from "three";
export default [
    {
        name: "Ovini chair",
        type: "glbModel",
        path: "/models/ovini_chair.glb",
        pathFabric: "/textures/fabric.png",       
        pathLegs: "/textures/legs.png",   
        annotationFabricPos: new THREE.Vector3(0, 0.55, 0.4),
        annotationFabricMobilePos: new THREE.Vector3(0, 0.7, 0.1),
        annotationLegsPos:  new THREE.Vector3(0, 0.15, -0.3),
        annotationLegsMobilePos: new THREE.Vector3(0, -0.08, -0.1),
        cameraPos: new THREE.Vector3(2, 0.35, 0),
        cameraPosMobile: new THREE.Vector3(2.6, 0.35, 0),
        animateFabricDesctop: new THREE.Vector3(0.6, 1.5, 0.4),
        animateFabricMobile: new THREE.Vector3(0.9, 1.5, 0.5),
        animateLegsDesctop: new THREE.Vector3(1, -0.2,0.3),
        animateLegsMobile:new THREE.Vector3(1.2, -0.8, 0.9)
    },
    {
        name: "Tamarack chair",
        type: "glbModel",
        path: "/models/tamarack_chair.glb",
        pathFabric: "/textures/fabric.png",       
        pathLegs: "/textures/legs.png",   
        annotationFabricPos: new THREE.Vector3(0, 0.55, 0.4),
        annotationFabricMobilePos: new THREE.Vector3(0, 0.7, 0.1),
        annotationLegsPos:  new THREE.Vector3(0, 0.15, -0.6),
        annotationLegsMobilePos: new THREE.Vector3(0, -0.25, -0.3),
        cameraPos: new THREE.Vector3(2.3, 1.3, 1.5),
        cameraPosMobile: new THREE.Vector3(3.5, 2, 1.9),
        animateFabricDesctop:new THREE.Vector3(1, 1.5, 0.4),
        animateFabricMobile: new THREE.Vector3(2.3, 1.2, 0.9),
        animateLegsDesctop: new THREE.Vector3(1, -0.2, 0.3),
        animateLegsMobile: new THREE.Vector3(2.5, -0.4, 1.3)
    }
]