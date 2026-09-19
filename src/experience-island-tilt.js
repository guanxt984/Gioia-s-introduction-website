const DEFAULTS = {
  maxTilt: 4,
  perspective: 1000,
  scale: 1.012,
  returnDuration: 380,
  shadowMaxX: 6,
  shadowMaxY: 7,
  shadowMaxBlur: 22,
  shadowMaxAlpha: 0.065,
};

function prefersReducedMotion(matchMedia) {
  return Boolean(matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}

function hasCoarsePointer(matchMedia) {
  return Boolean(matchMedia?.("(pointer: coarse)")?.matches);
}

function raf(callback) {
  if (typeof globalThis.requestAnimationFrame === "function") return globalThis.requestAnimationFrame(callback);
  return globalThis.setTimeout(callback, 16);
}

function cancelRaf(frame) {
  if (!frame) return;
  if (typeof globalThis.cancelAnimationFrame === "function") globalThis.cancelAnimationFrame(frame);
  else globalThis.clearTimeout(frame);
}

export function createExperienceCardTilt(wrapper, options = {}) {
  if (!wrapper) return { destroy() {} };
  const settings = { ...DEFAULTS, ...options };
  const matchMedia = options.matchMedia || globalThis.matchMedia?.bind(globalThis);
  const disabled = prefersReducedMotion(matchMedia) || hasCoarsePointer(matchMedia);
  let frame = 0;
  let latestEvent = null;
  let active = false;

  const setShadow = (x = 0, y = 0, blur = 0, alpha = 0) => {
    const zero = value => value === 0 ? "0px" : `${value.toFixed(2)}px`;
    wrapper.style.setProperty?.("--card-shadow-x", zero(x));
    wrapper.style.setProperty?.("--card-shadow-y", zero(y));
    wrapper.style.setProperty?.("--card-shadow-blur", zero(blur));
    wrapper.style.setProperty?.("--card-shadow-alpha", alpha === 0 ? "0" : alpha.toFixed(3));
  };

  const reset = () => {
    wrapper.style.transition = `transform ${settings.returnDuration}ms ease, box-shadow ${settings.returnDuration}ms ease`;
    wrapper.style.transform = `perspective(${settings.perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    setShadow();
  };

  if (disabled) {
    return { destroy() {} };
  }

  const paint = () => {
    frame = 0;
    if (!active || !latestEvent) return;
    const rect = wrapper.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(-1, Math.min(1, ((latestEvent.clientX - rect.left) / rect.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((latestEvent.clientY - rect.top) / rect.height) * 2 - 1));
    const rotateX = -(y * settings.maxTilt);
    const rotateY = x * settings.maxTilt;
    const intensity = Math.min(1, Math.hypot(x, y));
    const shadowX = -x * settings.shadowMaxX;
    const shadowY = -y * settings.shadowMaxY;
    const shadowBlur = intensity * settings.shadowMaxBlur;
    const shadowAlpha = intensity * settings.shadowMaxAlpha;
    wrapper.style.transition = "none";
    wrapper.style.transform = `perspective(${settings.perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${settings.scale})`;
    setShadow(shadowX, shadowY, shadowBlur, shadowAlpha);
  };

  const schedule = () => {
    if (!frame) frame = raf(paint);
  };
  const onEnter = event => {
    if (event?.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    active = true;
    latestEvent = event;
    schedule();
  };
  const onMove = event => {
    if (event?.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    active = true;
    latestEvent = event;
    schedule();
  };
  const onLeave = () => {
    active = false;
    latestEvent = null;
    cancelRaf(frame);
    frame = 0;
    reset();
  };

  wrapper.addEventListener("pointerenter", onEnter);
  wrapper.addEventListener("pointermove", onMove);
  wrapper.addEventListener("pointerleave", onLeave);
  wrapper.addEventListener("pointercancel", onLeave);

  return {
    destroy() {
      cancelRaf(frame);
      wrapper.removeEventListener("pointerenter", onEnter);
      wrapper.removeEventListener("pointermove", onMove);
      wrapper.removeEventListener("pointerleave", onLeave);
      wrapper.removeEventListener("pointercancel", onLeave);
      reset();
    },
  };
}
