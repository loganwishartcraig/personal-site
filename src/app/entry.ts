import {
  MAX_EDGES,
  MAX_SPEED,
  MIN_SPEED,
  NUM_VERTICES as MAX_VERTICES,
  MAX_DISTANCE,
} from "./config";
import { initEdges, setEdgePositions } from "./edges";
import { initEventHandlers } from "./event-handlers";
import { initParticles, setParticlePositions } from "./particles";
import { initRenderer, renderScene } from "./rendering";
import { AnimationState, onAnimationStateChange } from "./state/animation";
import { windowState } from "./state/window";
import { WorkerRequest, WorkerResponse } from "./worker";

initRenderer(windowState);
initParticles();
initEdges();
initEventHandlers();

const worker = new Worker(new URL("worker.ts", import.meta.url));

let frameRequestId: number | undefined;

function main() {

  onAnimationStateChange(handleAnimationStateChange);
  worker.addEventListener("message", handleWorkerMessage);

  worker.postMessage({
    type: "init-particles",
    payload: {
      edgeCount: MAX_EDGES,
      vertexCount: MAX_VERTICES,
      max_speed: MAX_SPEED,
      max_x: windowState.iw,
      max_y: windowState.ih,
      min_speed: MIN_SPEED,
      max_distance: MAX_DISTANCE,
    },
  } as WorkerRequest);

  printWelcome();

}

function handleAnimationStateChange(
  { enabled: currentlyEnabled },
  { enabled: wasEnabled }
) {
  cancelAnimationFrame(frameRequestId);
  if (!wasEnabled && currentlyEnabled) {
    requestParticleMove();
  }
}

function handleWorkerMessage(ev: MessageEvent<any>) {
  const { type, payload }: WorkerResponse = ev.data;

  if (type === "particle-update") {
    animate(payload.particlePositions, payload.edgePositions);
  }
}

function animate(particlePositions: Float32Array, edgePositions: Float32Array) {
  setParticlePositions(particlePositions);
  setEdgePositions(edgePositions);
  renderScene();
  frameRequestId = requestAnimationFrame(handleAnimationTick);
}

function handleAnimationTick() {
  if (AnimationState.enabled) {
    requestParticleMove();
  }
}

function requestParticleMove() {
  const message: WorkerRequest = {
    type: "move-particles",
    payload: {
      max_distance: MAX_DISTANCE,
      max_x: windowState.iw,
      max_y: windowState.ih,
    },
  };

  worker.postMessage(message);
}

function printWelcome() {
  console.log(
    `
  *                                                      *                         . 
                 ✦
.　　　　　　　　　　 ✦ 　　　　   　 　　　🌑
*　　　　　　   　　　　　　　　　　　　　　　.　　　　　　　　　　　　　　. 　　 　　　　　　　 ✦
     %cHi. Site source code @%c
       https://github.com/loganwishartcraig/personal-site　　　　　　 　 
,　　   　

    .　　　　　　　　　　　　　.　　　ﾟ　  　　　.　　　　　　　　　　　　　🚀

                                                                    ,　　　　　　　.
                                                ☀️
    . 　　　　　　　　　　.
.
                 ☄️️ 　   　　　,　　　　　　　　　　　     　　　　 　　,　　　 
.　　　　　 　　 　　　.
        ˚　　　 　   　　　　
             .　　　  　　    　　　　　 　　　　　.　　　　　　　　　　　　　.
             .　　　　　　　　　　　　　　　　　　.　　　　　    　　. 　 　　　　　.
 　　　　　   　　　　　.　　　　　　　　　　　.　　　　　　　　　　   　

˚　　　　　　　　　　　　　　　　　　　　　ﾟ　　　　　🌎　　　　　　　　　　　　　　　. 　　 　 
          ,　 　　　　　　　　　　　　　
    ˚　　　　　　　　　　　　　　*　　　　　　   　　　　　　　　　　　　　　　.
  .
				`,
    "font-weight: bold",
    "font-weight: normal"
  );
}

main();
