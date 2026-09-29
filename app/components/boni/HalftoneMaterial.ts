import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

/*
  Halftone shader: the surface is drawn as a grid of dots.
  Dots are large where the surface faces the camera and shrink
  towards the silhouette, which gives the comic/print look.
*/
const HalftoneMaterial = shaderMaterial(
    {
        color: new THREE.Color("#FFB7C5"),
        dotSize: 3.0,
    },
    /* glsl vertex */ `
    varying vec3 vNormal;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    /* glsl fragment */ `
    uniform vec3 color;
    uniform float dotSize;
    varying vec3 vNormal;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        // 1.0 = surface faces the camera, 0.0 = edge
        float facing = clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
        float radius = pow(facing, 1.5) * 0.80;

        vec2 cell = floor(gl_FragCoord.xy / dotSize);
        vec2 grid = fract(gl_FragCoord.xy / dotSize);
        vec2 jitter = vec2(random(cell) * 0.2 - 0.1, random(cell + 7.3) * 0.2 - 0.1);

        if (length(grid - 0.5 + jitter) > radius) discard;

        float brightness = clamp(dot(vNormal, normalize(vec3(0.5, 1.0, 1.0))) * 0.5 + 0.6, 0.3, 1.0);
        gl_FragColor = vec4(color * brightness, 1.0);
    }
    `
);

export default HalftoneMaterial;
