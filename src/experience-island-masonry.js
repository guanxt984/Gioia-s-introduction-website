export function layoutExperienceMasonry(items = [], { width = 0, columns = 2, gap = 0 } = {}) {
  const source = Array.isArray(items) ? items : [];
  const safeWidth = Math.max(0, Number(width) || 0);
  const safeGap = Math.max(0, Number(gap) || 0);
  const requestedColumns = Math.max(1, Math.floor(Number(columns) || 1));
  const columnCount = Math.min(requestedColumns, Math.max(source.length, 1));
  const columnWidth = columnCount === 1
    ? safeWidth
    : Math.max(0, (safeWidth - safeGap * (columnCount - 1)) / columnCount);
  const columnHeights = Array.from({ length: columnCount }, () => 0);
  const placements = source.map((item, index) => {
    const column = columnHeights.reduce((shortest, height, candidate) => (
      height < columnHeights[shortest] ? candidate : shortest
    ), 0);
    const y = columnHeights[column];
    const height = Math.max(0, Number(item?.height) || 0);
    columnHeights[column] = y + height + safeGap;
    return {
      ...item,
      index,
      column,
      x: column * (columnWidth + safeGap),
      y,
      width: columnWidth,
    };
  });

  return {
    columns: columnCount,
    columnWidth,
    height: placements.length ? Math.max(...columnHeights) - safeGap : 0,
    placements,
  };
}
