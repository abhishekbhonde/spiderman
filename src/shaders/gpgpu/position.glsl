uniform float uTime;
uniform float uDelta;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 vel = texture2D(textureVelocity, uv);
    
    // Update position
    pos.xyz += vel.xyz * uDelta * 2.0;
    
    gl_FragColor = pos;
}
