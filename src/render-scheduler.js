export function createRenderScheduler({ requestFrame, cancelFrame, renderFrame }) {
  let active = false;
  let frameId = 0;

  const schedule = () => {
    if (!active || frameId) return;
    frameId = requestFrame(run);
  };

  const run = time => {
    frameId = 0;
    if (!active) return;
    const keepRendering = renderFrame(time) === true;
    if (keepRendering) schedule();
  };

  return {
    start() {
      if (active) return;
      active = true;
      schedule();
    },
    stop() {
      active = false;
      if (frameId) {
        cancelFrame(frameId);
        frameId = 0;
      }
    },
    invalidate() {
      schedule();
    },
    isActive() {
      return active;
    },
  };
}
