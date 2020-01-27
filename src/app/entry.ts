import { BufferAttribute, BufferGeometry, Color, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer, Colors } from 'three';


const NUM_VERTICES = 250;
const MAX_DISTANCE = Math.pow(120, 2);

enum COLOR {
    BG_LIGHT = 0xffffff,
    BG_DARK = 0x000000,
    VERTEX_LIGHT = 0x666666,
    VERTEX_DARK = 0x808080,
}

let useDark = true;
let ih = window.innerHeight,
    iw = window.innerWidth

const scene = new Scene();
const camera = new PerspectiveCamera(
    75,
    iw / ih,
    0.1,
    1000
);

const renderer = new WebGLRenderer();

renderer.setSize(iw, ih);

renderer.domElement.id = 'three-canvas';
document.body.appendChild(renderer.domElement);

camera.position.z = 500;

const positions = new Float32Array(NUM_VERTICES * 3);
const alphas = new Float32Array(NUM_VERTICES);
const velocity = new Float32Array(NUM_VERTICES * 2);

const particleGeom = new BufferGeometry();
particleGeom.setAttribute('position', new BufferAttribute(positions, 3));
particleGeom.setAttribute('alpha', new BufferAttribute(alphas, 1));

for (let i = 0; i < NUM_VERTICES; i++) {

    positions[i * 3 + 0] = 2 * Math.random() * iw - iw;
    positions[i * 3 + 1] = 2 * Math.random() * ih - ih;
    positions[i * 3 + 2] = 0.0;

    velocity[i * 2 + 0] = (Math.random() > 0.5 ? -1 : 1) * Math.random();
    velocity[i * 2 + 1] = (Math.random() > 0.5 ? -1 : 1) * Math.random();

    alphas[i] - 1.0

}

const uniforms = {
    color: { value: new Color(useDark ? COLOR.VERTEX_DARK : COLOR.VERTEX_LIGHT) }
};

const particleMat = new ShaderMaterial({
    uniforms,
    vertexShader: require('./shaders/pointVertex.ts').src,
    fragmentShader: require('./shaders/pointFragment.ts').src,
    transparent: true,
});

const particles = new Points(particleGeom, particleMat);
scene.add(particles);

let resizeTimeout;

function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
            ih = window.innerHeight;
            iw = window.innerWidth;
            renderer.setSize(iw, ih);
        });
    }, 300);
}

function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < NUM_VERTICES; i++) {

        if (positions[i * 3 + 0] > iw || positions[i * 3 + 0] < -1 * iw) {
            positions[i * 3 + 0] = (velocity[i * 2 + 0] > 0 ? -1 : 1) * iw;
        } else if (positions[i * 3 + 1] > ih || positions[i * 3 + 1] < -1 * ih) {
            positions[i * 3 + 1] = (velocity[i * 2 + 1] > 0 ? -1 : 1) * ih;
        } else {
            positions[i * 3 + 0] += velocity[i * 2 + 0];
            positions[i * 3 + 1] += velocity[i * 2 + 1];
        }

    }

    particleGeom.attributes.position.needsUpdate = true;


    renderer.render(scene, camera);
}

if (typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    useDark = mediaQuery.matches;
    mediaQuery.addListener((ev) => {
        useDark = ev.matches;
        setColors(useDark);
    })
}

function setColors(useDark: boolean) {
    renderer.setClearColor(useDark ? COLOR.BG_DARK : COLOR.BG_LIGHT, 1);
    uniforms.color.value = new Color(useDark ? COLOR.VERTEX_DARK : COLOR.VERTEX_LIGHT);
}

window.addEventListener('resize', handleResize);

setColors(useDark);

animate();
