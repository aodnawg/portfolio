import * as THREE from "three";

let scene: THREE.Scene;
let camera: THREE.Camera, width, height;
let rainDropVelocitys: number[];
let rainGeo: THREE.Geometry;
let renderer: THREE.WebGLRenderer;

const init = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();
  camera.position.z = 1;
  camera.rotation.x = 1.16;
  camera.rotation.y = -0.12;
  camera.rotation.z = -0.27;

  const ambient = new THREE.AmbientLight();
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xeeeeff);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);

  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.setClearColor(0xffffff);

  rainGeo = new THREE.Geometry();
  rainDropVelocitys = [];
  for (let i = 0; i <= 10000; i++) {
    const rainDrop = new THREE.Vector3(
      Math.random() * 400 - 200,
      Math.random() * 500 - 250,
      Math.random() * 400 - 200
    );
    rainDropVelocitys.push(2 + Math.random() * 3);
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

  const container = document.body;
  container.appendChild(renderer.domElement);

  renderer.render(scene, camera);
};

const animate = () => {
  if (rainGeo && rainDropVelocitys) {
    rainGeo.vertices.forEach((p, i) => {
      p.y -= rainDropVelocitys[i];
      if (p.y < -200) {
        p.y = 200;
      }
    });
  }
  rainGeo.verticesNeedUpdate = true;

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
};

const main = () => {
  init();
  animate();
};
main();
