import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GlitchPass } from "./glitchPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

import { makeParticles } from "./particle";
import { Camera } from "three";

let isGlitch: number = 0;
let updateParticle: any;

const loadTextures = async <T extends string[]>(
  loader: THREE.TextureLoader,
  paths: T,
  cb: (textures: THREE.Texture[]) => void
) => {
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

const getWindowSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return { width, height };
};

const makeRain = () => {
  const rainGeo = new THREE.Geometry();
  const rainDropVelocitys = [];
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
  const rain = new THREE.Points(rainGeo, rainMaterial);

  const updateRain = () => {
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
  };

  return { rain, updateRain };
};

const makeEuropa = (cb: (europa: THREE.Mesh) => void) => {
  const europaGeo = new THREE.SphereGeometry(20, 128, 128);
  const europaMat = new THREE.MeshLambertMaterial({});
  const europa = new THREE.Mesh(europaGeo, europaMat);
  let textures: THREE.Texture[] = [];
  europa.position.set(0, 0, 0);
  loadTextures(
    new THREE.TextureLoader(),
    ["./europa.jpg", "./moon.jpg"],
    (textures_) => {
      textures_.forEach((t) => textures.push(t));
      europaMat.map = textures[0];
      cb(europa);
      // scene.add(europa);
    }
  );

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
    if (textures && textures.length) {
      europa.material.map = textures[texIdx];
      isGlitch = 1;
    }
  });

  const updateEuropa = () => {
    europa.rotation.y += 0.001;
  };

  return { europa, updateEuropa };
};

const makeCamera = (width: number, height: number) => {
  const camera = new THREE.PerspectiveCamera(50, width / height);
  camera.position.y = 0;
  camera.position.z = 100;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  return camera;
};

const init = () => {
  const scene = new THREE.Scene();
  const { height, width } = getWindowSize();
  const camera = makeCamera(width, height);

  const ambient = new THREE.AmbientLight();
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
  directionalLight.position.set(0, -1, 0);
  scene.add(directionalLight);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.setClearColor(0xffffff);

  const { rain, updateRain } = makeRain();

  // rain
  scene.add(rain);

  // europa
  const { updateEuropa } = makeEuropa((europa) => scene.add(europa));

  const container = document.getElementById("visual");
  container.appendChild(renderer.domElement);

  // particle
  const { particles, updateParticle: updateParticle_ } = makeParticles(
    renderer,
    camera
  );
  scene.add(particles);
  updateParticle = () => {
    updateParticle_();
  };

  // post process
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const fxaaPass = new ShaderPass(FXAAShader);
  const glitchPass = new GlitchPass();

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

  return {
    camera,
    renderer,
    updateRain,
    updateEuropa,
    composer,
    rain,
    glitchPass,
  };
};

const animate = ({
  updateRain,
  updateEuropa,
  composer,
  rain,
  glitchPass,
  camera,
}) => {
  updateRain();
  updateEuropa();

  updateParticle();

  isGlitch -= 0.05;
  isGlitch = THREE.MathUtils.clamp(isGlitch, 0, 1);
  if (isGlitch > 0) {
    glitchPass.enabled = true;
  } else {
    glitchPass.enabled = false;
  }
  composer.render();

  requestAnimationFrame(() =>
    animate({ camera, updateRain, updateEuropa, composer, rain, glitchPass })
  );
};

const resize = (renderer: THREE.WebGLRenderer) => {
  const { height, width } = getWindowSize();
  renderer.setSize(width, height);
  window.addEventListener("resize", () => {
    console.log("set size");
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

export const mount = () => {
  const container = document.createElement("div");
  container.setAttribute("id", "visual");
  container.setAttribute(
    "style",
    `
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index; -1;
  `
  );
  document.body.appendChild(container);

  const {
    camera,
    renderer,
    updateRain,
    updateEuropa,
    composer,
    rain,
    glitchPass,
  } = init();
  resize(renderer);
  animate({ camera, updateRain, updateEuropa, composer, rain, glitchPass });
};
