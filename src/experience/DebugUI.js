import { Pane } from 'tweakpane';
import { ThreePerf } from 'three-perf';

export default class DebugUI {
    constructor() {
        this.experience = window.experience;
        this.active = window.location.search.includes('mode=debug');

        if (this.active) {
            this.pane = new Pane();
            
            // Performance
            this.perf = new ThreePerf({
                anchorX: 'left',
                anchorY: 'top',
                domElement: document.body,
                renderer: this.experience.renderer.instance
            });
            
            this.setupDebug();
        }
    }

    setupDebug() {
        const particlesFolder = this.pane.addFolder({ title: 'Particles' });
        
        // Ensure ParticleSystem is ready before we bind to its uniforms
        const waitForParticles = setInterval(() => {
            if (this.experience.particles && this.experience.particles.velocityUniforms) {
                clearInterval(waitForParticles);
                
                particlesFolder.addBinding({ count: 16384 }, 'count', { readonly: true });
                
                particlesFolder.addBinding(
                    this.experience.particles.velocityUniforms.uFlowFieldStrength,
                    'value',
                    { label: 'uFlowFieldStrength', min: 0, max: 2, step: 0.01 }
                );
                
                particlesFolder.addBinding(
                    this.experience.particles.velocityUniforms.uFlowFieldFrequency,
                    'value',
                    { label: 'uFlowFieldFrequency', min: 0.1, max: 3, step: 0.05 }
                );
                
                particlesFolder.addBinding(
                    this.experience.particles.velocityUniforms.uFlowFieldInfluence,
                    'value',
                    { label: 'uFlowFieldInfluence', min: 0, max: 1, step: 0.01 }
                );
                
                particlesFolder.addBinding(
                    this.experience.particles.velocityUniforms.uWebAttraction,
                    'value',
                    { label: 'uWebAttraction', min: 0, max: 1, step: 0.01 }
                );
                
                particlesFolder.addBinding(
                    this.experience.particles.material.uniforms.uParticleSize,
                    'value',
                    { label: 'uParticleSize', min: 0.5, max: 8, step: 0.1 }
                );
            }
        }, 100);

        const bloomFolder = this.pane.addFolder({ title: 'Bloom' });
        const waitForPostFX = setInterval(() => {
            if (this.experience.postProcessing) {
                clearInterval(waitForPostFX);
                const bp = this.experience.postProcessing.bloomPass;
                
                bloomFolder.addBinding(bp, 'strength', { min: 0, max: 3, step: 0.05 });
                bloomFolder.addBinding(bp, 'threshold', { min: 0, max: 1, step: 0.01 });
                bloomFolder.addBinding(bp, 'radius', { min: 0, max: 2, step: 0.05 });
                
                const spiderSenseFolder = this.pane.addFolder({ title: 'Spider-Sense' });
                
                spiderSenseFolder.addBinding(
                    this.experience.postProcessing.vignettePass.uniforms.uStrength,
                    'value',
                    { label: 'vignetteStrength', min: 0, max: 1, step: 0.01 }
                );
                
                spiderSenseFolder.addBinding(
                    this.experience.postProcessing.chromaticPass.uniforms.uStrength,
                    'value',
                    { label: 'chromaticStrength', min: 0, max: 0.02, step: 0.001 }
                );
                
                spiderSenseFolder.addBinding(
                    this.experience.postProcessing.motionBlurPass.uniforms.uStrength,
                    'value',
                    { label: 'motionBlurStrength', min: 0, max: 1, step: 0.05 }
                );
            }
        }, 100);

        const lightingFolder = this.pane.addFolder({ title: 'Lighting' });
        lightingFolder.addBinding(
            this.experience.lights.directionalLight,
            'intensity',
            { label: 'redLightIntensity', min: 0, max: 5 }
        );
        lightingFolder.addBinding(
            this.experience.lights.pointLight,
            'intensity',
            { label: 'blueLightIntensity', min: 0, max: 3 }
        );
        lightingFolder.addBinding(
            this.experience.lights.rectLight,
            'intensity',
            { label: 'rimLightIntensity', min: 0, max: 2 }
        );
    }

    update() {
        if (this.active && this.perf) {
            this.perf.begin();
            this.perf.end();
        }
    }
}
