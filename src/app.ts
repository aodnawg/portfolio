import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GlitchPass } from "./glitchPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

let scene: THREE.Scene;
let camera: THREE.Camera, width, height;
let rainDropVelocitys: THREE.Vector3[];
let rainGeo: THREE.Geometry;
let renderer: THREE.WebGLRenderer;
let europa: THREE.Mesh | undefined;
let composer: EffectComposer;
let rain: THREE.Points;
let textures: THREE.Texture[];
let europaMat: THREE.MeshLambertMaterial;
let isGlitch: number = 0;
let glitchPass: GlitchPass;

const loadTextures = async <T extends string[]>(
  loader: THREE.TextureLoader,
  paths: T,
  cb: (textures: THREE.Texture[]) => void
) => {
  console.log("loadTextures");
  const textures: any[] = [];
  const load = () => {
    const target = paths.shift()!;
    if (!target) {
      cb(textures);
    }

    loader.load(target, (tex) => {
      console.log(tex);
      textures.push(tex);
      load();
    });
  };
  load();
};

const init = () => {
  console.log("init");

  width = window.innerWidth;
  height = window.innerHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, width / height);
  camera.position.y = -10;
  camera.position.z = 10;

  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const ambient = new THREE.AmbientLight();
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(0, -1, 0);
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.setClearColor(0xffffff);

  // rain
  rainGeo = new THREE.Geometry();
  rainDropVelocitys = [];
  for (let i = 0; i <= 10000; i++) {
    const rainDrop = new THREE.Vector3(
      Math.random() * 100 - 50,
      Math.random() * 500 - 250,
      Math.random() * 100 - 50
    );
    rainDropVelocitys.push(
      new THREE.Vector3(0, -(0.2 + Math.random()) * 0.3, 0)
    );
    rainGeo.vertices.push(rainDrop);
  }
  const rainMaterial = new THREE.PointsMaterial({
    color: 0x000000,
    size: 0.1,
    transparent: true,
    opacity: 0.5,
  });
  rain = new THREE.Points(rainGeo, rainMaterial);
  scene.add(rain);

  // europa
  loadTextures(
    new THREE.TextureLoader(),
    ["./europa.jpg", "./moon.jpg"],
    (textures_) => {
      textures = textures_;
      const europaGeo = new THREE.SphereGeometry(3, 128, 128);
      europaMat = new THREE.MeshLambertMaterial({ map: textures[1] });
      europa = new THREE.Mesh(europaGeo, europaMat);
      europa.position.set(0, 0, 0);
      scene.add(europa);
    }
  );

  const container = document.body;
  container.appendChild(renderer.domElement);

  // post process
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const fxaaPass = new ShaderPass(FXAAShader);
  glitchPass = new GlitchPass();

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.1,
    0.1,
    0.9
  );
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(fxaaPass);
  composer.addPass(glitchPass);
  composer.render();
};

const animate = () => {
  if (rainGeo && rainDropVelocitys) {
    rainGeo.vertices.forEach((p, i) => {
      p.add(rainDropVelocitys[i]);
      if (p.y < -200) {
        p.y = 200;
      }
    });
  }
  rainGeo.verticesNeedUpdate = true;
  rain.position.z += 0.1;
  if (rain.position.z > 50) {
    rain.position.z = -50;
  }

  if (europa) {
    europa.rotation.y += 0.001;
  }

  isGlitch -= 0.05;
  isGlitch = THREE.MathUtils.clamp(isGlitch, 0, 1);
  if (isGlitch > 0) {
    glitchPass.enabled = true;
  } else {
    glitchPass.enabled = false;
  }
  console.log(glitchPass.enabled, isGlitch);
  composer.render();

  requestAnimationFrame(animate);
};

const main = () => {
  init();
  animate();

  let texIdx = 0;
  document.body.addEventListener("click", () => {
    const toggoleSat = () => {
      if (isGlitch > 0) return;
      if (texIdx === 0) {
        texIdx = 1;
      } else {
        texIdx = 0;
      }
    };
    toggoleSat();
    europaMat.map = textures[texIdx];
    isGlitch = 1;
  });
};
main();
