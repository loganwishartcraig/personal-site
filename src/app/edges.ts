import { BufferAttribute, BufferGeometry, Color, LineBasicMaterial, LineSegments } from 'three';
import { COLOR } from './config';
import { scene } from './rendering';
import { onWindowStateChange, windowState, WindowState } from './state/window';

export const edgeMat = new LineBasicMaterial({ color: new Color(windowState.useDark ? COLOR.EDGE_DARK : COLOR.EDGE_LIGHT) });

export const edgeGeom = new BufferGeometry();

export const edges = new LineSegments(edgeGeom, edgeMat);
export const initEdges = () => {
    scene.add(edges);
}

const handleWindowStateChange = ({ useDark }: WindowState) => {
    edgeMat.color = new Color(useDark ? COLOR.EDGE_DARK : COLOR.EDGE_LIGHT);
};

export const setEdgePositions = (edgePositions: Float32Array) => {
    edgeGeom.setAttribute('position', new BufferAttribute(edgePositions, 3));
}

onWindowStateChange(handleWindowStateChange);
