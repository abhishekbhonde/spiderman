import * as THREE from 'three';
import Sizes from './Sizes.js';
import Time from './Time.js';
import Camera from './Camera.js';
import Renderer from './Renderer.js';
import AudioManager from './AudioManager.js';
import SpidermanModel from './SpidermanModel.js';
import ParticleSystem from './ParticleSystem.js';
import PostProcessing from './PostProcessing.js';
import DebugUI from './DebugUI.js';

let instance = null;

export default class Experience {
    constructor(canvas) {
        if (instance) {
            return instance;
        }
        instance = this;

        // Global access
        window.experience = this;

        // Options
        this.canvas = canvas;

        // Setup
        this.sizes = new Sizes();
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#000000');
        
        // Spider-Sense State
        this.spiderSenseActive = false;
        this.spiderSenseValue = 0.0;
        
        this.setupSpiderSense();

        this.camera = new Camera();
        this.renderer = new Renderer();
        this.audioManager = new AudioManager();
        
        this.debug = new DebugUI();
        
        // Lighting
        this.setupLighting();

        this.model = new SpidermanModel();
        
        this.model.on('ready', () => {
            this.particles = new ParticleSystem();
            this.postProcessing = new PostProcessing();
            
            // Sizes resize event
            this.sizes.on('resize', () => {
                this.resize();
            });

            // Time tick event
            this.time.on('tick', () => {
                this.update();
            });
        });
    }

    setupLighting() {
        // 1. AmbientLight — color:#0a0a1a (very dark blue-tinted), intensity:0.3
        const ambientLight = new THREE.AmbientLight('#0a0a1a', 0.3);
        this.scene.add(ambientLight);

        // 2. DirectionalLight — color:#CC0000 (spider red), intensity:2.5, position:(3, 4, 2)
        const directionalLight = new THREE.DirectionalLight('#CC0000', 2.5);
        directionalLight.position.set(3, 4, 2);
        directionalLight.castShadow = false;
        this.scene.add(directionalLight);

        // 3. PointLight — color:#003DA5 (spider blue), intensity:1.2, position:(-2, -1, 1)
        const pointLight = new THREE.PointLight('#003DA5', 1.2);
        pointLight.position.set(-2, -1, 1);
        this.scene.add(pointLight);

        // 4. RectAreaLight — color:#ffffff, intensity:0.8, width:4, height:4, position:(0, 5, 3)
        // RectAreaLightHelper and RectAreaLightUniformsLib not imported for size, simple rect light works
        const rectLight = new THREE.RectAreaLight('#ffffff', 0.8, 4, 4);
        rectLight.position.set(0, 5, 3);
        rectLight.lookAt(0, 0, 0);
        this.scene.add(rectLight);
        
        this.lights = {
            ambientLight,
            directionalLight,
            pointLight,
            rectLight
        };
    }

    setupSpiderSense() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.spiderSenseActive) {
                this.spiderSenseActive = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.spiderSenseActive) {
                this.spiderSenseActive = false;
            }
        });
    }

    resize() {
        this.camera.resize();
        this.renderer.resize();
        if(this.postProcessing) this.postProcessing.resize();
    }

    update() {
        // Update Spider-Sense Value
        const targetValue = this.spiderSenseActive ? 1.0 : 0.0;
        const lerpFactor = this.spiderSenseActive ? 0.3 : 0.5;
        // Simple dt independent lerp approx or use actual delta
        const dt = this.time.delta * 0.001;
        this.spiderSenseValue += (targetValue - this.spiderSenseValue) * (dt * (1.0 / (this.spiderSenseActive ? 0.3 : 0.5)));
        this.spiderSenseValue = Math.max(0, Math.min(1, this.spiderSenseValue));
        
        // Background color lerp
        const black = new THREE.Color('#000000');
        const darkRed = new THREE.Color('#0a0000');
        this.scene.background.lerpColors(black, darkRed, this.spiderSenseValue);
        
        // Slow motion
        const timeScaleTarget = this.spiderSenseActive ? 0.05 : 1.0;
        this.time.timeScale += (timeScaleTarget - this.time.timeScale) * (dt * (1.0 / (this.spiderSenseActive ? 0.3 : 0.5)));

        this.camera.update();
        if(this.particles) this.particles.update();
        if(this.postProcessing) {
            this.postProcessing.update();
        } else {
            this.renderer.update();
        }
        
        if(this.debug) this.debug.update();
    }
}
