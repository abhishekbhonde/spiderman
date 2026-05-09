uniform sampler2D tDiffuse;
uniform sampler2D tVelocity;
uniform float uStrength;
uniform float uSpiderSense;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    
    // Simplification for radial blur instead of true velocity buffer
    // since we only have particle velocities in GPGPU, not screen-space velocity map
    if (uSpiderSense > 0.0) {
        vec2 center = vec2(0.5, 0.5);
        vec2 dir = vUv - center;
        float dist = length(dir);
        dir = normalize(dir);
        
        vec4 radialColor = vec4(0.0);
        float radialStrength = 0.015 * uSpiderSense;
        
        for (int i = 0; i < 6; i++) {
            float offset = float(i) * radialStrength;
            radialColor += texture2D(tDiffuse, vUv - dir * offset);
        }
        
        radialColor /= 6.0;
        
        // Blend original with radial based on distance from center
        float blend = smoothstep(0.0, 0.8, dist);
        color = mix(color, radialColor, blend * uSpiderSense);
    }
    
    gl_FragColor = color;
}
