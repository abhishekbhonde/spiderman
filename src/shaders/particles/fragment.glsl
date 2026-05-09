varying vec3 vVelocity;
varying float vSpeed;
varying vec2 vUv;

uniform float uTime;
uniform float uSpiderSense;

void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);

    float shimmer = sin(uTime * 4.0 + vUv.x * 30.0 + vUv.y * 20.0) * 0.5 + 0.5;
    
    vec3 spiderRed  = vec3(0.8, 0.0, 0.0);
    vec3 spiderBlue = vec3(0.0, 0.24, 0.65);
    vec3 silkWhite  = vec3(0.95, 0.95, 1.0);

    float normalizedSpeed = clamp(vSpeed / 2.0, 0.0, 1.0);
    vec3 baseColor = mix(silkWhite, spiderRed, normalizedSpeed);
    baseColor = mix(baseColor, spiderBlue, shimmer * 0.3 * (1.0 - normalizedSpeed));

    vec3 spiderSenseColor = mix(silkWhite, spiderRed, 0.8);
    vec3 finalColor = mix(baseColor, spiderSenseColor, uSpiderSense);

    gl_FragColor = vec4(finalColor, alpha * mix(0.7, 1.0, normalizedSpeed));
}
