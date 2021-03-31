import { TypedArrayUtils } from '../TypedArrayUtils';

export type PointState = {
    particlePositions: Float32Array;
    edgePositions: Float32Array;
    velocities: Float32Array;
}

export const pointState: PointState = {
    particlePositions: undefined,
    edgePositions: undefined,
    velocities: undefined,
}

export const initPointPositions = (count: number, max_x: number, max_y: number): Float32Array => {

    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = 2 * Math.random() * max_x - max_x;
        positions[i * 3 + 1] = 2 * Math.random() * max_y - max_y;
        positions[i * 3 + 2] = 0.0;
    }

    return pointState.particlePositions = positions;

}

export const initPointVelocities = (count: number, max_speed: number, min_speed: number): Float32Array => {

    const velocities = new Float32Array(count * 2);

    for (let i = 0; i < count; i++) {

        const theta = 2 * Math.PI * Math.random();
        const magnitude = Math.random() * (max_speed - min_speed) + min_speed;

        velocities[i * 2 + 0] = Math.cos(theta) * magnitude;
        velocities[i * 2 + 1] = Math.sin(theta) * magnitude;

    }

    return pointState.velocities = velocities;

}

export const initEdgePositions = (count: number): Float32Array => {

    const len = count * 2;
    const positions = new Float32Array(len * 3)

    for (let i = 0; i < len; i++) {
        positions[i * 3 + 0] = 0.0;
        positions[i * 3 + 1] = 0.0;
        positions[i * 3 + 2] = 0.0;
    }

    return pointState.edgePositions = positions;

}

export type ParticleStateConfig = {
    vertexCount: number;
    edgeCount: number;
    max_x: number;
    max_y: number;
    max_speed: number;
    min_speed: number;
	max_distance: number;
};

export const initState = ({
    vertexCount,
    edgeCount,
    max_speed,
    min_speed,
    max_x,
    max_y,
	max_distance,
}: ParticleStateConfig): PointState => {

    initPointPositions(vertexCount, max_x, max_y);
    initPointVelocities(vertexCount, max_speed, min_speed);
    initEdgePositions(edgeCount);
	drawEdges(max_distance);

    return pointState;

}

export const movePoints = (maxHeight: number, maxWidth: number): Float32Array => {

    for (let i = 0, len = pointState.particlePositions.length / 3; i < len; i++) {
        if (pointState.particlePositions[i * 3 + 0] > maxWidth || pointState.particlePositions[i * 3 + 0] < -1 * maxWidth) {
            pointState.particlePositions[i * 3 + 0] = (pointState.velocities[i * 2 + 0] > 0 ? -1 : 1) * maxWidth;
        } else if (pointState.particlePositions[i * 3 + 1] > maxHeight || pointState.particlePositions[i * 3 + 1] < -1 * maxHeight) {
            pointState.particlePositions[i * 3 + 1] = (pointState.velocities[i * 2 + 1] > 0 ? -1 : 1) * maxHeight;
        } else {
            pointState.particlePositions[i * 3 + 0] += pointState.velocities[i * 2 + 0];
            pointState.particlePositions[i * 3 + 1] += pointState.velocities[i * 2 + 1];
        }

    }

    return pointState.particlePositions;

}

const distanceFunction = (a, b) => Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
const seenEdges: WeakMap<Float32Array, boolean> = new WeakMap();

export const drawEdges = (maxDistance: number): Float32Array => {
    // It's inefficient to just rebuild the K-d tree for each
    // frame, but I don't know a good spatial index that would
    // support point animation in this way. We also slice the
    // positions buffer to create a copy so the sorting in the kd tree
    // doesn't mutate the input buffer. Again - inefficient...
    // would at least be better if we could insert/remove from the kd-tree
    // and maintain balance but the TypedArrayUtils implementation does not support this.
    let kdtree = new TypedArrayUtils.Kdtree(pointState.particlePositions.slice(), distanceFunction, 3);


    let i = 0;
    let len_i = pointState.particlePositions.length / 3;
    let j = 0;
    let len_j = pointState.edgePositions.length / 6;

    while (i < len_i && j < len_j) {

        const nearest = kdtree.nearest(
            [
                pointState.particlePositions[i * 3 + 0],
                pointState.particlePositions[i * 3 + 1],
                pointState.particlePositions[i * 3 + 2],
            ] as any,
            100,
            maxDistance
        );

        const self = nearest.find(([_, dist]) => dist === 0);

        seenEdges.set(self[0].obj, true);

        for (let c = 0, nl = nearest.length; c < nl && j < len_j; c++) {

            if (seenEdges.has(nearest[c][0].obj)) {
                continue;
            }

            pointState.edgePositions[j * 3 + 0] = pointState.particlePositions[i * 3 + 0];
            pointState.edgePositions[j * 3 + 1] = pointState.particlePositions[i * 3 + 1];
            pointState.edgePositions[j * 3 + 2] = pointState.particlePositions[i * 3 + 2];

            pointState.edgePositions[(j + 1) * 3 + 0] = nearest[c][0].obj[0];
            pointState.edgePositions[(j + 1) * 3 + 1] = nearest[c][0].obj[1];
            pointState.edgePositions[(j + 1) * 3 + 2] = nearest[c][0].obj[2];

            j += 2;

        }
        i++;
    }

    while (j < len_j) {
        pointState.edgePositions[j * 3 + 0] = null;
        pointState.edgePositions[j * 3 + 1] = null;
        pointState.edgePositions[j * 3 + 2] = null;
        j++;
    }

    return pointState.edgePositions;

}
