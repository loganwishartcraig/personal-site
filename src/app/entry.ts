import { initRenderer, renderScene } from './rendering';
import { drawEdges, movePoints, windowState } from './state';
import { initEventHandlers } from './event-handlers';
import { initEdges } from './edges';
import { initParticles } from './particles';

initRenderer(windowState);
initParticles();
initEdges();
initEventHandlers();

function animate() {

    requestAnimationFrame(animate);

    movePoints();
    drawEdges();
    renderScene();

}

animate();
