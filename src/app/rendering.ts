import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { COLOR } from './config';
import { windowState, WindowState, onWindowStateChange } from './state/window';

const getCameraDepth = (camera: PerspectiveCamera, height: number) => height / (2 * Math.tan(camera.fov * Math.PI / 360));

export const scene = new Scene();
export const camera = new PerspectiveCamera(75, windowState.iw / windowState.ih, 0.1, 1000);
export const renderer = new WebGLRenderer();

export const initRenderer = (state: WindowState) => {

    camera.position.z = getCameraDepth(camera, state.ih + 250);

    renderer.setSize(state.iw, state.ih);
    renderer.domElement.id = 'three-canvas';

    document.body.appendChild(renderer.domElement);

};

export const renderScene = () => {
    renderer.render(scene, camera);
}

const handleWindowStateChange = (state: WindowState) => {
    camera.aspect = state.iw / state.ih;
    camera.position.z = getCameraDepth(camera, state.ih);
    camera.updateProjectionMatrix();
    renderer.setSize(state.iw, state.ih);
    renderer.setClearColor(state.useDark ? COLOR.BG_DARK : COLOR.BG_LIGHT, 1);
};

onWindowStateChange(handleWindowStateChange);
