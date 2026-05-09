uniform sampler2D tDiffuse;
uniform float uStrength;
uniform float uSpiderSense;

varying vec2 vUv;

void main() {
    float strength = uStrength + (uSpiderSense * 0.008);
    
    vec4 color;
    color.r = texture2D(tDiffuse, vec2(vUv.x + strength, vUv.y)).r;
    color.g = texture2D(tDiffuse, vUv).g;
    color.b = texture2D(tDiffuse, vec2(vUv.x - strength, vUv.y)).b;
    color.a = texture2D(tDiffuse, vUv).a;
    
    gl_FragColor = color;
}
