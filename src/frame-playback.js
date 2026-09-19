function imageIsReady(image) {
  return Boolean(image?.complete && image.naturalWidth > 0);
}

function waitForImageDecode(image) {
  if (typeof image?.decode !== "function") return Promise.resolve(image);
  return image.decode().catch(() => undefined).then(() => image);
}

export function createFrameImageCache({ imageFactory = () => new Image() } = {}) {
  const entries = new Map();

  function createEntry(source) {
    const image = imageFactory();
    image.decoding = "async";
    let resolveReady;
    let rejectReady;
    let settled = false;
    const ready = new Promise((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });
    const resolveImage = () => {
      if (settled) return;
      settled = true;
      waitForImageDecode(image).then(resolveReady);
    };
    const rejectImage = error => {
      if (settled) return;
      settled = true;
      rejectReady(error || new Error(`Unable to load animation frame: ${source}`));
    };

    if (typeof image.addEventListener === "function") {
      image.addEventListener("load", resolveImage, { once: true });
      image.addEventListener("error", rejectImage, { once: true });
    } else {
      image.onload = resolveImage;
      image.onerror = rejectImage;
    }
    image.src = source;
    if (imageIsReady(image)) queueMicrotask(resolveImage);
    return { image, ready };
  }

  function get(source) {
    if (!entries.has(source)) entries.set(source, createEntry(source));
    return entries.get(source);
  }

  return {
    get: source => get(source).image,
    load: source => get(source).ready,
    preload: sources => {
      for (const source of sources) get(source);
    },
    size: () => entries.size,
  };
}

export function createFrameSequencePlayer({
  frameCount,
  frameDuration,
  pauseDuration = 0,
  loadFrame,
  renderFrame,
  schedule = setTimeout,
  cancelSchedule = clearTimeout,
}) {
  let running = false;
  let nextFrame = 1;
  let timer = null;
  let runToken = 0;

  function scheduleNext(token, delay) {
    timer = schedule(() => {
      timer = null;
      step(token);
    }, delay);
  }

  function step(token) {
    if (!running || token !== runToken) return;
    const frame = nextFrame;
    Promise.resolve()
      .then(() => loadFrame(frame))
      .then(() => {
        if (!running || token !== runToken) return;
        renderFrame(frame);
        nextFrame = frame === frameCount ? 1 : frame + 1;
        scheduleNext(token, frame === frameCount ? pauseDuration : frameDuration);
      })
      .catch(() => {
        if (running && token === runToken) scheduleNext(token, frameDuration);
      });
  }

  return {
    start() {
      if (running) return;
      running = true;
      nextFrame = 1;
      const token = ++runToken;
      step(token);
    },
    stop() {
      running = false;
      runToken += 1;
      if (timer !== null) cancelSchedule(timer);
      timer = null;
    },
    isRunning: () => running,
  };
}
