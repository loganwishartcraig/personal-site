import { MAX_DISTANCE, MAX_EDGE_VERTICES, MAX_SPEED, MIN_SPEED, NUM_VERTICES } from './config';
import { TypedArrayUtils } from './TypedArrayUtils';

export interface WindowState {
    useDark: boolean;
    ih: number;
    iw: number;
}

export let windowState: WindowState = {
    useDark: true,
    ih: window.innerHeight,
    iw: window.innerWidth
};

const windowStateListeners: ((newState: WindowState, oldState: WindowState) => void)[] = [];

export const updateWindowState = (updates: Partial<WindowState>): WindowState => {

    const oldState = windowState;
    const newState = {
        ...windowState,
        ...updates
    };

    windowStateListeners.forEach(cb => cb(newState, oldState));

    return windowState = newState;

}

export const onWindowStateChange = (cb: (newState: WindowState, oldState: WindowState) => void): () => void => {
    const i = windowStateListeners.push(cb);
    return () => { windowStateListeners.splice(i - 1, 1); };
}

const initPointPositions = (count: number, max_x: number, max_y: number): Float32Array => {

    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = 2 * Math.random() * max_x - max_x;
        positions[i * 3 + 1] = 2 * Math.random() * max_y - max_y;
        positions[i * 3 + 2] = 0.0;
    }

    return positions;

}

const initPointVelocities = (count: number, max_speed: number, min_speed: number): Float32Array => {

    const velocities = new Float32Array(count * 2);

    for (let i = 0; i < count; i++) {

        const theta = 2 * Math.PI * Math.random();
        const magnitude = Math.random() * (max_speed - min_speed) + min_speed;

        velocities[i * 2 + 0] = Math.cos(theta) * magnitude;
        velocities[i * 2 + 1] = Math.sin(theta) * magnitude;

    }

    return velocities;

}

export interface PointState {
    particlePosition: Float32Array;
    edgePositions: Float32Array;
    velocities: Float32Array;
}

export const pointState: PointState = {
    particlePosition: initPointPositions(NUM_VERTICES, windowState.iw, windowState.ih),
    edgePositions: initPointPositions(MAX_EDGE_VERTICES, 0, 0),
    velocities: initPointVelocities(NUM_VERTICES, MAX_SPEED, MIN_SPEED),
}

const particleStateListeners: ((newState: PointState) => void)[] = [];
export const onParticleStateChange = (cb: (newState: PointState) => void): () => void => {
    const i = particleStateListeners.push(cb);
    return () => { particleStateListeners.splice(i - 1, 1); };
};

export const movePoints = () => {

    for (let i = 0; i < NUM_VERTICES; i++) {

        if (pointState.particlePosition[i * 3 + 0] > windowState.iw || pointState.particlePosition[i * 3 + 0] < -1 * windowState.iw) {
            pointState.particlePosition[i * 3 + 0] = (pointState.velocities[i * 2 + 0] > 0 ? -1 : 1) * windowState.iw;
        } else if (pointState.particlePosition[i * 3 + 1] > windowState.ih || pointState.particlePosition[i * 3 + 1] < -1 * windowState.ih) {
            pointState.particlePosition[i * 3 + 1] = (pointState.velocities[i * 2 + 1] > 0 ? -1 : 1) * windowState.ih;
        } else {
            pointState.particlePosition[i * 3 + 0] += pointState.velocities[i * 2 + 0];
            pointState.particlePosition[i * 3 + 1] += pointState.velocities[i * 2 + 1];
        }

    }

    particleStateListeners.forEach(cb => cb(pointState));

}

const distanceFunction = (a, b) => Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
const seenEdges: WeakMap<Float32Array, boolean> = new Map();

const edgeStateListeners: ((newState: PointState) => void)[] = [];
export const onEdgeStateChange = (cb: (newState: PointState) => void): () => void => {
    const i = edgeStateListeners.push(cb);
    return () => { edgeStateListeners.splice(i - 1, 1); };
};

export const drawEdges = () => {
    // It's inefficient to just rebuild the K-d tree for each
    // frame, but I don't know a good spatial index that would
    // support point animation in this way. We also slice the
    // positions buffer to create a copy so the sorting in the kd tree
    // doesn't mutate the input buffer. Again - inefficient...
    // would at least be better if we could insert/remove from the kd-tree
    // and maintain balance but the TypedArrayUtils implementation does not support this.
    let kdtree = new TypedArrayUtils.Kdtree(pointState.particlePosition.slice(), distanceFunction, 3);


    let i = 0;
    let j = 0;

    while (i < NUM_VERTICES && j < MAX_EDGE_VERTICES) {

        const nearest = kdtree.nearest(
            [
                pointState.particlePosition[i * 3 + 0],
                pointState.particlePosition[i * 3 + 1],
                pointState.particlePosition[i * 3 + 2],
            ] as any,
            100,
            MAX_DISTANCE
        );

        const self = nearest.find(([_, dist]) => dist === 0)

        seenEdges.set(self[0].obj, true);

        for (let c = 0, nl = nearest.length; c < nl && j < MAX_EDGE_VERTICES; c++) {

            if (seenEdges.has(nearest[c][0].obj)) {
                continue;
            }

            pointState.edgePositions[j * 3 + 0] = pointState.particlePosition[i * 3 + 0];
            pointState.edgePositions[j * 3 + 1] = pointState.particlePosition[i * 3 + 1];
            pointState.edgePositions[j * 3 + 2] = pointState.particlePosition[i * 3 + 2];

            pointState.edgePositions[(j + 1) * 3 + 0] = nearest[c][0].obj[0];
            pointState.edgePositions[(j + 1) * 3 + 1] = nearest[c][0].obj[1];
            pointState.edgePositions[(j + 1) * 3 + 2] = nearest[c][0].obj[2];

            j += 2;

        }
        i++;
    }

    while (j < MAX_EDGE_VERTICES) {
        pointState.edgePositions[j * 3 + 0] = null;
        pointState.edgePositions[j * 3 + 1] = null;
        pointState.edgePositions[j * 3 + 2] = null;
        j++;
    }

    edgeStateListeners.forEach(cb => cb(pointState));

}
