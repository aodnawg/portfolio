import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import * as THREE from "three";

const computeShaderVelocity = `
#include <common>
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float idParticle = uv.y * resolution.x + uv.x;
  vec4 tmpVel = texture2D( textureVelocity, uv );
  vec3 vel = tmpVel.xyz;

  gl_FragColor = vec4( vel.xyz, 1.0 );
}`;

const computeShaderPosition = `
// 現在の位置情報を決定する
#define delta ( 1.0 / 60.0 )
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tmpPos = texture2D( texturePosition, uv );
  vec3 pos = tmpPos.xyz;
  vec4 tmpVel = texture2D( textureVelocity, uv );
  // velが移動する方向(もう一つ下のcomputeShaderVelocityを参照)
  vec3 vel = tmpVel.xyz;

  // 移動する方向に速度を掛け合わせた数値を現在地に加える。
  pos += vel * delta;
  gl_FragColor = vec4( pos, 1.0 );
}`;

const particleVertexShader = `
#include <common>
uniform sampler2D texturePosition;
uniform float cameraConstant;
uniform float density;
varying vec4 vColor;
varying vec2 vUv;
uniform float radius;
void main() {
  vec4 posTemp = texture2D( texturePosition, uv );
  vec3 pos = posTemp.xyz;
  vColor = vec4( .5, .5, .5, 1.0 );

  // ポイントのサイズを決定
  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  gl_PointSize = 0.5 * cameraConstant / ( - mvPosition.z );

  // uv情報の引き渡し
  vUv = uv;

  // 変換して格納
  gl_Position = projectionMatrix * mvPosition;
}`;

const particleFragmentShader = `
// VertexShaderから受け取った色を格納するだけ。
varying vec4 vColor;
void main() {
  // 丸い形に色をぬるための計算
  float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
  if ( f > 0.1 ) {
      discard;
  }
  gl_FragColor = vColor;
}
`;

const WIDTH = 500;
const PARTICLES = WIDTH * WIDTH;

const fillTextures = (
  texturePosition: THREE.DataTexture,
  textureVelocity: THREE.DataTexture
) => {
  const posArray = texturePosition.image.data;
  const velArray = textureVelocity.image.data;
  for (let i = 0; i < posArray.length; i++) {
    const x = Math.random() * 500 - 250;
    const y = 0;
    const z = Math.random() * 500 - 250;
    posArray[i] = x;
    posArray[i + 1] = y;
    posArray[i + 2] = z;
    posArray[i + 3] = 0;

    velArray[i] = Math.random() * 2 - 1;
    velArray[i + 1] = Math.random() * 2 - 1;
    velArray[i + 2] = Math.random() * 2 - 1;
    velArray[i + 3] = Math.random() * 2 - 1;
  }
};

const initComputeRenderer = (renderer: THREE.WebGLRenderer) => {
  const gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

  const dtPosition = gpuCompute.createTexture();
  const dtVelocity = gpuCompute.createTexture();

  //
  fillTextures(dtPosition, dtVelocity);

  // shaderプログラムのアタッチ
  const velocityVariable = gpuCompute.addVariable(
    "textureVelocity",
    computeShaderVelocity,
    dtVelocity
  );
  const positionVariable = gpuCompute.addVariable(
    "texturePosition",
    computeShaderPosition,
    dtPosition
  );

  // 一連の関係性を構築するためのおまじない
  gpuCompute.setVariableDependencies(velocityVariable, [
    positionVariable,
    velocityVariable,
  ]);
  gpuCompute.setVariableDependencies(positionVariable, [
    positionVariable,
    velocityVariable,
  ]);

  gpuCompute.init();

  return { gpuCompute, velocityVariable, positionVariable };
};

// カメラオブジェクトからシェーダーに渡したい情報を引っ張ってくる関数
// カメラからパーティクルがどれだけ離れてるかを計算し、パーティクルの大きさを決定するため。
const getCameraConstant = (camera: THREE.PerspectiveCamera) => {
  return (
    window.innerHeight /
    (Math.tan(THREE.MathUtils.DEG2RAD * 0.5 * camera.fov) / camera.zoom)
  );
};

const initPosition = (camera: THREE.PerspectiveCamera) => {
  // 最終的に計算された結果を反映するためのオブジェクト。
  // 位置情報はShader側(texturePosition, textureVelocity)
  // で決定されるので、以下のように適当にうめちゃってOK

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLES * 3);
  let p = 0;
  for (let i = 0; i < PARTICLES; i++) {
    positions[p++] = 0;
    positions[p++] = 0;
    positions[p++] = 0;
  }

  // uv情報の決定。テクスチャから情報を取り出すときに必要
  let uvs = new Float32Array(PARTICLES * 2);
  p = 0;
  for (let j = 0; j < WIDTH; j++) {
    for (let i = 0; i < WIDTH; i++) {
      uvs[p++] = i / (WIDTH - 1);
      uvs[p++] = j / (WIDTH - 1);
    }
  }

  // attributeをgeometryに登録する
  geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute("uv", new THREE.BufferAttribute(uvs, 2));

  // uniform変数をオブジェクトで定義
  // 今回はカメラをマウスでいじれるように、計算に必要な情報もわたす。
  const particleUniforms = {
    texturePosition: { value: null },
    textureVelocity: { value: null },
    cameraConstant: { value: getCameraConstant(camera) },
  };

  // Shaderマテリアル これはパーティクルそのものの描写に必要なシェーダー
  const material = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
  });
  material.extensions.drawBuffers = true;
  const particles = new THREE.Points(geometry, material);
  particles.matrixAutoUpdate = false;
  particles.updateMatrix();

  // パーティクルをシーンに追加
  return { particles, particleUniforms };
};

export const makeParticles = (
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera
) => {
  const {
    gpuCompute,
    positionVariable,
    velocityVariable,
  } = initComputeRenderer(renderer);
  const { particles, particleUniforms } = initPosition(camera);

  const updateParticle = () => {
    gpuCompute.compute();
    particleUniforms.texturePosition.value = (gpuCompute.getCurrentRenderTarget(
      positionVariable
    ) as any).texture;
    particleUniforms.textureVelocity.value = (gpuCompute.getCurrentRenderTarget(
      velocityVariable
    ) as any).texture;
  };
  return { particles, updateParticle };
};
