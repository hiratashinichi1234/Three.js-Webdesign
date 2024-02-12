import * as THREE from './build/three.module.js';

import { FontLoader } from "./loaders/FontLoader.js";
import { TextGeometry } from "./geometries/TextGeometry.js";


const vertexShader = `
uniform sampler2D udisplaymanet;
uniform float uTime;

varying vec2 vUv;

// Perlinノイズを計算する関数
float noise(vec2 uv) {
  return texture2D(udisplaymanet, uv).r;
}

void main() {
  vUv = uv;

  // 元の動き（sin関数を利用した上下の動き）
  float originalY = position.y;
  float newposX = position.x;
  float newposY = originalY;
  float newposZ = sin(uTime) + position.z;

  // 新しい動き（Perlinノイズを利用した下から上へのゆっくり移動）
  float noiseIntensity = 0.5; // ノイズの影響度
  float noiseSpeed = 0.2; // ノイズの速さ

  // インスタンスごとに異なるノイズのパラメータを用意
  vec2 instanceOffset = vec2(1.0, 2.0); // 例として適当な値を設定

  float instanceNoiseOffset = noise((vUv + instanceOffset) * 10.0) * noiseIntensity;
  newposY += instanceNoiseOffset;

  // 時間に基づいてゆっくり上へ移動
  float timeSpeed = 0.5; // 時間の速さ
  float timeOffset = mod(uTime * timeSpeed, 4.0 * 3.33333); // 2π周期で変動
  newposY += timeOffset * noiseSpeed;

  vec3 newposition = vec3(newposX, newposY, newposZ);

  vec4 worldPosition = modelMatrix * vec4(newposition, 2.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  gl_Position = projectionMatrix * mvPosition;
}
`;




const fragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
  // 花吹雪の色をランダムに設定
  vec3 petalColor = vec3(1.0, 0.5 + 0.5 * sin(uTime), 0.8);

  // パーティクルのサイズを小さくする
  float particleSize = 0.02;

  // 風に吹かれるような揺れを加える
  float windIntensity = 0.1;
  float wind = sin(vUv.y * 10.0 + uTime) * windIntensity;
  
  // パーティクルのアルファ値をランダムに変動させる
  float alpha = smoothstep(0.0, particleSize, 1.0 - distance(vUv, vec2(0.5 + wind, 0.5)));

  gl_FragColor = vec4(petalColor, alpha);

  // 追加色（黒）を設定
  vec3 additionalColor = vec3(0.0, 0.0, 0.0);
  
  // テクスチャの色をそのまま使用（追加色は加算しない）
  vec4 texcel = texture2D(uTexture, vUv);
  vec3 color = texcel.rgb;
  
  gl_FragColor = vec4(color, texcel.a);
}
`;


// シーンを作成
const scene = new THREE.Scene();

// カメラを作成
const camera = new THREE.PerspectiveCamera(115, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// レンダラーを作成
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight,800);
document.getElementById('three-container').appendChild(renderer.domElement);



// シェーダーマテリアルの定義
const geometry = new THREE.PlaneGeometry(2, 2, 4, 4);
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
    uTexture: { value: new THREE.TextureLoader().load("./image/image11.png") },
    udisplaymanet: { value: new THREE.TextureLoader().load("./image/image11.png") },
    uColor: { value: new THREE.Color(1, 1, Math.random()) },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
});

const backgroundGeometry = new THREE.PlaneGeometry(30, 30);

// 背景画像のマテリアル
const backgroundImageTexture = new THREE.TextureLoader().load('./image/image13.jpg');
const backgroundMaterial = new THREE.MeshStandardMaterial({ map: backgroundImageTexture });

const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(backgroundMesh);

// 環境光
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // 0.5は光の強さを表します
scene.add(ambientLight);

// スポットライト
const spotLight = new THREE.SpotLight(0xffffff, 2, 100, Math.PI / 4);
spotLight.position.set(10, 50, 10);
spotLight.target.position.set(0, 0, 0);
spotLight.castShadow = true;
scene.add(spotLight);

// ディレクショナルライト（オプション）
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(15, 1, 1); // 光の方向を指定
scene.add(directionalLight);


let textMesh;

const fontLoader = new FontLoader();
fontLoader.load("./fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Welcome my Page!", {
    font: font,
    size: 1.9,
    height: 0.2,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4,
  });
  textGeometry.center();
  const textMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.667, 67) });
　
  textMesh = new THREE.Mesh(textGeometry, textMaterial);
  scene.add(textMesh);
  

  // コンテンツをまとめるグループ
  const contentGroup = new THREE.Group();
  contentGroup.add(backgroundMesh);
  contentGroup.add(textMesh);
  contentGroup.add(petalMesh);
  contentGroup.add(Mesh);
  scene.add(contentGroup);

  // 他のコードが続く可能性があります...
  
});





const petalGeometry = new THREE.BufferGeometry();
const petalMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color1: { value: new THREE.Color(0xffc0cb) },  // ピンク色1
    color2: { value: new THREE.Color(0xff69b4) },  // ピンク色2
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_PointSize = 9.0;  // パーティクルのサイズ
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec3 vPosition;
    void main() {
      float gradient = (vPosition.y + 0.5) / 1.0;  // Y座標によるグラデーション
      gl_FragColor = vec4(mix(color1, color2, gradient), 1.0);
    }
  `,
  transparent: true,
});

const vertices = [];
const velocities = [];

for (let i = 0; i < 800; i++) {
  const angle = (i / 200) * Math.PI * 2;
  const radius = Math.random() * 2;  // パーティクルの半径

  const x = (Math.random() - 0.5) * 20;  // X座標をより広い範囲でランダムに設定
  const y = (Math.random() - 0.5) * 5;   // Y座標をランダムに設定
  const z = Math.sin(angle) * radius;

  vertices.push(x, y, z);

   // パーティクルごとにランダムな速度を設定
   const speed = Math.random() * 0.02 + 0.01;
   velocities.push(0, -speed, 0.005);  // 速度のZ成分を追加
 }
  


petalGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

const petalMesh = new THREE.Points(petalGeometry, petalMaterial);
scene.add(petalMesh);

const instancesCount = 55; // インスタンスの数
const instancedMesh = new THREE.InstancedMesh(geometry, material, instancesCount);


// シーンにインスタンスメッシュを追加
scene.add(instancedMesh);



// インスタンスメッシュの配置
for (let i = 0; i < instancesCount; i++) {
  const mesh = instancedMesh.clone();

  // ランダムな座標を生成
  const x = Math.random() * 13 - 4; // -6から6の範囲
  const y = Math.random() * 20 - 11; // -14から14の範囲
  const z = Math.random() * 13 - 6; // -6から6の範囲

  mesh.position.set(x, y, z);

  scene.add(mesh);
}




// メッシュを作成
const Mesh = new THREE.Mesh(geometry, material);
Mesh.position.set(0, 0, 0);
scene.add(Mesh);



// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  const positions = petalMesh.geometry.attributes.position.array;

  // 各パーティクルの位置を更新
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2];

    // パーティクルが画面外に出たら再配置
    if (positions[i + 1] < -5) {
      positions[i + 1] = 5;
    }
  }

  petalMesh.geometry.attributes.position.needsUpdate = true;
 
  // レンダリング
  renderer.render(scene, camera);
}

// アニメーションを開始
animate();



const clock = new THREE.Clock();

//アニメーションループ箇所
function rendeLoop() {
    //stats.begin();//stats計測
    //const delta = clock.getDelta();//animation programs
    const elapsedTime = clock.getElapsedTime();

    // 蝶のマテリアルのuTimeに値を入れる
    Mesh.material.uniforms.uTime.value = elapsedTime * 10;
    Mesh.material.uniformsNeedUpdate = true;

    renderer.render(scene, camera) // render the scene using the camera
    requestAnimationFrame(rendeLoop) //loop the render function
    //stats.end();//stats計測
}

rendeLoop() //start rendering


