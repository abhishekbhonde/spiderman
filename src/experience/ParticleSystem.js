import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

import gpgpuPositionShader from '../shaders/gpgpu/position.glsl';
import gpgpuVelocityShader from '../shaders/gpgpu/velocity.glsl';
import particleVertexShader from '../shaders/particles/vertex.glsl';
import particleFragmentShader from '../shaders/particles/fragment.glsl';

export default class ParticleSystem {
    constructor() {
        this.experience = window.experience;
        this.scene = this.experience.scene;
        this.time = this.experience.time;
        this.renderer = this.experience.renderer;
        this.model = this.experience.model;

        this.setupGPGPU();
        this.setupParticles();
    }

    setupGPGPU() {
        // Mobile handling
        let textureSize = 128;
        if (navigator.hardwareConcurrency <= 4) {
            textureSize = 64;
        }
        this.textureSize = textureSize;
        this.particleCount = this.textureSize * this.textureSize;

        this.gpuCompute = new GPUComputationRenderer(this.textureSize, this.textureSize, this.renderer.instance);

        if (this.renderer.instance.capabilities.isWebGL2 === false) {
            this.gpuCompute.setDataType(THREE.HalfFloatType);
        }

        const basePositionTexture = this.gpuCompute.createTexture();
        const baseVelocityTexture = this.gpuCompute.createTexture();
        
        // Also create a texture to hold model positions
        this.modelPositionTexture = new THREE.DataTexture(
            new Float32Array(this.particleCount * 4), 
            this.textureSize, 
            this.textureSize, 
            THREE.RGBAFormat, 
            THREE.FloatType
        );

        for (let i = 0; i < this.particleCount; i++) {
            const x = this.model.sampledPositions[i * 3 + 0];
            const y = this.model.sampledPositions[i * 3 + 1];
            const z = this.model.sampledPositions[i * 3 + 2];
            
            basePositionTexture.image.data[i * 4 + 0] = x;
            basePositionTexture.image.data[i * 4 + 1] = y;
            basePositionTexture.image.data[i * 4 + 2] = z;
            basePositionTexture.image.data[i * 4 + 3] = Math.random();

            this.modelPositionTexture.image.data[i * 4 + 0] = x;
            this.modelPositionTexture.image.data[i * 4 + 1] = y;
            this.modelPositionTexture.image.data[i * 4 + 2] = z;
            this.modelPositionTexture.image.data[i * 4 + 3] = 1.0;

            baseVelocityTexture.image.data[i * 4 + 0] = 0;
            baseVelocityTexture.image.data[i * 4 + 1] = 0;
            baseVelocityTexture.image.data[i * 4 + 2] = 0;
            baseVelocityTexture.image.data[i * 4 + 3] = Math.random();
        }
        
        this.modelPositionTexture.needsUpdate = true;

        this.positionVariable = this.gpuCompute.addVariable('texturePosition', gpgpuPositionShader, basePositionTexture);
        this.velocityVariable = this.gpuCompute.addVariable('textureVelocity', gpgpuVelocityShader, baseVelocityTexture);

        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);
        this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);

        this.positionUniforms = this.positionVariable.material.uniforms;
        this.positionUniforms.uTime = { value: 0 };
        this.positionUniforms.uDelta = { value: 0 };

        this.velocityUniforms = this.velocityVariable.material.uniforms;
        this.velocityUniforms.uTime = { value: 0 };
        this.velocityUniforms.uDelta = { value: 0 };
        this.velocityUniforms.uFlowFieldInfluence = { value: 0.6 };
        this.velocityUniforms.uFlowFieldStrength = { value: 0.8 };
        this.velocityUniforms.uFlowFieldFrequency = { value: 0.8 };
        this.velocityUniforms.uWebAttraction = { value: 0.4 };
        this.velocityUniforms.uModelPositions = { value: this.modelPositionTexture };

        const error = this.gpuCompute.init();
        if (error !== null) {
            console.error(error);
        }
    }

    setupParticles() {
        const geometry = new THREE.BufferGeometry();
        const aParticleUV = new Float32Array(this.particleCount * 2);

        for (let y = 0; y < this.textureSize; y++) {
            for (let x = 0; x < this.textureSize; x++) {
                const i = (y * this.textureSize + x) * 2;
                aParticleUV[i + 0] = x / (this.textureSize - 1);
                aParticleUV[i + 1] = y / (this.textureSize - 1);
            }
        }

        geometry.setAttribute('aParticleUV', new THREE.BufferAttribute(aParticleUV, 2));

        this.material = new THREE.ShaderMaterial({
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            uniforms: {
                uPositionTexture: { value: null },
                uVelocityTexture: { value: null },
                uTime: { value: 0 },
                uParticleSize: { value: 2.0 },
                uPixelRatio: { value: this.experience.sizes.pixelRatio },
                uSpiderSense: { value: 0.0 }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.mesh = new THREE.Points(geometry, this.material);
        this.scene.add(this.mesh);
    }

    update() {
        const elapsedTime = this.time.elapsed * 0.001;
        const delta = this.time.delta * 0.001 * this.time.timeScale;

        // Update GPGPU Uniforms
        this.positionUniforms.uTime.value = elapsedTime;
        this.positionUniforms.uDelta.value = delta;

        this.velocityUniforms.uTime.value = elapsedTime;
        this.velocityUniforms.uDelta.value = delta;

        this.gpuCompute.compute();

        // Update Particle Uniforms
        this.material.uniforms.uPositionTexture.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
        this.material.uniforms.uVelocityTexture.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;
        this.material.uniforms.uTime.value = elapsedTime;
        this.material.uniforms.uSpiderSense.value = this.experience.spiderSenseValue;
    }
}
