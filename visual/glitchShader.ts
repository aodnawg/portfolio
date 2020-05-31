import * as THREE from "three";

export const glitchShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.5 },
    resolution: { value: new THREE.Vector2(1 / 1024, 1 / 512) },
  },

  vertexShader: [
    "varying vec2 vUv;",

    "void main() {",

    "	vUv = uv;",
    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}",
  ].join("\n"),

  fragmentShader: `
  varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float time;
void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  color = vec4(fract(time));
  gl_FragColor = color;
}`,
};
