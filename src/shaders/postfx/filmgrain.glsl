uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uIntensity;

varying vec2 vUv;

// Pseudo-random generator
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    
    // Add pseudo-random noise based on gl_FragCoord and uTime
    vec2 noiseUv = vUv * gl_FragCoord.xy + uTime;
    float noise = (random(noiseUv) - 0.5) * 2.0;
    
    // Mix noise into color
    color.rgb += noise * uIntensity;
    
    gl_FragColor = color;
}
