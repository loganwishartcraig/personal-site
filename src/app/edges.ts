import { BufferAttribute, BufferGeometry, Color, LineBasicMaterial, LineSegments } from 'three';
import { COLOR } from './config';
import { scene } from './rendering';
import { onEdgeStateChange, onWindowStateChange, pointState, windowState, WindowState } from './state';

export const edgeMat = new LineBasicMaterial({ color: new Color(windowState.useDark ? COLOR.EDGE_DARK : COLOR.EDGE_LIGHT) });

export const edgeGeom = new BufferGeometry();
edgeGeom.setAttribute('position', new BufferAttribute(pointState.edgePositions, 3));

export const edges = new LineSegments(edgeGeom, edgeMat);
export const initEdges = () => {
    scene.add(edges);
}

const handleWindowStateChange = ({ useDark }: WindowState) => {
    edgeMat.color = new Color(useDark ? COLOR.EDGE_DARK : COLOR.EDGE_LIGHT);
};

onWindowStateChange(handleWindowStateChange);
onEdgeStateChange(() => {
    (edgeGeom.attributes.position as BufferAttribute).needsUpdate = true;
});
