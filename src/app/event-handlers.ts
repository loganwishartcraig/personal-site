import { updateAnimationState, AnimationState } from "./state/animation";
import { updateWindowState } from "./state/window";

let resizeTimeout;
const handleResize = () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    updateWindowState({ ih: window.innerHeight, iw: window.innerWidth });
  }, 300);
};

const handlePreferredColorSchemeChange = (ev: MediaQueryListEvent) => {
  updateWindowState({ useDark: ev.matches });
};

const handlePreferredReduceMotionChange = (ev: MediaQueryListEvent) => {
  updateAnimationState({ enabled: ev.matches });
};

export const initEventHandlers = () => {
  window.addEventListener("resize", handleResize);

  if (typeof window.matchMedia === "function") {
    const colorSchemeMQ = window.matchMedia("(prefers-color-scheme: dark)");
	updateWindowState({ useDark: colorSchemeMQ.matches });
    colorSchemeMQ.addEventListener("change", handlePreferredColorSchemeChange);

    const prefersReducedMotionMQ = window.matchMedia("(prefers-reduced-motion: no-preference)");
    updateAnimationState({ enabled: prefersReducedMotionMQ.matches });
    prefersReducedMotionMQ.addEventListener(
      "change",
      handlePreferredReduceMotionChange
    );

  }
};
