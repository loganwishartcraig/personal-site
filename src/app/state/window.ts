
export interface WindowState {
    useDark: boolean;
    ih: number;
    iw: number;
}

export let windowState: WindowState = {
    useDark: true,
    ih: window.innerHeight,
    iw: window.innerWidth
};

const windowStateListeners: ((newState: WindowState, oldState: WindowState) => void)[] = [];

export const updateWindowState = (updates: Partial<WindowState>): WindowState => {

    const oldState = windowState;
    const newState = {
        ...windowState,
        ...updates
    };

    windowStateListeners.forEach(cb => cb(newState, oldState));

    return windowState = newState;

}

export const onWindowStateChange = (cb: (newState: WindowState, oldState: WindowState) => void): () => void => {
    const i = windowStateListeners.push(cb);
    return () => { windowStateListeners.splice(i - 1, 1); };
}
