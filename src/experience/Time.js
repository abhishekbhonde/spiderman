import * as THREE from 'three';

export default class Time extends THREE.EventDispatcher {
    constructor() {
        super();

        // Setup
        this.start = Date.now();
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16;
        this.timeScale = 1.0;

        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    tick() {
        const currentTime = Date.now();
        this.delta = currentTime - this.current;
        this.current = currentTime;
        
        // Cap delta to 60ms to avoid large jumps
        if (this.delta > 60) {
            this.delta = 60;
        }

        // Apply timeScale
        this.elapsed += this.delta * this.timeScale;

        this.dispatchEvent({ type: 'tick' });

        window.requestAnimationFrame(() => {
            this.tick();
        });
    }
}
