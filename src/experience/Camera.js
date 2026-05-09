import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Camera {
    constructor() {
        this.experience = window.experience;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.time = this.experience.time;

        this.setInstance();
        this.setControls();
        
        this.lastInteractionTime = Date.now();
        this.setupInteractionListeners();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100);
        this.instance.position.set(0, 0.5, 3.5);
        this.scene.add(this.instance);
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1.5;
        this.controls.maxDistance = 8;
        // OrbitControls target is center by default
    }
    
    setupInteractionListeners() {
        const updateTime = () => {
            this.lastInteractionTime = Date.now();
            this.controls.autoRotate = false;
        };
        
        window.addEventListener('mousedown', updateTime);
        window.addEventListener('touchstart', updateTime);
        window.addEventListener('wheel', updateTime);
        window.addEventListener('keydown', updateTime);
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    update() {
        // Auto-rotate on idle: after 4s of no user interaction
        if (Date.now() - this.lastInteractionTime > 4000) {
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.3;
        }
        
        this.controls.update();
    }
}
