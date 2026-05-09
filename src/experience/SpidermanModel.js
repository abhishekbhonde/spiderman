import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import suitShader from '../shaders/materials/suit.glsl';

export default class SpidermanModel extends THREE.EventDispatcher {
    constructor() {
        super();
        this.experience = window.experience;
        this.scene = this.experience.scene;

        this.sampledPositions = null;
        this.sampledNormals = null;
        this.modelMesh = null;
        
        this.loadModel();
    }

    loadModel() {
        const gltfLoader = new GLTFLoader();
        
        // Draco loader setup for optimized models
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        gltfLoader.setDRACOLoader(dracoLoader);

        gltfLoader.load('/spiderman.glb', (gltf) => {
            const children = [...gltf.scene.children];
            
            // To properly use MeshSurfaceSampler, we need to collect meshes
            const geometries = [];
            
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    // Apply transforms to geometry so we can merge them in world space
                    child.updateMatrixWorld();
                    const geom = child.geometry.clone();
                    geom.applyMatrix4(child.matrixWorld);
                    geometries.push(geom);
                }
            });

            if (geometries.length === 0) {
                console.error("No meshes found in model");
                return;
            }

            // Merge geometries for sampling
            const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
            
            // Compute bounding box to scale and center
            mergedGeometry.computeBoundingBox();
            const box = mergedGeometry.boundingBox;
            const size = new THREE.Vector3();
            box.getSize(size);
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.8 / maxDim; // Tallest dimension = 1.8 units
            
            const center = new THREE.Vector3();
            box.getCenter(center);
            
            // Center and scale geometry
            mergedGeometry.translate(-center.x, -center.y, -center.z);
            mergedGeometry.scale(scale, scale, scale);

            // Create material
            this.suitMaterial = new THREE.ShaderMaterial({
                vertexShader: `#define VERTEX\n${suitShader}`,
                fragmentShader: `#define FRAGMENT\n${suitShader}`,
                uniforms: {
                    uDirectionalLightDir: { value: this.experience.lights.directionalLight.position.clone().normalize() },
                    uDirectionalLightColor: { value: this.experience.lights.directionalLight.color },
                    uAmbientColor: { value: this.experience.lights.ambientLight.color }
                }
            });

            // Create combined mesh for visual representation
            this.modelMesh = new THREE.Mesh(mergedGeometry, this.suitMaterial);
            // Hide the actual mesh since we render particles, but keep it in scene if we want
            // Actually the prompt says "Apply the suit shader material to all meshes", 
            // the model doesn't need to be visible if we only want particles, or maybe we show both? 
            // "apply suit shader material (see Phase 5) to all meshes". Let's add it but make it invisible or visible depending on particle system.
            // Wait, Crystal-Bird uses particles exclusively. Let's make it visible to match Phase 5 requirements of creating a shader.
            this.scene.add(this.modelMesh);

            // Sample surface
            this.sampleSurface(this.modelMesh);
            
            this.dispatchEvent({ type: 'ready' });
        }, 
        (progress) => {}, 
        (error) => {
            console.error("Error loading model", error);
            // Create fallback geometry if model is missing
            const fallbackGeom = new THREE.CapsuleGeometry(0.3, 1.2, 4, 16);
            this.modelMesh = new THREE.Mesh(fallbackGeom, new THREE.MeshBasicMaterial({color: '#CC0000'}));
            this.scene.add(this.modelMesh);
            this.sampleSurface(this.modelMesh);
            this.dispatchEvent({ type: 'ready' });
        });
    }

    sampleSurface(mesh) {
        const sampler = new MeshSurfaceSampler(mesh).build();
        
        const count = 128 * 128; // 16384 particles
        this.sampledPositions = new Float32Array(count * 3);
        this.sampledNormals = new Float32Array(count * 3);
        
        const tempPosition = new THREE.Vector3();
        const tempNormal = new THREE.Vector3();
        
        for (let i = 0; i < count; i++) {
            sampler.sample(tempPosition, tempNormal);
            this.sampledPositions[i * 3 + 0] = tempPosition.x;
            this.sampledPositions[i * 3 + 1] = tempPosition.y;
            this.sampledPositions[i * 3 + 2] = tempPosition.z;
            
            this.sampledNormals[i * 3 + 0] = tempNormal.x;
            this.sampledNormals[i * 3 + 1] = tempNormal.y;
            this.sampledNormals[i * 3 + 2] = tempNormal.z;
        }
    }
}
