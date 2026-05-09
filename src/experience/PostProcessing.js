import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import chromaticShader from '../shaders/postfx/chromatic.glsl';
import motionblurShader from '../shaders/postfx/motionblur.glsl';
import filmgrainShader from '../shaders/postfx/filmgrain.glsl';
import vignetteShader from '../shaders/postfx/vignette.glsl';
import comicShader from '../shaders/postfx/comic.glsl';

export default class PostProcessing {
    constructor() {
        this.experience = window.experience;
        this.renderer = this.experience.renderer.instance;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera.instance;
        this.sizes = this.experience.sizes;

        this.setup();
    }

    setup() {
        const renderTarget = new THREE.WebGLRenderTarget(
            this.sizes.width,
            this.sizes.height,
            {
                type: THREE.HalfFloatType,
                format: THREE.RGBAFormat,
                colorSpace: THREE.SRGBColorSpace,
            }
        );
        
        this.composer = new EffectComposer(this.renderer, renderTarget);
        this.composer.setSize(this.sizes.width, this.sizes.height);
        this.composer.setPixelRatio(this.sizes.pixelRatio);

        // 1. RenderPass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // 2. UnrealBloomPass
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            1.8,  // strength
            0.9,  // radius
            0.4   // threshold
        );
        this.composer.addPass(this.bloomPass);

        // 3. Comic Style (Halftone & Outline)
        this.comicMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
                uTime: { value: 0.0 },
                uSpiderSense: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: comicShader
        });
        this.comicPass = new ShaderPass(this.comicMaterial);
        this.composer.addPass(this.comicPass);

        // 4. Chromatic Aberration
        this.chromaticMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                uStrength: { value: 0.004 },
                uSpiderSense: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: chromaticShader
        });
        this.chromaticPass = new ShaderPass(this.chromaticMaterial);
        this.composer.addPass(this.chromaticPass);

        // 4. Motion Blur
        this.motionBlurMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                tVelocity: { value: null }, // Simple radial fallback without velocity buffer
                uStrength: { value: 0.5 },
                uSpiderSense: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: motionblurShader
        });
        this.motionBlurPass = new ShaderPass(this.motionBlurMaterial);
        this.composer.addPass(this.motionBlurPass);

        // 5. Film Grain
        this.filmGrainMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                uTime: { value: 0.0 },
                uIntensity: { value: 0.035 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: filmgrainShader
        });
        this.filmGrainPass = new ShaderPass(this.filmGrainMaterial);
        this.composer.addPass(this.filmGrainPass);

        // 6. Vignette
        this.vignetteMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                uStrength: { value: 0.4 },
                uSpiderSense: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: vignetteShader
        });
        this.vignettePass = new ShaderPass(this.vignetteMaterial);
        this.composer.addPass(this.vignettePass);
    }

    resize() {
        this.composer.setSize(this.sizes.width, this.sizes.height);
        this.composer.setPixelRatio(this.sizes.pixelRatio);
        this.comicPass.uniforms.uResolution.value.set(this.sizes.width, this.sizes.height);
    }

    update() {
        const elapsedTime = this.experience.time.elapsed * 0.001;
        const spiderSense = this.experience.spiderSenseValue;

        this.comicPass.uniforms.uTime.value = elapsedTime;
        this.comicPass.uniforms.uSpiderSense.value = spiderSense;
        
        this.chromaticPass.uniforms.uSpiderSense.value = spiderSense;
        this.vignettePass.uniforms.uSpiderSense.value = spiderSense;
        this.motionBlurPass.uniforms.uSpiderSense.value = spiderSense;
        this.filmGrainPass.uniforms.uTime.value = elapsedTime;

        this.composer.render();
    }
}
