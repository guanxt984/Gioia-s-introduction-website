import assert from "node:assert/strict";
import { createExperienceCardTilt } from "../src/experience-island-tilt.js";

const listeners = new Map();
const cssVars = new Map();
const wrapper = {
  style: {
    transform: "",
    transition: "",
    setProperty(name, value) { cssVars.set(name, value); },
    getPropertyValue(name) { return cssVars.get(name) || ""; },
  },
  addEventListener(type, handler) { listeners.set(type, handler); },
  removeEventListener() {},
  getBoundingClientRect() { return { left: 0, top: 0, width: 200, height: 100 }; },
};

const frameQueue = [];
const restore = globalThis.requestAnimationFrame;
globalThis.requestAnimationFrame = callback => { frameQueue.push(callback); return frameQueue.length; };

const controller = createExperienceCardTilt(wrapper, {
  matchMedia: query => ({ matches: query.includes("reduced-motion") ? false : false }),
  maxTilt: 4,
  perspective: 1000,
  scale: 1.01,
  returnDuration: 360,
});

listeners.get("pointerenter")?.({ pointerType: "mouse" });
listeners.get("pointermove")?.({ clientX: 190, clientY: 90, pointerType: "mouse" });
frameQueue.shift()?.();
assert.match(wrapper.style.transform, /perspective\(1000px\)/);
assert.match(wrapper.style.transform, /rotateX\(-[0-9.]+deg\)/);
assert.match(wrapper.style.transform, /rotateY\([0-9.]+deg\)/);
assert.match(wrapper.style.getPropertyValue("--card-shadow-x"), /-[0-9.]+px/);
assert.match(wrapper.style.getPropertyValue("--card-shadow-y"), /-[0-9.]+px/);
assert.match(wrapper.style.getPropertyValue("--card-shadow-blur"), /[0-9.]+px/);
assert.ok(Number(wrapper.style.getPropertyValue("--card-shadow-alpha")) > 0);
assert.ok(Math.abs(Number.parseFloat(wrapper.style.getPropertyValue("--card-shadow-x"))) <= 6);
assert.ok(Math.abs(Number.parseFloat(wrapper.style.getPropertyValue("--card-shadow-y"))) <= 7);
assert.ok(Number(wrapper.style.getPropertyValue("--card-shadow-alpha")) <= 0.065);

listeners.get("pointerleave")?.();
assert.equal(wrapper.style.transition, "transform 360ms ease, box-shadow 360ms ease");
assert.match(wrapper.style.transform, /rotateX\(0deg\).*rotateY\(0deg\).*scale\(1\)/);
assert.equal(wrapper.style.getPropertyValue("--card-shadow-x"), "0px");
assert.equal(wrapper.style.getPropertyValue("--card-shadow-y"), "0px");
assert.equal(wrapper.style.getPropertyValue("--card-shadow-blur"), "0px");
assert.equal(wrapper.style.getPropertyValue("--card-shadow-alpha"), "0");

controller.destroy();
globalThis.requestAnimationFrame = restore;

const reducedWrapper = { style: { transform: "sentinel", transition: "" }, addEventListener() {}, removeEventListener() {} };
createExperienceCardTilt(reducedWrapper, { matchMedia: query => ({ matches: query.includes("reduced-motion") }) });
assert.equal(reducedWrapper.style.transform, "sentinel", "reduced motion must disable tilt");

const coarseWrapper = { style: { transform: "sentinel", transition: "" }, addEventListener() {}, removeEventListener() {} };
createExperienceCardTilt(coarseWrapper, { matchMedia: query => ({ matches: query.includes("pointer: coarse") }) });
assert.equal(coarseWrapper.style.transform, "sentinel", "coarse pointers must disable tilt");

console.log("PASS: experience card tilt follows pointer and returns smoothly");
