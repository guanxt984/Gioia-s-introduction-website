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
