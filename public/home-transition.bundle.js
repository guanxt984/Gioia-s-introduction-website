// src/home-transition.js
var FRAME_COUNT = 143;
var FRAME_END_PROGRESS = 0.5;
var FRAME_ROOT = "./assets/home-to-directory";
var DIRECTORY_FRAME_COUNT = 60;
var DIRECTORY_FRAME_ROOT = "./assets/directory-transition";
var DIRECTORY_ENTRY_END_PROGRESS = 1 / 6;
var SEQUEL_FRAME_COUNT = 97;
var SEQUEL_FRAME_ROOT = "./assets/directory-sequel";
var SEQUEL_FRAME_DURATION = 1e3 / 30;
var SEQUEL_PAUSE_DURATION = 1e3;
var DESTINATION_FRAME_COUNT = 249;
var DESTINATION_FRAME_ROOT = "./assets/destination-transition";
var DESTINATION_FRAME_DURATION = 1e3 / 15;
var DESTINATION_PAUSE_DURATION = 0;
function frameIndexForProgress(progress) {
  const normalized = Math.min(1, Math.max(0, progress) / FRAME_END_PROGRESS);
  return Math.round(1 + normalized * (FRAME_COUNT - 1));
}
function frameIsForeground(progress) {
  return progress >= 1 / 8;
}
function directoryFrameIndexForProgress(progress) {
  const normalized = Math.min(1, Math.max(0, progress) / DIRECTORY_ENTRY_END_PROGRESS);
  return Math.round(1 + normalized * (DIRECTORY_FRAME_COUNT - 1));
}
function directoryProgressForScroll(scrollTop, viewport) {
  return scrollTop / Math.max(1, viewport) - FRAME_END_PROGRESS;
}
function sequelFrameIndexAtElapsed(elapsedMs) {
  const playbackDuration = SEQUEL_FRAME_COUNT * SEQUEL_FRAME_DURATION;
  const cycleDuration = playbackDuration + SEQUEL_PAUSE_DURATION;
  const cycleElapsed = Math.max(0, elapsedMs) % cycleDuration;
  if (cycleElapsed >= playbackDuration) return SEQUEL_FRAME_COUNT;
  return Math.min(SEQUEL_FRAME_COUNT, Math.floor(cycleElapsed / SEQUEL_FRAME_DURATION) + 1);
}
function nextSequelLatched(latched, directoryProgress) {
  if (directoryProgress <= 0) return false;
  if (directoryProgress >= DIRECTORY_ENTRY_END_PROGRESS) return true;
  return latched;
}
function destinationFrameIndexAtElapsed(elapsedMs) {
  const playbackDuration = DESTINATION_FRAME_COUNT * DESTINATION_FRAME_DURATION;
  const cycleDuration = playbackDuration + DESTINATION_PAUSE_DURATION;
  const cycleElapsed = Math.max(0, elapsedMs) % cycleDuration;
  if (cycleElapsed >= playbackDuration) return DESTINATION_FRAME_COUNT;
  return Math.min(DESTINATION_FRAME_COUNT, Math.floor(cycleElapsed / DESTINATION_FRAME_DURATION) + 1);
}
function scrollTopFor(scroller, viewport = window) {
  return Number.isFinite(scroller?.scrollTop) ? scroller.scrollTop : viewport.scrollY;
}
function frameSource(index) {
  return `${FRAME_ROOT}/frame_${String(index).padStart(6, "0")}.png`;
}
function directoryFrameSource(index) {
  return `${DIRECTORY_FRAME_ROOT}/frame_${String(index).padStart(5, "0")}.png`;
}
function sequelFrameSource(index) {
  return `${SEQUEL_FRAME_ROOT}/frame_${String(index).padStart(6, "0")}.png`;
}
function destinationFrameSource(index) {
  return `${DESTINATION_FRAME_ROOT}/frame_${String(index).padStart(5, "0")}.png`;
}
function preloadFrames() {
  const order = [1, 36, 72, 108, 143];
  for (let index = 1; index <= FRAME_COUNT; index += 1) {
    if (!order.includes(index)) order.push(index);
  }
  order.forEach((index) => {
    const image = new Image();
    image.decoding = "async";
    image.src = frameSource(index);
  });
}
function preloadDirectoryFrames() {
  for (let index = 1; index <= DIRECTORY_FRAME_COUNT; index += 1) {
    const image = new Image();
    image.decoding = "async";
    image.src = directoryFrameSource(index);
  }
}
function preloadSequelFrames() {
  for (let index = 1; index <= SEQUEL_FRAME_COUNT; index += 1) {
    const image = new Image();
    image.decoding = "async";
    image.src = sequelFrameSource(index);
  }
}
function preloadDestinationFrames() {
  let index = 1;
  function loadBatch() {
    const end = Math.min(DESTINATION_FRAME_COUNT, index + 7);
    for (; index <= end; index += 1) {
      const image = new Image();
      image.decoding = "async";
      image.src = destinationFrameSource(index);
    }
    if (index <= DESTINATION_FRAME_COUNT) setTimeout(loadBatch, 40);
  }
  loadBatch();
}
function mountHomeTransition() {
  const home = document.getElementById("home");
  const preview = home?.querySelector(".home-transition-frame-preview");
  if (!home || !preview || preview.dataset.transitionMounted === "true") return;
  preview.dataset.transitionMounted = "true";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scroller = document.body.scrollHeight > document.documentElement.scrollHeight ? document.body : document.scrollingElement;
  let renderedFrame = 0;
  let ticking = false;
  let drag = null;
  function paint() {
    ticking = false;
    const viewport = Math.max(1, window.innerHeight);
    const scrollTop = scrollTopFor(scroller);
    const progress = Math.min(1, Math.max(0, scrollTop / viewport));
    const frame = frameIndexForProgress(progress);
    const active = !reducedMotion.matches && scrollTop < viewport;
    preview.hidden = !active;
    preview.classList.toggle("is-frame-foreground", frameIsForeground(progress));
    if (active && frame !== renderedFrame) {
      preview.src = frameSource(frame);
      renderedFrame = frame;
    }
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
  document.addEventListener("pointerdown", (event) => {
    const scrollTop = scrollTopFor(scroller);
    if (event.button !== 0 || isInteractive(event.target) || scrollTop >= window.innerHeight - 1) return;
    drag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScroll: scrollTop,
      moved: false,
      target: event.target
    };
    drag.target.setPointerCapture?.(event.pointerId);
    document.documentElement.classList.add("is-home-transition-dragging");
  });
  document.addEventListener("pointermove", (event) => {
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
function mountDirectoryTransition() {
  const resume = document.getElementById("resume");
  const preview = resume?.querySelector(".directory-transition-frame-preview");
  if (!resume || !preview || preview.dataset.transitionMounted === "true") return;
  preview.dataset.transitionMounted = "true";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scroller = document.body.scrollHeight > document.documentElement.scrollHeight ? document.body : document.scrollingElement;
  let renderedSource = "";
  let ticking = false;
  let sequelStartedAt = null;
  let sequelAnimationFrame = 0;
  let sequelLatched = false;
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
    preview.src = source;
    renderedSource = source;
  }
  function startSequel() {
    if (sequelStartedAt !== null) return;
    sequelStartedAt = performance.now();
    setPreviewSource(sequelFrameSource(1));
    sequelAnimationFrame = requestAnimationFrame(animateSequel);
  }
  function stopSequel() {
    if (sequelAnimationFrame) cancelAnimationFrame(sequelAnimationFrame);
    sequelAnimationFrame = 0;
    sequelStartedAt = null;
  }
  function animateSequel(timestamp) {
    const { viewport, scrollTop, progress } = state();
    if (reducedMotion.matches || !sequelLatched || scrollTop >= viewport * 2) {
      stopSequel();
      return;
    }
    setPreviewSource(sequelFrameSource(sequelFrameIndexAtElapsed(timestamp - sequelStartedAt)));
    sequelAnimationFrame = requestAnimationFrame(animateSequel);
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
function mountDestinationTransition() {
  const destination = document.getElementById("destination");
  const preview = destination?.querySelector(".destination-animation-frame-preview");
  if (!destination || !preview || preview.dataset.transitionMounted === "true") return;
  preview.dataset.transitionMounted = "true";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let active = false;
  let startedAt = null;
  let renderedFrame = 1;
  let animationFrame = 0;
  function stop() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    startedAt = null;
  }
  function start() {
    if (!active || document.hidden || reducedMotion.matches || startedAt !== null) return;
    startedAt = performance.now();
    renderedFrame = 1;
    preview.src = destinationFrameSource(1);
    animationFrame = requestAnimationFrame(animate);
  }
  function animate(timestamp) {
    if (!active || document.hidden || reducedMotion.matches) {
      stop();
      return;
    }
    const frame = destinationFrameIndexAtElapsed(timestamp - startedAt);
    if (frame !== renderedFrame) {
      preview.src = destinationFrameSource(frame);
      renderedFrame = frame;
    }
    animationFrame = requestAnimationFrame(animate);
  }
  const observer = new IntersectionObserver((entries) => {
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
      preview.src = destinationFrameSource(1);
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
export {
  destinationFrameIndexAtElapsed,
  directoryFrameIndexForProgress,
  directoryProgressForScroll,
  frameIndexForProgress,
  frameIsForeground,
  mountDestinationTransition,
  mountDirectoryTransition,
  mountHomeTransition,
  nextSequelLatched,
  scrollTopFor,
  sequelFrameIndexAtElapsed
};
