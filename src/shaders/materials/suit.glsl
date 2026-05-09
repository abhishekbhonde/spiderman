varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

#ifdef VERTEX
void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
}
#endif

#ifdef FRAGMENT
uniform vec3 uDirectionalLightDir;
uniform vec3 uDirectionalLightColor;
uniform vec3 uAmbientColor;

void main() {
    // Colors
    vec3 spiderRed = vec3(0.8, 0.0, 0.0);
    vec3 spiderBlue = vec3(0.0, 0.24, 0.65);
    vec3 silkWhite = vec3(0.95, 0.95, 1.0);
    vec3 black = vec3(0.0);
    
    // Red Mask (pseudo UV based mapping)
    // For a real model, this would be a texture mask, but here we estimate
    float redMask = step(0.5, fract(vUv.y * 2.0));
    vec3 baseColor = mix(spiderBlue, spiderRed, redMask);
    
    // Web Pattern
    // Simple procedural web: lines radiating and concentric rings
    vec2 webUv = fract(vUv * 10.0) - 0.5;
    float dist = length(webUv);
    float angle = atan(webUv.y, webUv.x);
    
    // Radiating lines
    float radiating = step(0.95, cos(angle * 6.0));
    // Concentric rings
    float rings = step(0.9, fract(dist * 10.0));
    
    float webLine = clamp(radiating + rings, 0.0, 1.0);
    
    // Only apply webs to red areas
    webLine *= redMask;
    
    vec3 finalColor = mix(baseColor, black, webLine * 0.6);
    
    // Lighting setup
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(-vPosition);
    
    // Directional
    float nDotL = max(dot(normal, uDirectionalLightDir), 0.0);
    vec3 diffuse = uDirectionalLightColor * nDotL;
    
    // Ambient
    vec3 ambient = uAmbientColor;
    
    // Fresnel Rim
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    vec3 rimLight = silkWhite * fresnel * 0.4;
    
    // Apply lighting
    finalColor = finalColor * (diffuse + ambient) + rimLight;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
#endif
