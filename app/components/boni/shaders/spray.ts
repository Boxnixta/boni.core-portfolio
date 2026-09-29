// Spray noise shader (PGS Task 04.02), inspired by the spray photo "Sans titre" by Sébastien Fraysse.
// Mouse = a hand that pushes the spray away. Original, fully commented file:
// lecture_ss26_procedural_generation_and_simulation / gizycki / code / noise-randomness_gizycki.glsl
const spray = `#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 coord = gl_FragCoord.xy / u_resolution.xy;
    coord.x *= u_resolution.x / u_resolution.y;
    
    vec2 mouse = u_mouse / u_resolution.xy;
    mouse.x *= u_resolution.x / u_resolution.y;
    
    vec2 center = vec2(0.5 * (u_resolution.x / u_resolution.y), 0.5);
    
    // Maus drückt den Spray weg
    vec2 toMouse = coord - mouse;
    float distToMouse = length(toMouse);
    vec2 displacedCoord = coord - normalize(toMouse + 0.0001) * smoothstep(0.25, 0.0, distToMouse) * 0.15;
    
    // Organische Blob-Form um die Mitte
    vec2 toCenter = displacedCoord - center;
    float wobble = sin(toCenter.x * 8.0 + u_time * 0.3) * 0.02
                 + sin(toCenter.y * 6.0 - u_time * 0.2) * 0.02;
    float blobRadius = 0.2 + wobble;
    
    // Sprühdichte fällt vom Zentrum nach außen ab
    float density = 1.0 - smoothstep(0.0, blobRadius * 1.8, length(displacedCoord - center - vec2(0.05, 0.04)));
    density *= smoothstep(blobRadius * 2.2, blobRadius * 1.5, length(toCenter));
    density = clamp(density, 0.0, 1.0);
    
    // Noise erzeugt die körnige Spray-Textur
    float n = hash(displacedCoord * 50.0 + sin(u_time * 0.0005) * 0.01);
    float spray = step(pow(1.0 - density, 1.5), n);
    
    // Maus-Aussparung, asymmetrisch zur Bildmitte
    float towardsCenter = dot(normalize(toMouse + 0.0001), normalize(center - mouse + 0.0001));
    float mouseClear = smoothstep(0.04 + towardsCenter * 0.03, 0.1 + towardsCenter * 0.03, distToMouse);
    spray *= mouseClear;
    
    vec3 color = mix(vec3(1.0), vec3(0.9, 0.1, 0.15), spray);
    gl_FragColor = vec4(color, 1.0);
}
`;

export default spray;
