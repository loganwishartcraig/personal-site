export type AnimationState = {
  enabled: boolean;
};

export let AnimationState = {
  enabled: true,
};

const animationStateListeners: ((
  newState: AnimationState,
  oldState: AnimationState
) => void)[] = [];

export const updateAnimationState = (
  updates: Partial<AnimationState>
): AnimationState => {
  const oldState = AnimationState;
  const newState = {
    ...AnimationState,
    ...updates,
  };

  animationStateListeners.forEach(c => c(newState, oldState));

  return (AnimationState = newState);
};

export const onAnimationStateChange = (
	cb: (newState: AnimationState, oldState: AnimationState) => void
): (() => void) => {
  const i = animationStateListeners.push(cb);
  return () => {
    animationStateListeners.splice(i - 1, 1);
  };
};
