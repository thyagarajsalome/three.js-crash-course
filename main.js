import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";

export default {
  base: "./",
  build: {
    outDir: "dist",
  },
};

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector(".webgl"),
  antialias: true,
});

// Responsive setup
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Texture loader
const textureLoader = new THREE.TextureLoader();

const texture = textureLoader.load("public/texture/earth.jpg");
const cloudMap = textureLoader.load("public/texture/cloud.jpg");
const bump = textureLoader.load("public/texture/bump.jpg");
const specularMap = textureLoader.load("public/texture/reflection.jpg");
const milkyWayTexture = textureLoader.load("public/texture/milky_way.jpg");

// Milky Way background
const milkyWayGeometry = new THREE.SphereGeometry(500, 60, 40);
const milkyWayMaterial = new THREE.MeshBasicMaterial({
  map: milkyWayTexture,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.3,
});
const milkyWay = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
scene.add(milkyWay);

// Create Earth Group to hold both outer and inner spheres
const earthGroup = new THREE.Group();
scene.add(earthGroup);

// Outer Earth sphere
const outerRadius = 3;
const earthGeometry = new THREE.SphereGeometry(outerRadius, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
  map: texture,
  bumpMap: bump,
  bumpScale: -0.4,
  specularMap: specularMap,
  specular: new THREE.Color("grey"),
  shininess: 5,
  side: THREE.FrontSide, // Only render outside
});
const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earthMesh);

// Inner Earth sphere (slightly smaller and darker)
const thickness = 0.1; // Thickness of the Earth's shell
const innerRadius = outerRadius - thickness;
const innerEarthGeometry = new THREE.SphereGeometry(innerRadius, 64, 64);
const innerEarthMaterial = new THREE.MeshPhongMaterial({
  map: texture,
  bumpMap: bump,
  bumpScale: -0.4,
  specularMap: specularMap,
  specular: new THREE.Color("grey"),
  shininess: 5,
  side: THREE.BackSide, // Only render inside
  color: new THREE.Color(0x666666), // Darker color for inner surface
});
const innerEarthMesh = new THREE.Mesh(innerEarthGeometry, innerEarthMaterial);
earthGroup.add(innerEarthMesh);

// Cloud layer
const cloudGeometry = new THREE.SphereGeometry(outerRadius + 0.01, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
  map: cloudMap,
  transparent: true,
  opacity: 0.4,
});
const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
earthGroup.add(cloudMesh);

// Enhanced Earth glow
const glowGeometry = new THREE.SphereGeometry(5.5, 64, 64);
const glowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    c: { type: "f", value: 0.3 },
    p: { type: "f", value: 3.5 },
    glowColor: { type: "c", value: new THREE.Color(0x00ffff) },
    viewVector: { type: "v3", value: camera.position },
  },
  vertexShader: `
    uniform vec3 viewVector;
    varying float intensity;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
      intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    varying float intensity;
    void main() {
      vec3 glow = glowColor * intensity;
      gl_FragColor = vec4( glow, 1.0 );
    }
  `,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
});

const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glowMesh);

// Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.03, 24, 24);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Camera positioning
camera.position.z = 10;

// Renderer setup
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 70);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
scene.add(ambientLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  earthGroup.rotation.y += 0.0005;
  cloudMesh.rotation.y += 0.0007;
  milkyWay.rotation.y += 0.0001;

  // Update glow
  glowMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
    camera.position,
    glowMesh.position
  );

  renderer.render(scene, camera);
}

// Responsive resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

// GSAP Animations
const tl = gsap.timeline({ defaults: { duration: 1 } });
tl.fromTo(earthGroup.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
tl.fromTo("nav", { y: "-100%" }, { y: "0%" });
tl.fromTo(".title", { opacity: 0 }, { opacity: 1 });

// Mobile menu toggle
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector("nav ul").classList.toggle("active");
});

animate();
