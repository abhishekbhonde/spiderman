uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uTime;
uniform float uSpiderSense;

varying vec2 vUv;

// Helper for halftone pattern
float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    float brightness = luma(color.rgb);
    
    // 1. Halftone Pattern (Comic Book Dots)
    float dotSize = 4.0;
    vec2 detailUv = vUv * uResolution / dotSize;
    vec2 grid = fract(detailUv) - 0.5;
    float dist = length(grid);
    
    // Only apply halftone in darker areas (shadows)
    float halfToneThreshold = 0.5;
    float dotMask = smoothstep(0.4, 0.45, dist + brightness * 0.8);
    
    vec3 halftoneColor = mix(color.rgb * 0.5, color.rgb, dotMask);
    
    // 2. Simple Edge Detection (Outline)
    float offset = 1.0 / uResolution.x;
    vec4 n = texture2D(tDiffuse, vUv + vec2(0.0, offset));
    vec4 s = texture2D(tDiffuse, vUv + vec2(0.0, -offset));
    vec4 e = texture2D(tDiffuse, vUv + vec2(offset, 0.0));
    vec4 w = texture2D(tDiffuse, vUv + vec2(-offset, 0.0));
    
    float diff = length(color - n) + length(color - s) + length(color - e) + length(color - w);
    float edge = smoothstep(0.1, 0.3, diff);
    
    // Apply thick black outlines
    vec3 finalColor = mix(halftoneColor, vec3(0.0), edge * 0.8);
    
    // 3. Spider-Verse Saturation Boost
    finalColor = mix(finalColor, finalColor * 1.5, 0.2); // Subtle boost
    
    // Spider-Sense Intensifies the effect
    float senseEffect = uSpiderSense * 0.5;
    finalColor = mix(finalColor, finalColor * vec3(1.2, 0.8, 0.8), senseEffect);
    
    gl_FragColor = vec4(finalColor, color.a);
}
