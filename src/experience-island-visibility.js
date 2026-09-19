export function selectFrontIsland(islands) {
  return islands.reduce((front, island) => {
    if (!front || island.depth > front.depth) return island;
    return front;
  }, null)?.category ?? null;
}

export const ISLAND_STABILITY_MS = 120;

export function createIslandStabilizer(delay = ISLAND_STABILITY_MS) {
  let active = null;
  let candidate = null;
  let since = 0;
  const stabilizer = (next, now) => {
    if (active === null) active = next;
    if (next === active || next === null) {
      candidate = null;
    } else if (next !== candidate) {
      candidate = next;
      since = now;
    } else if (now - since >= delay) {
      active = candidate;
      candidate = null;
    }
    return active;
  };
  stabilizer.reset = next => {
    active = next ?? null;
    candidate = null;
    since = 0;
    return active;
  };
  return stabilizer;
}

// Rectangles are measured at the largest visual scale, avoiding hover layout jitter.
// Preserve important labels even if the bounded search cannot resolve every overlap.
export function layoutProjectLabels(labels, activeCategory, selectedKey, hoveredKey, previousOffsets = new Map()) {
  const priority = item => item.key === selectedKey ? 3 : item.key === hoveredKey ? 2 : item.category === activeCategory ? 1 : 0;
  const overlaps = (a, b) => a.x < b.x + b.width + 4 && a.x + a.width + 4 > b.x
    && a.y < b.y + b.height + 4 && a.y + a.height + 4 > b.y;
  const placed = [];
  [...labels].sort((a, b) => priority(b) - priority(a) || b.depth - a.depth || a.key.localeCompare(b.key)).forEach(label => {
    const important = priority(label) > 0;
    // A hovered hit target must stay under the pointer when its priority changes.
    const previous = previousOffsets.get(label.key);
    const preservedOffset = previous && typeof previous === "object"
      ? Number(previous.top) - label.y
      : previous;
    const offsets = label.key === hoveredKey && Number.isFinite(preservedOffset)
      ? [preservedOffset] : important ? [0, -16, 16, -32, 32] : [0];
    let best = null;
    let bestHits = Infinity;
    for (const offsetY of offsets) {
      const candidate = {...label, y: label.y + offsetY, offsetY};
      const hits = placed.filter(other => overlaps(candidate, other)).length;
      if (hits < bestHits) { best = candidate; bestHits = hits; }
      if (!hits) break;
    }
    if (important || bestHits === 0) placed.push(best);
  });
  return placed;
}
