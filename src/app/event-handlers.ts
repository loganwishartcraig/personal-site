import { updateWindowState } from './state/window';

let resizeTimeout;

const handleResize = () => {

    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        updateWindowState({ ih: window.innerHeight, iw: window.innerWidth });
    }, 300);

}

const handlePreferredColorSchemeChange = (ev: MediaQueryListEvent) => {
    updateWindowState({ useDark: ev.matches });
}

export const initEventHandlers = () => {
    window.addEventListener('resize', handleResize);

    if (typeof window.matchMedia === 'function') {

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        updateWindowState({ useDark: mediaQuery.matches });
        mediaQuery.addListener(handlePreferredColorSchemeChange);

    }
};

