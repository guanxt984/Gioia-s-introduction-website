import { createFrameImageCache, createFrameSequencePlayer } from "./frame-playback.js";

const FRAME_COUNT = 143;
const FRAME_END_PROGRESS = 0.5;
const FRAME_ROOT = "./assets/home-to-directory";
const DIRECTORY_FRAME_COUNT = 60;
const DIRECTORY_FRAME_ROOT = "./assets/directory-transition";
const DIRECTORY_ENTRY_END_PROGRESS = 1 / 6;
const SEQUEL_FRAME_COUNT = 97;
const SEQUEL_FRAME_ROOT = "./assets/directory-sequel";
const SEQUEL_FRAME_DURATION = 1000 / 30;
const SEQUEL_PAUSE_DURATION = 1000;
const DESTINATION_FRAME_COUNT = 249;
const DESTINATION_FRAME_ROOT = "./assets/destination-transition";
const DESTINATION_FRAME_DURATION = 1000 / 15;
const DESTINATION_PAUSE_DURATION = 0;
const DIRECTORY_PROGRESS_RESET_EPSILON = 0.01;
const animationFrameCache = createFrameImageCache();

export function frameIndexForProgress(progress) {
  const normalized = Math.min(1, Math.max(0, progress) / FRAME_END_PROGRESS);
  return Math.round(1 + normalized * (FRAME_COUNT - 1));
}

export function frameIsForeground(progress) {
  return progress >= 1 / 8;
}

export function directoryFrameIndexForProgress(progress) {
  const normalized = Math.min(1, Math.max(0, progress) / DIRECTORY_ENTRY_END_PROGRESS);
  return Math.round(1 + normalized * (DIRECTORY_FRAME_COUNT - 1));
}

export function directoryProgressForScroll(scrollTop, viewport) {
  return scrollTop / Math.max(1, viewport) - FRAME_END_PROGRESS;
}

export function sequelFrameIndexAtElapsed(elapsedMs) {
  const playbackDuration = SEQUEL_FRAME_COUNT * SEQUEL_FRAME_DURATION;
  const cycleDuration = playbackDuration + SEQUEL_PAUSE_DURATION;
  const cycleElapsed = Math.max(0, elapsedMs) % cycleDuration;
  if (cycleElapsed >= playbackDuration) return SEQUEL_FRAME_COUNT;
  return Math.min(SEQUEL_FRAME_COUNT, Math.floor(cycleElapsed / SEQUEL_FRAME_DURATION) + 1);
}

export function nextSequelLatched(latched, directoryProgress) {
  if (directoryProgress <= DIRECTORY_PROGRESS_RESET_EPSILON) return false;
  if (directoryProgress >= DIRECTORY_ENTRY_END_PROGRESS) return true;
  return latched;
}

export function destinationFrameIndexAtElapsed(elapsedMs) {
  const playbackDuration = DESTINATION_FRAME_COUNT * DESTINATION_FRAME_DURATION;
  const cycleDuration = playbackDuration + DESTINATION_PAUSE_DURATION;
  const cycleElapsed = Math.max(0, elapsedMs) % cycleDuration;
  if (cycleElapsed >= playbackDuration) return DESTINATION_FRAME_COUNT;
  return Math.min(DESTINATION_FRAME_COUNT, Math.floor(cycleElapsed / DESTINATION_FRAME_DURATION) + 1);
}

export function scrollTopFor(scroller, viewport = window) {
  return Number.isFinite(scroller?.scrollTop) ? scroller.scrollTop : viewport.scrollY;
}

function frameSource(index) {
  return `${FRAME_ROOT}/frame_${String(index).padStart(6, "0")}.webp`;
}

function directoryFrameSource(index) {
  return `${DIRECTORY_FRAME_ROOT}/frame_${String(index).padStart(5, "0")}.webp`;
}

function sequelFrameSource(index) {
  return `${SEQUEL_FRAME_ROOT}/frame_${String(index).padStart(6, "0")}.webp`;
}

function destinationFrameSource(index) {
  return `${DESTINATION_FRAME_ROOT}/frame_${String(index).padStart(5, "0")}.webp`;
}

function preloadFrames() {
  const order = [1, 36, 72, 108, 143];
  for (let index = 1; index <= FRAME_COUNT; index += 1) {
    if (!order.includes(index)) order.push(index);
  }
  animationFrameCache.preload(order.map(frameSource));
}

function preloadDirectoryFrames() {
  animationFrameCache.preload(Array.from({ length: DIRECTORY_FRAME_COUNT }, (_, index) => directoryFrameSource(index + 1)));
}

function preloadSequelFrames() {
  animationFrameCache.preload(Array.from({ length: SEQUEL_FRAME_COUNT }, (_, index) => sequelFrameSource(index + 1)));
}

function preloadDestinationFrames() {
  let index = 1;
  function loadBatch() {
    const end = Math.min(DESTINATION_FRAME_COUNT, index + 7);
    animationFrameCache.preload(Array.from({ length: end - index + 1 }, (_, offset) => destinationFrameSource(index + offset)));
    index = end + 1;
    if (index <= DESTINATION_FRAME_COUNT) setTimeout(loadBatch, 40);
  }
  loadBatch();
}

export function mountHomeTransition() {
  const home = document.getElementById("home");
  const preview = home?.querySelector(".home-transition-frame-preview");
  if (!home || !preview || preview.dataset.transitionMounted === "true") return;

  preview.dataset.transitionMounted = "true";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scroller = document.body.scrollHeight > document.documentElement.scrollHeight
    ? document.body
    : document.scrollingElement;
  let renderedFrame = 0;
  let requestedFrame = 0;
  let frameRequestToken = 0;
  let active = false;
  let ticking = false;
  let drag = null;

  function paint() {
    ticking = false;
    const viewport = Math.max(1, window.innerHeight);
    const scrollTop = scrollTopFor(scroller);
    const progress = Math.min(1, Math.max(0, scrollTop / viewport));
    const frame = frameIndexForProgress(progress);
    active = !reducedMotion.matches && scrollTop < viewport;

    preview.hidden = !active;
    preview.classList.toggle("is-frame-foreground", frameIsForeground(progress));
    if (active && frame !== renderedFrame) requestFrame(frame);
  }

  function requestFrame(frame) {
    if (frame === requestedFrame) return;
    requestedFrame = frame;
    const token = ++frameRequestToken;
    animationFrameCache.load(frameSource(frame)).then(() => {
      if (!active || token !== frameRequestToken || requestedFrame !== frame) return;
      preview.src = frameSource(frame);
      renderedFrame = frame;
    }).catch(() => {});
  }

  function requestPaint() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(paint);
    }
  }

  function isInteractive(target) {
    return target instanceof Element && Boolean(target.closest("a, button, input, textarea, select, video, dialog"));
  }

  document.addEventListener("pointerdown", event => {
    const scrollTop = scrollTopFor(scroller);
    if (event.button !== 0 || isInteractive(event.target) || scrollTop >= window.innerHeight - 1) return;
    drag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScroll: scrollTop,
      moved: false,
      target: event.target,
    };
    drag.target.setPointerCapture?.(event.pointerId);
    document.documentElement.classList.add("is-home-transition-dragging");
  });

  document.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const distance = drag.startY - event.clientY;
    drag.moved ||= Math.abs(distance) > 6;
    if (!drag.moved) return;
    event.preventDefault();
    scroller.scrollTo(0, Math.min(window.innerHeight, Math.max(0, drag.startScroll + distance)));
  }, { passive: false });

  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.target.releasePointerCapture?.(event.pointerId);
    const shouldSnap = drag.moved;
    drag = null;
    document.documentElement.classList.remove("is-home-transition-dragging");
    if (!shouldSnap) return;
    const destination = scrollTopFor(scroller) >= window.innerHeight * FRAME_END_PROGRESS ? window.innerHeight : 0;
    scroller.scrollTo({ top: destination, behavior: reducedMotion.matches ? "auto" : "smooth" });
  }

  document.addEventListener("pointerup", finishDrag);
  document.addEventListener("pointercancel", finishDrag);
  scroller.addEventListener("scroll", requestPaint, { passive: true });
  window.addEventListener("resize", requestPaint, { passive: true });
  reducedMotion.addEventListener?.("change", requestPaint);

  preloadFrames();
  paint();
}

export function mountDirectoryTransition() {
  const resume = document.getElementById("resume");
  const preview = resume?.querySelector(".directory-transition-frame-preview");
  if (!resume || !preview || preview.dataset.transitionMounted === "true") return;

  preview.dataset.transitionMounted = "true";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scroller = document.body.scrollHeight > document.documentElement.scrollHeight
    ? document.body
    : document.scrollingElement;
  let renderedSource = "";
  let previewRequestToken = 0;
  let ticking = false;
  let sequelLatched = false;
  const sequelPlayback = createFrameSequencePlayer({
    frameCount: SEQUEL_FRAME_COUNT,
    frameDuration: SEQUEL_FRAME_DURATION,
    pauseDuration: SEQUEL_PAUSE_DURATION,
    loadFrame: frame => animationFrameCache.load(sequelFrameSource(frame)),
    renderFrame: frame => {
      const source = sequelFrameSource(frame);
      preview.src = source;
      renderedSource = source;
    },
  });

  function state() {
    const viewport = Math.max(1, window.innerHeight);
    const scrollTop = scrollTopFor(scroller);
    return { viewport, scrollTop, progress: directoryProgressForScroll(scrollTop, viewport) };
  }

  function paint() {
    ticking = false;
    const { viewport, scrollTop, progress } = state();
    sequelLatched = nextSequelLatched(sequelLatched, progress);
    const active = !reducedMotion.matches && progress >= 0 && scrollTop < viewport * 2;
    preview.hidden = !active;
    if (!active) {
      stopSequel();
      return;
    }
    if (!sequelLatched) {
      stopSequel();
      setPreviewSource(directoryFrameSource(directoryFrameIndexForProgress(progress)));
    } else {
      startSequel();
    }
  }

  function setPreviewSource(source) {
    if (source === renderedSource) return;
    const token = ++previewRequestToken;
    animationFrameCache.load(source).then(() => {
      if (token !== previewRequestToken || sequelPlayback.isRunning()) return;
      preview.src = source;
      renderedSource = source;
    }).catch(() => {});
  }

  function startSequel() {
    if (sequelPlayback.isRunning()) return;
    previewRequestToken += 1;
    sequelPlayback.start();
  }

  function stopSequel() {
    previewRequestToken += 1;
    sequelPlayback.stop();
  }

  function requestPaint() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(paint);
    }
  }

  scroller.addEventListener("scroll", requestPaint, { passive: true });
  window.addEventListener("resize", requestPaint, { passive: true });
  reducedMotion.addEventListener?.("change", requestPaint);

  preloadDirectoryFrames();
  preloadSequelFrames();
  paint();
}

export function mountDestinationTransition() {
  const destination = document.getElementById("destination");
  const preview = destination?.querySelector(".destination-animation-frame-preview");
  if (!destination || !preview || preview.dataset.transitionMounted === "true") return;

  preview.dataset.transitionMounted = "true";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let active = false;
  const destinationPlayback = createFrameSequencePlayer({
    frameCount: DESTINATION_FRAME_COUNT,
    frameDuration: DESTINATION_FRAME_DURATION,
    pauseDuration: DESTINATION_PAUSE_DURATION,
    loadFrame: frame => animationFrameCache.load(destinationFrameSource(frame)),
    renderFrame: frame => {
      if (!active || document.hidden || reducedMotion.matches) return;
      preview.src = destinationFrameSource(frame);
    },
  });

  function stop() {
    destinationPlayback.stop();
  }

  function start() {
    if (!active || document.hidden || reducedMotion.matches) return;
    destinationPlayback.start();
  }

  const observer = new IntersectionObserver(entries => {
    active = entries[0]?.intersectionRatio >= 0.5;
    if (active) start();
    else stop();
  }, { threshold: [0, 0.5, 1] });
  observer.observe(destination);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
  reducedMotion.addEventListener?.("change", () => {
    if (reducedMotion.matches) {
      stop();
      animationFrameCache.load(destinationFrameSource(1)).then(() => {
        if (reducedMotion.matches) preview.src = destinationFrameSource(1);
      }).catch(() => {});
    } else {
      start();
    }
  });

  preloadDestinationFrames();
}

if (typeof window !== "undefined") {
  window.addEventListener("portfolio:ready", () => {
    mountHomeTransition();
    mountDirectoryTransition();
    mountDestinationTransition();
  }, { once: true });
  if (document.getElementById("home")) {
    mountHomeTransition();
    mountDirectoryTransition();
    mountDestinationTransition();
  }
}
