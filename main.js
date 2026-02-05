// =======================
// 基础 Three.js 场景
// =======================
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// =======================
// 光照（沙漠强光）
// =======================
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 100, -50);
scene.add(sun);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// =======================
// 地面（沙漠）
// =======================
const groundGeo = new THREE.PlaneGeometry(200, 5000);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0xdeb887
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.z = -2000;
scene.add(ground);

// =======================
// 骆驼（3D 占位模型，可替换 GLTF）
// =======================
const camel = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 1, 3),
  new THREE.MeshStandardMaterial({ color: 0xc2a26a })
);
body.position.y = 1.2;

const hump = new THREE.Mesh(
  new THREE.SphereGeometry(0.6, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xb8965a })
);
hump.position.set(0, 1.8, -0.3);

const head = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.6, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xc2a26a })
);
head.position.set(0, 1.5, 1.8);

camel.add(body, hump, head);
camel.position.y = 0;
scene.add(camel);

// =======================
// 相机
// =======================
camera.position.set(0, 4, 6);
camera.lookAt(0, 1.5, 0);

// =======================
// 跑酷参数
// =======================
let speed = 0.35;
let gravity = 0.02;
let velocityY = 0;
let isJumping = false;

let lanes = [-2, 0, 2];
let currentLane = 1;

let score = 0;

// =======================
// 障碍物
// =======================
const obstacles = [];

function spawnObstacle() {
  const geo = new THREE.CylinderGeometry(0.4, 0.6, 2, 8);
  const mat = new THREE.MeshStandardMaterial({ color: 0x2f4f4f });
  const obs = new THREE.Mesh(geo, mat);

  obs.position.x = lanes[Math.floor(Math.random() * 3)];
  obs.position.y = 1;
  obs.position.z = -120;

  scene.add(obs);
  obstacles.push(obs);
}

// =======================
// 控制（无延迟）
// =======================
window.addEventListener("keydown", e => {
  if (e.code === "ArrowLeft" && currentLane > 0) currentLane--;
  if (e.code === "ArrowRight" && currentLane < 2) currentLane++;
  if (e.code === "Space" && !isJumping) {
    velocityY = 0.38;
    isJumping = true;
  }
});

window.addEventListener("touchstart", e => {
  const x = e.touches[0].clientX;
  if (x < window.innerWidth / 2 && currentLane > 0) currentLane--;
  if (x >= window.innerWidth / 2 && currentLane < 2) currentLane++;
});

// =======================
// 碰撞检测
// =======================
function checkCollision(a, b) {
  const da = a.position.distanceTo(b.position);
  return da < 1.3;
}

// =======================
// 游戏主循环
// =======================
let frame = 0;

function animate() {
  requestAnimationFrame(animate);

  // 前进
  camel.position.z -= speed;
  ground.position.z += speed;

  // 横向平滑
  camel.position.x += (lanes[currentLane] - camel.position.x) * 0.15;

  // 跳跃
  velocityY -= gravity;
  camel.position.y += velocityY;

  if (camel.position.y <= 0) {
    camel.position.y = 0;
    velocityY = 0;
    isJumping = false;
  }

  // 障碍生成
  frame++;
  if (frame % 90 === 0) spawnObstacle();

  // 障碍移动 & 碰撞
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].position.z += speed;

    if (checkCollision(camel, obstacles[i])) {
      alert("Game Over\nScore: " + score);
      location.reload();
    }

    if (obstacles[i].position.z > 10) {
      scene.remove(obstacles[i]);
      obstacles.splice(i, 1);
      score++;
      speed += 0.002;
    }
  }

  document.getElementById("score").innerText = "Score: " + score;
  document.getElementById("speed").innerText = "Speed: " + speed.toFixed(2) + "x";

  renderer.render(scene, camera);
}

animate();

// =======================
// 自适应
// =======================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
