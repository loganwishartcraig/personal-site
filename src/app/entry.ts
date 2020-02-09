import { MAX_EDGES, MAX_SPEED, MIN_SPEED, NUM_VERTICES as MAX_VERTICES, MAX_DISTANCE } from './config';
import { initEdges, setEdgePositions } from './edges';
import { initEventHandlers } from './event-handlers';
import { initParticles, setParticlePositions } from './particles';
import { initRenderer, renderScene } from './rendering';
import { windowState } from './state/window';
import { WorkerRequest, WorkerResponse } from './worker';

initRenderer(windowState);
initParticles();
initEdges();
initEventHandlers();

const worker = new Worker('worker.ts');

worker.onmessage = (ev) => {

    const { type, payload }: WorkerResponse = ev.data;

    if (type === 'particle-update') {
        animate(payload.particlePositions, payload.edgePositions);
    }

}

const initMessage = {
    type: 'init-particles',
    payload: {
        edgeCount: MAX_EDGES,
        vertexCount: MAX_VERTICES,
        max_speed: MAX_SPEED,
        max_x: windowState.iw,
        max_y: windowState.ih,
        min_speed: MIN_SPEED,
    }
} as WorkerRequest;

worker.postMessage(initMessage);

function animate(particlePositions: Float32Array, edgePositions: Float32Array) {

    setParticlePositions(particlePositions);
    setEdgePositions(edgePositions);

    requestAnimationFrame(handleAnimationTick);

}

function handleAnimationTick() {

    renderScene();

    const message: WorkerRequest = {
        type: 'move-particles',
        payload: { max_distance: MAX_DISTANCE, max_x: windowState.iw, max_y: windowState.ih };
    };

    worker.postMessage(message);

}
