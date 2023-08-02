import { updateAnimationState } from "./state/animation";
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

const handleManualThemeToggle = () => {
  const e = document.documentElement;
  const themeVal = e.getAttribute("data-theme");
  const currentlyPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if ( themeVal === "dark" || (!themeVal && currentlyPrefersDark)) {
      e.setAttribute('data-theme', "light");
      updateWindowState({ useDark: false });
  } else if (themeVal === "light" || (!themeVal && !currentlyPrefersDark)) {
      e.setAttribute("data-theme", "dark");
      updateWindowState({ useDark: true });
  }
}

export const initEventHandlers = () => {
  window.addEventListener("resize", handleResize);
  document.getElementById("theme-toggle__button")?.addEventListener("click", handleManualThemeToggle);

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
