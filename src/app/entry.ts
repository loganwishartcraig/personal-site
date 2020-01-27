import { BufferAttribute, BufferGeometry, Color, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer, Colors } from 'three';
import { TypedArrayUtils } from './TypedArrayUtils';


const NUM_VERTICES = 250;
const MAX_DISTANCE = Math.pow(120, 2);

enum COLOR {
    BG_LIGHT = 0xffffff,
    BG_DARK = 0x000000,
    VERTEX_LIGHT = 0x666666,
    VERTEX_DARK = 0x666666,
}

let useDark = true;

const scene = new Scene();
const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setPixelRatio(window.devicePixelRatio);

renderer.domElement.id = 'three-canvas';
document.body.appendChild(renderer.domElement);

camera.position.z = 500;

const distanceFn = (a: BufferGeometry, b: BufferGeometry): number => {

    // Compute squared distance in 2-d plane only
    return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);

};


const positions = new Float32Array(NUM_VERTICES * 3);
const alphas = new Float32Array(NUM_VERTICES);
const velocity = new Float32Array(NUM_VERTICES * 2);

const particleGeom = new BufferGeometry();
particleGeom.setAttribute('position', new BufferAttribute(positions, 3));
particleGeom.setAttribute('alpha', new BufferAttribute(alphas, 1));

for (let i = 0; i < NUM_VERTICES; i++) {

    positions[i * 3 + 0] = 2 * Math.random() * window.innerWidth - window.innerWidth;
    positions[i * 3 + 1] = 2 * Math.random() * window.innerHeight - window.innerHeight;
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

// const kdtree = new (TypedArrayUtils as any).Kdtree(positions, distanceFn, 3);

function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < NUM_VERTICES; i++) {

        // const positionsInRange = kdtree.nearest(
        //     [
        //         positions[i * 3 + 0],
        //         positions[i * 3 + 1],
        //         positions[i * 3 + 2],
        //     ],
        //     100,
        //     MAX_DISTANCE
        // );

        // alphas[i] /= positionsInRange.length;

        let ih = window.innerHeight,
            iw = window.innerWidth

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
    // particleGeom.attributes.alpha.needsUpdate = true;

    renderer.render(scene, camera);
}

if (typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    console.log('match media', mediaQuery);
    useDark = mediaQuery.matches;
    mediaQuery.addListener((ev) => {
        useDark = ev.matches;
        setColors(useDark);
    })
}

function setColors(useDark: boolean) {
    renderer.setClearColor(useDark ? COLOR.BG_DARK : COLOR.BG_LIGHT, 1);
    uniforms.color.value = new Color(useDark ? COLOR.VERTEX_DARK : COLOR.VERTEX_LIGHT);
    console.log('setting colors', useDark);
}

setColors(useDark);

animate();
