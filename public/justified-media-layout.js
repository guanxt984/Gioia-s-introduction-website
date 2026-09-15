export function enumeratePartitions(assets) {
  if (!assets.length) return [[]];
  const partitions = [];
  const breakCount = Math.max(0, assets.length - 1);
  for (let mask = 0; mask < 2 ** breakCount; mask += 1) {
    const rows = [[assets[0]]];
    for (let index = 1; index < assets.length; index += 1) {
      if (mask & (1 << (index - 1))) rows.push([]);
      rows.at(-1).push(assets[index]);
    }
    partitions.push(rows);
  }
  return partitions;
}

export function solveJustifiedMosaic(assets, maxWidth, maxHeight, gap, candidatePartitions = enumeratePartitions(assets)) {
  let best = null;
  candidatePartitions.forEach(rows => {
    const sums = rows.map(row => row.reduce((sum, asset) => sum + asset.aspect, 0));
    const inverseSum = sums.reduce((sum, value) => sum + 1 / value, 0);
    const weightedInnerGaps = rows.reduce((sum, row, index) => sum + gap * (row.length - 1) / sums[index], 0);
    const rowGaps = gap * (rows.length - 1);
    const width = Math.min(maxWidth, (maxHeight - rowGaps + weightedInnerGaps) / inverseSum);
    const heights = rows.map((row, index) => (width - gap * (row.length - 1)) / sums[index]);
    if (width <= 0 || heights.some(height => height <= 0)) return;
    const height = heights.reduce((sum, value) => sum + value, 0) + rowGaps;
    if (height > maxHeight + 0.5) return;
    const mediaArea = rows.reduce((total, row, rowIndex) => total + row.reduce((sum, asset) => sum + asset.aspect * heights[rowIndex] ** 2, 0), 0);
    const outlinePenalty = Math.abs(Math.log(width / height));
    const meanHeight = heights.reduce((sum, value) => sum + value, 0) / heights.length;
    const variancePenalty = heights.reduce((sum, value) => sum + Math.abs(value - meanHeight), 0) / (meanHeight * heights.length);
    const score = mediaArea / (1 + outlinePenalty * 0.09 + variancePenalty * 0.035);
    if (!best || score > best.score) best = { rows, width, height, heights, score, mediaArea };
  });
  return best;
}
