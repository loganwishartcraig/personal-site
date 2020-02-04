import {
    BufferAttribute, BufferGeometry, Color, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer, Colors,
    LineBasicMaterial,
    LineSegments,
} from 'three';

import { TypedArrayUtils } from './TypedArrayUtils';

const NUM_VERTICES = 250;
const MAX_EDGE_VERTICES = 600 * 2;
const MAX_DISTANCE = Math.pow(120, 2);

enum COLOR {
    BG_LIGHT = 0xffffff,
    BG_DARK = 0x000000,
    VERTEX_LIGHT = 0x666666,
    VERTEX_DARK = 0x808080,
    EDGE_LIGHT = 0xdddddd,
    EDGE_DARK = 0x222222,
}

let useDark = true;
let ih = window.innerHeight,
    iw = window.innerWidth

const distanceFunction = (a, b) => Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);

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

camera.position.z = ih / (2 * Math.tan(camera.fov * Math.PI / 360));;

const positions = new Float32Array(NUM_VERTICES * 3);
const edgePositions = new Float32Array(MAX_EDGE_VERTICES * 3);

const alphas = new Float32Array(NUM_VERTICES);
const velocity = new Float32Array(NUM_VERTICES * 2);

const particleGeom = new BufferGeometry();
particleGeom.setAttribute('position', new BufferAttribute(positions, 3));
particleGeom.setAttribute('alpha', new BufferAttribute(alphas, 1));

const edgeGeom = new BufferGeometry();
edgeGeom.setAttribute('position', new BufferAttribute(edgePositions, 3));

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
const edgeMat = new LineBasicMaterial({ color: useDark ? COLOR.EDGE_DARK : COLOR.EDGE_LIGHT });

const particles = new Points(particleGeom, particleMat);
const edges = new LineSegments(edgeGeom, edgeMat);
let kdtree;

scene.add(particles);
scene.add(edges);
let resizeTimeout;

function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
            ih = window.innerHeight;
            iw = window.innerWidth;
            camera.aspect = iw / ih;
            camera.position.z = ih / (2 * Math.tan(camera.fov * Math.PI / 360));;
            camera.updateProjectionMatrix();
            renderer.setSize(iw, ih);
        });
    }, 300);
}

const seenEdges: WeakMap<Float32Array, boolean> = new Map();

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

    // It's inefficient to just rebuild the K-d tree for each
    // frame, but I don't know a good spatial index that would
    // support point animation in this way. We also slice the
    // positions buffer to create a copy so the sorting in the kd tree
    // doesn't mutate the input buffer. Again - inefficient...
    // would at least be better if we could insert/remove from the kd-tree
    // and maintain balance but the TypedArrayUtils implementation does not support this.
    kdtree = new TypedArrayUtils.Kdtree(positions.slice(), distanceFunction, 3);

    let i = 0;
    let j = 0;

    while (i < NUM_VERTICES && j < MAX_EDGE_VERTICES) {

        const nearest = kdtree.nearest(
            [
                positions[i * 3 + 0],
                positions[i * 3 + 1],
                positions[i * 3 + 2],
            ],
            100,
            MAX_DISTANCE
        );

        const self = nearest.find(([_, dist]) => dist === 0)

        seenEdges.set(self[0].obj, true);

        for (let c = 0, nl = nearest.length; c < nl && j < MAX_EDGE_VERTICES; c++) {

            if (seenEdges.has(nearest[c][0].obj)) {
                continue;
            }

            edgePositions[j * 3 + 0] = positions[i * 3 + 0];
            edgePositions[j * 3 + 1] = positions[i * 3 + 1];
            edgePositions[j * 3 + 2] = positions[i * 3 + 2];

            edgePositions[(j + 1) * 3 + 0] = nearest[c][0].obj[0];
            edgePositions[(j + 1) * 3 + 1] = nearest[c][0].obj[1];
            edgePositions[(j + 1) * 3 + 2] = nearest[c][0].obj[2];

            j += 2;

        }
        i++;
    }

    while (j < MAX_EDGE_VERTICES) {
        edgePositions[j * 3 + 0] = null;
        edgePositions[j * 3 + 1] = null;
        edgePositions[j * 3 + 2] = null;
        j++;
    }

    (particleGeom.attributes.position as any).needsUpdate = true;
    (edgeGeom.attributes.position as any).needsUpdate = true;

    renderer.render(scene, camera);
}

if (typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    useDark = mediaQuery.matches;
    setColors(useDark);
    mediaQuery.addListener((ev) => {
        useDark = ev.matches;
        setColors(useDark);
    })
} else {
    setColors(useDark);
}

function setColors(useDark: boolean) {
    renderer.setClearColor(useDark ? COLOR.BG_DARK : COLOR.BG_LIGHT, 1);
    uniforms.color.value = new Color(useDark ? COLOR.VERTEX_DARK : COLOR.VERTEX_LIGHT);
    edgeMat.color = new Color(useDark ? COLOR.EDGE_DARK : COLOR.EDGE_LIGHT);
}

window.addEventListener('resize', handleResize);


animate();
