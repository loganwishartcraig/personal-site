import { drawEdges, initState, movePoints, ParticleStateConfig } from './state/point';

export type WorkerRequest = {
    type: 'move-particles';
    payload: { max_x: number; max_y: number; max_distance: number; };
} | {
    type: 'init-particles';
    payload: ParticleStateConfig;
}

export type WorkerResponse = {
    type: 'particle-update';
    payload: WorkerParticleUpdatePayload;
};

export type WorkerParticleUpdatePayload = {
    particlePositions: Float32Array;
    edgePositions: Float32Array;
}

onmessage = ev => {

    const data: WorkerRequest = ev.data;

    if (data.type === 'init-particles') {

        const state = initState(data.payload);

        const message: WorkerResponse = {
            type: 'particle-update',
            payload: {
                particlePositions: state.particlePositions,
                edgePositions: state.edgePositions,
            }
        };

        postMessage(message, undefined);

    } else if (data.type === 'move-particles') {

        const particlePositions = movePoints(data.payload.max_y, data.payload.max_x);
        const edgePositions = drawEdges(data.payload.max_distance);

        const message: WorkerResponse = {
            type: 'particle-update',
            payload: {
                particlePositions,
                edgePositions
            }
        };

        postMessage(message, undefined);

    }

}
