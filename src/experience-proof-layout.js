const DEFAULT_GAP = 12;

function ratioFor(item) {
  const ratio = Number(item?.aspectRatio || (item?.width && item?.height ? item.width / item.height : 1));
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}

function compositions(length) {
  if (length <= 1) return [[length]];
  const result = [];
  const masks = 1 << (length - 1);
  for (let mask = 0; mask < masks; mask += 1) {
    const rows = [];
    let count = 1;
    for (let index = 0; index < length - 1; index += 1) {
      if (mask & (1 << index)) {
        rows.push(count);
        count = 1;
      } else {
        count += 1;
      }
    }
    rows.push(count);
    result.push(rows);
  }
  return result;
}

function buildCandidate(items, rowSizes, width, height, gap) {
  const rows = [];
  let cursor = 0;
  let naturalHeight = 0;
  for (const count of rowSizes) {
    const rowItems = items.slice(cursor, cursor + count);
    const ratioSum = rowItems.reduce((sum, item) => sum + ratioFor(item), 0);
    const rowHeight = Math.max(1, (width - gap * Math.max(0, count - 1)) / ratioSum);
    rows.push({ items: rowItems, rowHeight });
    naturalHeight += rowHeight;
    cursor += count;
  }
  naturalHeight += gap * Math.max(0, rows.length - 1);

  const scale = naturalHeight > height && height > 0 ? height / naturalHeight : 1;
  const renderedWidth = width * scale;
  const renderedHeight = naturalHeight * scale;
  const leftOffset = Math.max(0, (width - renderedWidth) / 2);
  const topOffset = Math.max(0, (height - renderedHeight) / 2);
  const placements = [];
  let y = topOffset;
  let minimumDimension = Infinity;
  let area = 0;

  for (const row of rows) {
    const rowHeight = row.rowHeight * scale;
    const rowWidth = width * scale;
    let x = leftOffset;
    for (const item of row.items) {
      const itemWidth = ratioFor(item) * rowHeight;
      placements.push({
        key: item.id,
        x,
        y,
        width: itemWidth,
        height: rowHeight,
        item,
      });
      minimumDimension = Math.min(minimumDimension, itemWidth, rowHeight);
      area += itemWidth * rowHeight;
      x += itemWidth + gap * scale;
    }
    y += rowHeight + gap * scale;
    if (row.items.length) {
      const gapRemainder = x - leftOffset - rowWidth;
      if (Math.abs(gapRemainder) > 0.5) placements[placements.length - 1].width += gapRemainder;
    }
  }

  const availableArea = Math.max(1, width * Math.max(1, height));
  const fill = area / availableArea;
  const minimumScore = Math.min(1, minimumDimension / Math.max(1, Math.min(width, height)));
  const verticalFill = Math.min(1, renderedHeight / Math.max(1, height));
  const rowPenalty = rowSizes.length * 0.012;
  const score = fill * 0.56 + minimumScore * 0.28 + verticalFill * 0.18 - rowPenalty;

  return { placements, width: renderedWidth, height: renderedHeight, score, rowSizes };
}

export function chooseProofLayout(items = [], { width = 0, height = 0, gap = DEFAULT_GAP } = {}) {
  const usableWidth = Math.max(1, Number(width) || 1);
  const usableHeight = Math.max(1, Number(height) || 1);
  if (!items.length) return { placements: [], width: usableWidth, height: 0, score: 0, rowSizes: [] };

  return compositions(items.length)
    .map(rowSizes => buildCandidate(items, rowSizes, usableWidth, usableHeight, gap))
    .sort((left, right) => right.score - left.score)[0];
}

export function proofAvailableRect(proofElement, { viewportHeight = typeof window === "undefined" ? 0 : window.innerHeight, bottomSafeGap = 32 } = {}) {
  const rect = proofElement?.getBoundingClientRect?.();
  const width = Math.max(1, rect?.width || 1);
  const availableHeight = Number(viewportHeight) - (rect?.top || 0) - bottomSafeGap;
  return { width, height: Math.max(180, availableHeight) };
}
