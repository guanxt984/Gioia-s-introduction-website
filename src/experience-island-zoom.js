export function experienceIslandZoomRange(fitDistance) {
  if (!Number.isFinite(fitDistance) || fitDistance <= 0) {
    throw new RangeError("fitDistance must be a finite positive number");
  }

  return {
    minDistance: fitDistance / 1.5,
    initialDistance: fitDistance / 1.3,
    maxDistance: fitDistance,
  };
}

export function preserveOrbitDistance(camera, target, range) {
  const offset = camera.position.clone().sub(target);
  const distance = offset.length();
  const clamped = Math.min(range.maxDistance, Math.max(range.minDistance, distance));
  if (distance > 0 && clamped !== distance) {
    camera.position.copy(target).add(offset.multiplyScalar(clamped / distance));
  }
}
