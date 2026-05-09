uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;
uniform float uTime;
uniform float uParticleSize;
uniform float uPixelRatio;
uniform float uSpiderSense;

attribute vec2 aParticleUV;

varying vec3 vVelocity;
varying float vSpeed;
varying vec2 vUv;

void main() {
    vec4 pos = texture2D(uPositionTexture, aParticleUV);
    vec4 vel = texture2D(uVelocityTexture, aParticleUV);
    
    vVelocity = vel.xyz;
    vSpeed = length(vel.xyz);
    vUv = aParticleUV;

    vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float sizeBySpeed = mix(1.0, 2.5, clamp(vSpeed / 2.0, 0.0, 1.0));
    float spiderSenseBoost = mix(1.0, 1.8, uSpiderSense);
    
    gl_PointSize = uParticleSize * sizeBySpeed * spiderSenseBoost * uPixelRatio * (1.0 / -mvPosition.z);
}
