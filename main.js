import * as THREE from "three";

// Scene
const scene = new THREE.Scene();

// Create a sphere
const geometry = new THREE.SphereGeometry(3, 64, 64);
const material = new THREE.MeshStandardMaterial({
  color: "#00ff83",
  roughness: 0.5,
  metalness: 0.1,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Light
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 10, 10); // Adjusted position
pointLight.intensity = 100; // Increased intensity
scene.add(pointLight);

// Camera
const camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 100);
camera.position.z = 10;
scene.add(camera);

// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(800, 600);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the sphere
  mesh.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
