import {
    BufferAttribute,
    BufferGeometry,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three';

import { TypedArrayUtils } from './utils';

const scene = new Scene();
const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xdddddd, 1);

document.body.appendChild(renderer.domElement);

// const geometry = new CircleGeometry(0.05, 120);
// const material = new MeshBasicMaterial({ color: 0x222222 });
// const circle = new Mesh(geometry, material);

// scene.add(circle);

camera.position.z = 5;

const distance = (a: BufferGeometry, b: BufferGeometry): number => {
    return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);
};

const NUM_VERTICES = 100;
const positions = new Float32Array(NUM_VERTICES * 3);
const alphas = new Float32Array(NUM_VERTICES);

const particleGeom = new BufferGeometry();

particleGeom.setAttribute('position', new BufferAttribute(positions, 3));
particleGeom.setAttribute('alpha', new BufferAttribute(alphas, 3));

for (let i = 0; i < NUM_VERTICES; i++) {

    positions[i * 3 + 0] = Math.random() * 1000;
    positions[i * 3 + 1] = Math.random() * 1000;
    positions[i * 3 + 2] = 0;

    alphas[i] = 1.0;

}

const kdtree = new TypedArrayUtils.Kdtree()

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
