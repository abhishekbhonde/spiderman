uniform sampler2D tDiffuse;
uniform float uStrength;
uniform float uSpiderSense;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    
    // Compute distance from center
    float d = length(vUv - 0.5) * 2.0;
    
    // Spider-sense mode parameters
    float strength = mix(uStrength, 0.85, uSpiderSense);
    vec3 vignetteColor = mix(vec3(0.0), vec3(0.3, 0.0, 0.0), uSpiderSense);
    
    // Apply vignette
    float v = pow(d, 2.0) * strength;
    v = clamp(v, 0.0, 1.0);
    
    color.rgb = mix(color.rgb, vignetteColor, v);
    
    gl_FragColor = color;
}
