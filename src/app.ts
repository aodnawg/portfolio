import * as THREE from "three";
import { Vector3 } from "three";

let scene: THREE.Scene;
let camera: THREE.Camera, width, height;
let rainDropVelocitys: THREE.Vector3[];
let rainGeo: THREE.Geometry;
let renderer: THREE.WebGLRenderer;
let europa: THREE.Mesh | undefined;

const init = () => {
  width = window.innerWidth;

  height = window.innerHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, width / height);
  camera.position.y = -10;
  camera.position.z = 10;

  camera.lookAt(new Vector3(0, 0, 0));

  const ambient = new THREE.AmbientLight();
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xeeeeff);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.setClearColor(0xffffff);

  // rain

  rainGeo = new THREE.Geometry();
  rainDropVelocitys = [];
  for (let i = 0; i <= 10000; i++) {
    const rainDrop = new THREE.Vector3(
      Math.random() * 400 - 200,
      Math.random() * 500 - 250,
      Math.random() * 400 - 200
    );
    rainDropVelocitys.push(new THREE.Vector3(0, -Math.random(), 0));
    rainGeo.vertices.push(rainDrop);
  }

  const rainMaterial = new THREE.PointsMaterial({
    color: 0x000000,
    size: 0.3,
    transparent: true,
    opacity: 0.3,
  });

  const rain = new THREE.Points(rainGeo, rainMaterial);
  scene.add(rain);

  // europa
  const loader = new THREE.TextureLoader();
  loader.load("./europa.jpg", (map) => {
    const europaGeo = new THREE.SphereGeometry(3, 128, 128);
    const europaMat = new THREE.MeshLambertMaterial({ map });
    europa = new THREE.Mesh(europaGeo, europaMat);
    europa.position.set(0, 0, 0);
    scene.add(europa);
  });

  const container = document.body;
  container.appendChild(renderer.domElement);

  renderer.render(scene, camera);
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

  renderer.render(scene, camera);

  if (europa) {
    europa.rotation.y += 0.001;
  }

  requestAnimationFrame(animate);
};

const main = () => {
  init();
  animate();
};
main();
