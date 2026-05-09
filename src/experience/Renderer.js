import * as THREE from 'three';

export default class Renderer {
    constructor() {
        this.experience = window.experience;
        this.canvas = this.experience.canvas;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;

        this.setInstance();
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            powerPreference: 'high-performance',
            antialias: false // Using post-processing, so disable built-in antialias
        });
        
        // Disable physically correct lights for our stylized look, but keep colorspaces modern
        // OutputEncoding is deprecated, colorSpace is used now
        this.instance.outputColorSpace = THREE.SRGBColorSpace;
        this.instance.toneMapping = THREE.NoToneMapping;
        this.instance.toneMappingExposure = 1;
        this.instance.setClearColor('#000000');
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    update() {
        this.instance.render(this.scene, this.camera.instance);
    }
}
