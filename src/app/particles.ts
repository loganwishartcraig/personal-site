import { BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial } from 'three';
import { COLOR } from './config';
import { scene } from './rendering';
import { onParticleStateChange, onWindowStateChange, pointState, windowState, WindowState } from './state';

export const particleUniforms = {
    color: { value: new Color(windowState.useDark ? COLOR.VERTEX_DARK : COLOR.VERTEX_LIGHT) }
};

export const particleMat = new ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: require('./shaders/pointVertex.ts').src,
    fragmentShader: require('./shaders/pointFragment.ts').src,
    transparent: true,
});

export const particleGeom = new BufferGeometry();
particleGeom.setAttribute('position', new BufferAttribute(pointState.particlePosition, 3));

export const particles = new Points(particleGeom, particleMat);

export const initParticles = () => {
    scene.add(particles);
}

const handleWindowStateChange = ({ useDark }: WindowState) => {
    particleUniforms.color.value = new Color(useDark ? COLOR.VERTEX_DARK : COLOR.VERTEX_LIGHT);
}

onWindowStateChange(handleWindowStateChange);

onParticleStateChange(() => {
    (particleGeom.attributes.position as BufferAttribute).needsUpdate = true;
});
